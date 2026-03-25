"use client";

import { useState } from "react";
import Link from "next/link";

const STATUS_META: Record<string, { label: string; color: string; bg: string; icon: string; desc: string }> = {
  PENDING:  { label: "En attente",  color: "#92400e", bg: "#fef3c7", icon: "⏳", desc: "Votre annonce est en cours d'examen par notre équipe." },
  APPROVED: { label: "Publiée",     color: "#065f46", bg: "#d1fae5", icon: "✅", desc: "Votre annonce est visible par tous les visiteurs." },
  REJECTED: { label: "Refusée",     color: "#991b1b", bg: "#fee2e2", icon: "❌", desc: "Votre annonce n'a pas pu être publiée. Contactez-nous pour plus d'informations." },
};

const CAT_META: Record<string, { label: string; icon: string }> = {
  IMMOBILIER: { label: "Immobilier", icon: "🏠" },
  EMPLOI:     { label: "Emploi",     icon: "💼" },
  SERVICE:    { label: "Service",    icon: "🔧" },
  COMMERCE:   { label: "Commerce",   icon: "🛒" },
  FORMATION:  { label: "Formation",  icon: "📚" },
};

function daysSince(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "Aujourd'hui";
  if (days === 1) return "Hier";
  return `Il y a ${days} jours`;
}

type Step = "search" | "loading" | "results" | "empty" | "error";

