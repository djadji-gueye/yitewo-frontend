"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { usePlan } from "@/hooks/usePlan";
import Link from "next/link";

const BASE = process.env.NEXT_PUBLIC_URL_PROD || "http://localhost:3003";
const SUPPORT_WA = "221777259330";

export default function BusinessPage() {
  const params = useParams();
  const token = params?.token as string;

  const [partner, setPartner] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Notifications push
  const [notifMsg, setNotifMsg] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState<{ count: number; total: number } | null>(null);
  const [notifError, setNotifError] = useState("");

  useEffect(() => {
    if (!token) return;
    fetch(`${BASE}/partners/portal/${token}`)
      .then(r => r.json())
      .then(setPartner)
      .finally(() => setLoading(false));
  }, [token]);

  const planInfo = usePlan(partner?.plan || "free");

  const sendNotif = async () => {
    if (!notifMsg.trim()) return;
    setSending(true);
    setNotifError("");
    setSent(null);
    try {
      const res = await fetch(`${BASE}/social/notify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, message: notifMsg }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erreur");
      setSent({ count: data.sent, total: data.total });
      setNotifMsg("");
    } catch (e: any) {
      setNotifError(e.message);
    } finally {
      setSending(false);
    }
  };

  if (loading) return <div style={{ padding: 40, textAlign: "center", color: "#aaa" }}>Chargement…</div>;

  // Gate Business+
  if (!planInfo.isBusiness) return (
    <div style={{ maxWidth: 520, margin: "0 auto", padding: 28 }}>
      <div style={{ background: "#fff", border: "1px solid #f0ebe8", borderRadius: 20, padding: "40px 32px", textAlign: "center" }}>
        <div style={{ fontSize: 52, marginBottom: 16 }}>⭐</div>
        <h2 style={{ fontFamily: "Syne", fontWeight: 800, fontSize: 20, color: "#1a1a1a", marginBottom: 10 }}>
          Fonctionnalités Business
        </h2>
        <p style={{ color: "#888", fontSize: 14, lineHeight: 1.7, marginBottom: 24 }}>
          Accédez aux fonctionnalités avancées : notifications push, agent WhatsApp IA, support prioritaire et multi-sites.
        </p>
        <Link href="/pricing" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 28px", borderRadius: 99, background: "#1A9E5F", color: "#fff", textDecoration: "none", fontFamily: "Syne", fontWeight: 700, fontSize: 14 }}>
          ⭐ Passer au Business — 14 900 FCFA/mois
        </Link>
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: 700, fontFamily: "DM Sans, sans-serif" }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "Syne", fontWeight: 800, fontSize: 22, color: "#1a1a1a", marginBottom: 4 }}>
          ⭐ Espace Business
        </h1>
        <p style={{ fontSize: 13, color: "#aaa" }}>Vos fonctionnalités premium exclusives</p>
      </div>

      {/* 1. Notifications push */}
      <Section title="📣 Notifications push aux clients" color="#1A9E5F">
        <p style={{ fontSize: 13, color: "#6b6b6b", marginBottom: 16, lineHeight: 1.6 }}>
          Envoyez un message à tous vos clients abonnés ({partner?.name}).
        </p>
        <textarea
          value={notifMsg}
          onChange={e => setNotifMsg(e.target.value)}
          placeholder="Ex : 🔥 Promo ce soir — 20% sur tout le menu !"
          rows={3}
          style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid #f0ebe8", fontSize: 13, resize: "vertical", fontFamily: "DM Sans", outline: "none", boxSizing: "border-box" }}
        />
        {notifError && <p style={{ fontSize: 12, color: "#ef4444", marginTop: 6 }}>{notifError}</p>}
        {sent && <p style={{ fontSize: 12, color: "#10b981", marginTop: 6 }}>✅ WhatsApp envoyé à {sent.count}/{sent.total} abonné(s)</p>}
        <button
          onClick={sendNotif}
          disabled={sending || !notifMsg.trim()}
          style={{ marginTop: 10, padding: "10px 24px", borderRadius: 99, border: "none", background: sending || !notifMsg.trim() ? "#ccc" : "#1A9E5F", color: "#fff", fontFamily: "Syne", fontWeight: 700, fontSize: 13, cursor: sending || !notifMsg.trim() ? "not-allowed" : "pointer" }}
        >
          {sending ? "Envoi…" : "📣 Envoyer à mes abonnés"}
        </button>
      </Section>

      {/* 2. Agent WhatsApp IA */}
      <Section title="🤖 Agent WhatsApp IA 24h/7j" color="#6366f1">
        <p style={{ fontSize: 13, color: "#6b6b6b", marginBottom: 16, lineHeight: 1.6 }}>
          L'agent Yitewo répond automatiquement aux clients qui vous contactent via WhatsApp — commandes, questions, catalogue.
        </p>
        <div style={{ background: "#f5f3ff", borderRadius: 10, padding: "12px 16px", marginBottom: 12 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: "#6366f1", marginBottom: 4 }}>📱 Votre numéro WhatsApp configuré</p>
          <p style={{ fontSize: 14, fontWeight: 700, color: "#1a1a1a" }}>{partner?.contact || "Non renseigné"}</p>
        </div>
        <p style={{ fontSize: 12, color: "#aaa", lineHeight: 1.6 }}>
          L'agent est actif automatiquement. Pour personnaliser ses réponses ou synchroniser votre catalogue, contactez le support.
        </p>
        <a
          href={`https://wa.me/${SUPPORT_WA}?text=${encodeURIComponent(`Bonjour ! Je suis ${partner?.name} (Business). Je veux configurer mon agent WhatsApp IA.`)}`}
          target="_blank" rel="noreferrer"
          style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 10, padding: "9px 18px", borderRadius: 99, background: "#6366f1", color: "#fff", textDecoration: "none", fontSize: 12, fontWeight: 700 }}
        >
          💬 Configurer avec l'équipe
        </a>
      </Section>

      {/* 3. Catalogue WhatsApp */}
      <Section title="📋 Catalogue synchronisé WhatsApp" color="#E8380D">
        <p style={{ fontSize: 13, color: "#6b6b6b", marginBottom: 12, lineHeight: 1.6 }}>
          Votre catalogue produits Yitewo est synchronisé et peut être envoyé automatiquement aux clients via WhatsApp.
        </p>
        <a
          href={`https://wa.me/${SUPPORT_WA}?text=${encodeURIComponent(`Bonjour ! Je suis ${partner?.name} (Business). Je veux synchroniser mon catalogue WhatsApp.`)}`}
          target="_blank" rel="noreferrer"
          style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 18px", borderRadius: 99, background: "#E8380D", color: "#fff", textDecoration: "none", fontSize: 12, fontWeight: 700 }}
        >
          💬 Activer la synchronisation
        </a>
      </Section>

      {/* 4. Multi-sites */}
      <Section title="📍 Multi-sites (jusqu'à 3 adresses)" color="#f59e0b">
        <p style={{ fontSize: 13, color: "#6b6b6b", marginBottom: 12, lineHeight: 1.6 }}>
          Gérez plusieurs points de vente ou adresses sous un seul profil Yitewo.
        </p>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#fef3c7", border: "1px solid #fcd34d", borderRadius: 10, padding: "8px 14px" }}>
          <span style={{ fontSize: 13 }}>🚧</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: "#92400e" }}>Bientôt disponible — contactez le support pour configuration manuelle</span>
        </div>
        <br />
        <a
          href={`https://wa.me/${SUPPORT_WA}?text=${encodeURIComponent(`Bonjour ! Je suis ${partner?.name} (Business). Je veux configurer plusieurs adresses.`)}`}
          target="_blank" rel="noreferrer"
          style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 12, padding: "9px 18px", borderRadius: 99, background: "#f59e0b", color: "#fff", textDecoration: "none", fontSize: 12, fontWeight: 700 }}
        >
          💬 Demander la configuration
        </a>
      </Section>

      {/* 5. Support prioritaire */}
      <Section title="🎯 Support prioritaire sous 4h" color="#0ea5e9">
        <p style={{ fontSize: 13, color: "#6b6b6b", marginBottom: 16, lineHeight: 1.6 }}>
          En tant que client Business, votre demande est traitée en priorité par notre équipe, sous 4 heures ouvrées.
        </p>
        <a
          href={`https://wa.me/${SUPPORT_WA}?text=${encodeURIComponent(`Bonjour ! Je suis ${partner?.name} (Business). J'ai besoin d'une assistance prioritaire.`)}`}
          target="_blank" rel="noreferrer"
          style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 22px", borderRadius: 99, background: "#0ea5e9", color: "#fff", textDecoration: "none", fontFamily: "Syne", fontWeight: 700, fontSize: 13 }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
          Contacter le support prioritaire
        </a>
      </Section>
    </div>
  );
}

function Section({ title, color, children }: { title: string; color: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #f0ebe8", borderRadius: 16, padding: "22px 24px", marginBottom: 16, borderLeft: `4px solid ${color}` }}>
      <h2 style={{ fontFamily: "Syne", fontWeight: 700, fontSize: 15, color: "#1a1a1a", marginBottom: 14 }}>{title}</h2>
      {children}
    </div>
  );
}
