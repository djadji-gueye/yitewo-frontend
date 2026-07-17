const BASE = process.env.NEXT_PUBLIC_URL_PROD || "http://localhost:3003";

export function isIOS(): boolean {
  if (typeof window === "undefined") return false;
  const ua = navigator.userAgent;
  const iOSDevice = /iPad|iPhone|iPod/.test(ua) || (ua.includes("Macintosh") && "ontouchend" in document);
  return iOSDevice;
}

export function isIOSChrome(): boolean {
  if (typeof window === "undefined") return false;
  return /CriOS/.test(navigator.userAgent);
}

export function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  // iOS Safari expose navigator.standalone ; les autres utilisent le media query.
  return (
    (window.navigator as any).standalone === true ||
    window.matchMedia?.("(display-mode: standalone)").matches === true
  );
}

// true = doit d'abord être installée sur l'écran d'accueil (via Safari) avant que
// Notification/PushManager fonctionnent réellement.
export function needsIOSInstallFirst(): boolean {
  return isIOS() && !isStandalone();
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}

export type PushSupport = "unsupported" | "ios-needs-install" | "denied" | "default" | "granted" | "subscribed";

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return null;
  try {
    return await navigator.serviceWorker.register("/sw.js");
  } catch {
    return null;
  }
}

export async function getPushStatus(): Promise<PushSupport> {
  if (needsIOSInstallFirst()) return "ios-needs-install";
  if (typeof window === "undefined" || !("Notification" in window) || !("serviceWorker" in navigator) || !("PushManager" in window)) {
    return "unsupported";
  }
  if (Notification.permission === "denied") return "denied";
  const reg = await navigator.serviceWorker.getRegistration();
  const existing = await reg?.pushManager.getSubscription();
  if (existing) return "subscribed";
  return Notification.permission === "granted" ? "granted" : "default";
}

interface SubscribeParams {
  kind: "partner" | "admin";
  token?: string;      // requis si kind === "partner" (token de portail)
  adminJwt?: string;    // requis si kind === "admin"
  label?: string;
}

// Demande la permission (si besoin) + crée l'abonnement push + l'envoie au backend.
// Retourne true en cas de succès.
export async function subscribeToPush({ kind, token, adminJwt, label }: SubscribeParams): Promise<{ ok: boolean; error?: string }> {
  if (typeof window === "undefined") return { ok: false, error: "SSR" };
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    return { ok: false, error: "Notifications non supportées sur cet appareil/navigateur." };
  }

  const permission = Notification.permission === "granted" ? "granted" : await Notification.requestPermission();
  if (permission !== "granted") {
    return { ok: false, error: "Permission refusée. Active les notifications dans les réglages du navigateur." };
  }

  const reg = (await navigator.serviceWorker.getRegistration()) || (await registerServiceWorker());
  if (!reg) return { ok: false, error: "Impossible d'enregistrer le service worker." };

  const keyRes = await fetch(`${BASE}/push/vapid-public-key`).then((r) => r.json());
  if (!keyRes?.publicKey) return { ok: false, error: "Push non configuré côté serveur." };

  let sub = await reg.pushManager.getSubscription();
  if (!sub) {
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(keyRes.publicKey) as BufferSource,
    });
  }

  const json = sub.toJSON();
  const body = {
    token: kind === "partner" ? token : undefined,
    endpoint: sub.endpoint,
    keys: { p256dh: json.keys?.p256dh, auth: json.keys?.auth },
    userAgent: navigator.userAgent,
    label,
  };

  const res = await fetch(`${BASE}/push/subscribe/${kind}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(kind === "admin" && adminJwt ? { Authorization: `Bearer ${adminJwt}` } : {}),
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) return { ok: false, error: "Échec de l'enregistrement côté serveur." };
  return { ok: true };
}

export async function unsubscribeFromPush(): Promise<void> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
  const reg = await navigator.serviceWorker.getRegistration();
  const sub = await reg?.pushManager.getSubscription();
  if (!sub) return;
  const endpoint = sub.endpoint;
  await sub.unsubscribe().catch(() => null);
  await fetch(`${BASE}/push/unsubscribe`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ endpoint }),
  }).catch(() => null);
}