export default function MesAnnoncesPage() {
  const [phone, setPhone] = useState("");
  const [step, setStep] = useState<Step>("search");
  const [submissions, setSubmissions] = useState<any[]>([]);

  const handleSearch = async () => {
    const cleaned = phone.replace(/\s+/g, "").trim();
    if (!cleaned) return;
    setStep("loading");
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_URL_PROD}/opportunities/submissions/by-contact?contact=${encodeURIComponent(cleaned)}`
      );
      if (!res.ok) throw new Error();
      const data = await res.json();
      const list = Array.isArray(data) ? data : data?.data ?? [];
      setSubmissions(list);
      setStep(list.length === 0 ? "empty" : "results");
    } catch {
      setStep("error");
    }
  };

  return (
    <div style={{ background: "var(--surface)", minHeight: "100vh" }}>
      <div style={{
        background: "linear-gradient(135deg, #0a0a1a 0%, #1a1a3e 60%, #2d2d8f 100%)",
        padding: "40px 20px 48px", position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: -50, right: -50, width: 220, height: 220, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
        <div style={{ maxWidth: 700, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <Link href="/opportunities" style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.12)", borderRadius: 99, padding: "6px 14px", marginBottom: 18, textDecoration: "none", color: "rgba(255,255,255,0.8)", fontSize: 13 }}>
            ← Retour aux annonces
          </Link>
          <h1 style={{ fontFamily: "Syne", fontWeight: 800, fontSize: "clamp(24px, 4vw, 36px)", color: "#fff", marginBottom: 8 }}>
            Suivre mes annonces
          </h1>
          <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 14 }}>
            Entrez le numéro utilisé lors de votre soumission pour voir le statut de vos annonces.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 600, margin: "0 auto", padding: "40px 20px 80px" }}>
        {/* Search */}
        <div style={{ background: "#fff", borderRadius: 20, border: "1px solid var(--border)", padding: "28px 24px", marginBottom: 24, boxShadow: "var(--shadow-card)" }}>
          <p style={{ fontFamily: "Syne", fontWeight: 700, fontSize: 16, marginBottom: 6 }}>📱 Votre numéro de contact</p>
          <p style={{ color: "var(--muted)", fontSize: 13, marginBottom: 16, lineHeight: 1.5 }}>
            C'est le numéro que vous avez fourni au moment de soumettre votre annonce.
          </p>
          <div style={{ display: "flex", gap: 10 }}>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Ex : 221 77 000 00 00"
              type="tel"
              style={{ flex: 1, padding: "12px 16px", borderRadius: 10, border: "1px solid var(--border)", fontSize: 14, outline: "none", fontFamily: "DM Sans, sans-serif" }}
            />
            <button
              onClick={handleSearch}
              disabled={!phone.trim() || step === "loading"}
              style={{ padding: "12px 20px", borderRadius: 10, border: "none", background: phone.trim() ? "var(--brand)" : "#ccc", color: "#fff", fontWeight: 700, fontSize: 14, cursor: phone.trim() ? "pointer" : "not-allowed", flexShrink: 0 }}
            >
              {step === "loading" ? "…" : "Rechercher"}
            </button>
          </div>
        </div>

        {step === "loading" && (
          <div style={{ textAlign: "center", padding: "32px", color: "var(--muted)" }}>
            <p style={{ fontSize: 14 }}>Recherche en cours…</p>
          </div>
        )}

        {step === "empty" && (
          <div style={{ background: "#fff", borderRadius: 16, border: "1px solid var(--border)", padding: "40px 24px", textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
            <p style={{ fontFamily: "Syne", fontWeight: 700, fontSize: 18, marginBottom: 8 }}>Aucune annonce trouvée</p>
            <p style={{ color: "var(--muted)", fontSize: 13, lineHeight: 1.6, marginBottom: 20 }}>
              Aucune soumission trouvée pour <strong>{phone}</strong>. Vérifiez le numéro utilisé lors de la soumission.
            </p>
            <Link href="/opportunities/poster" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "var(--brand)", color: "#fff", padding: "11px 22px", borderRadius: 99, textDecoration: "none", fontWeight: 700, fontSize: 14 }}>
              Publier une annonce
            </Link>
          </div>
        )}

        {step === "error" && (
          <div style={{ background: "#fee2e2", borderRadius: 12, border: "1px solid #fca5a5", padding: "16px 20px", fontSize: 13, color: "#991b1b", textAlign: "center" }}>
            ❌ Erreur de connexion. Réessayez.
          </div>
        )}

        {step === "results" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 4 }}>
              {submissions.length} annonce{submissions.length > 1 ? "s" : ""} trouvée{submissions.length > 1 ? "s" : ""} pour <strong>{phone}</strong>
            </p>
            {submissions.map((sub) => {
              const statusM = STATUS_META[sub.status] || STATUS_META.PENDING;
              const catM = CAT_META[sub.category] || { label: sub.category, icon: "📋" };
              return (
                <div key={sub.id} style={{ background: "#fff", borderRadius: 16, border: "1px solid var(--border)", padding: "20px 22px", boxShadow: "var(--shadow-card)" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 14px", borderRadius: 99, fontSize: 12, fontWeight: 700, background: statusM.bg, color: statusM.color }}>
                      {statusM.icon} {statusM.label}
                    </span>
                    <span style={{ fontSize: 12, color: "var(--muted)" }}>{daysSince(sub.createdAt)}</span>
                  </div>
                  <h3 style={{ fontFamily: "Syne", fontWeight: 700, fontSize: 16, marginBottom: 8, lineHeight: 1.3 }}>{sub.title}</h3>
                  <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 12, fontSize: 13, color: "var(--muted)" }}>
                    <span>{catM.icon} {catM.label}</span>
                    <span>📍 {sub.location}</span>
                    {sub.price && <span style={{ color: "var(--brand)", fontWeight: 600 }}>💰 {sub.price}</span>}
                  </div>
                  <div style={{ background: statusM.bg, borderRadius: 10, padding: "10px 14px", fontSize: 13, color: statusM.color, lineHeight: 1.5 }}>
                    {statusM.desc}
                  </div>
                  {sub.status === "APPROVED" && (
                    <Link href="/opportunities" style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 12, color: "var(--green)", fontWeight: 600, fontSize: 13, textDecoration: "none" }}>
                      Voir dans la liste publique →
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
