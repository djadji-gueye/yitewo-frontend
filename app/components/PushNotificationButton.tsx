"use client";

import { useEffect, useState } from "react";
import { getPushStatus, subscribeToPush, unsubscribeFromPush, registerServiceWorker, PushSupport } from "@/lib/push";

interface Props {
  kind: "partner" | "admin";
  token?: string;      // pour kind="partner" (partner-portal / prestataire-portal)
  adminJwt?: string;    // pour kind="admin" (/dashboard)
  label?: string;
  dark?: boolean;       // true sur fond sombre (dashboard)
}

export default function PushNotificationButton({ kind, token, adminJwt, label, dark }: Props) {
  const [status, setStatus] = useState<PushSupport>("default");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    registerServiceWorker();
    getPushStatus().then(setStatus);
  }, []);

  if (status === "unsupported") return null; // pas de bruit visuel si non supporté

  const handleClick = async () => {
    setError("");
    setBusy(true);
    try {
      if (status === "subscribed") {
        await unsubscribeFromPush();
        setStatus("default");
      } else {
        const result = await subscribeToPush({ kind, token, adminJwt, label });
        if (result.ok) setStatus("subscribed");
        else setError(result.error || "Erreur");
      }
    } finally {
      setBusy(false);
    }
  };

  const subscribed = status === "subscribed";
  const denied = status === "denied";

  const color = dark ? "#fff" : "#1a1a1a";
  const mutedBg = dark ? "rgba(255,255,255,0.06)" : "#f7f4f2";
  const mutedBorder = dark ? "rgba(255,255,255,0.1)" : "#f0ebe8";

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={handleClick}
        disabled={busy || denied}
        title={
          denied
            ? "Notifications bloquées — active-les dans les réglages du navigateur"
            : subscribed
            ? "Notifications activées sur cet appareil"
            : "Activer les notifications de commandes/missions"
        }
        style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "6px 14px", borderRadius: 99, fontSize: 12, fontWeight: 600,
          cursor: denied ? "not-allowed" : "pointer",
          background: subscribed ? "rgba(16,185,129,0.12)" : mutedBg,
          border: `1px solid ${subscribed ? "rgba(16,185,129,0.3)" : mutedBorder}`,
          color: subscribed ? "#10b981" : denied ? "#888" : color,
          opacity: denied ? 0.6 : 1,
          whiteSpace: "nowrap",
        }}
      >
        <span>{busy ? "⏳" : subscribed ? "🔔" : "🔕"}</span>
        {subscribed ? "Notifications activées" : busy ? "…" : "Activer les notifications"}
      </button>
      {error && (
        <p style={{ position: "absolute", top: "calc(100% + 6px)", right: 0, background: "#fee2e2", color: "#991b1b", fontSize: 11, padding: "6px 10px", borderRadius: 8, whiteSpace: "nowrap", zIndex: 50 }}>
          {error}
        </p>
      )}
    </div>
  );
}
