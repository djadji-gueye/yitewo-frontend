"use client";

import { useState } from "react";
import { createInterest } from "@/lib/api";

interface Opportunity {
  id: string;
  title: string;
  contact: string;
  category: string;
}

type Mode = "idle" | "quick" | "detailed";
type Status = "idle" | "loading" | "success" | "error";

const CAT_META: Record<string, { icon: string; color: string; bg: string }> = {
  IMMOBILIER: { icon: "🏠", color: "#b45309", bg: "#fef3c7" },
  EMPLOI:     { icon: "💼", color: "#1d4ed8", bg: "#dbeafe" },
  SERVICE:    { icon: "🔧", color: "#6d28d9", bg: "#ede9fe" },
  COMMERCE:   { icon: "🛒", color: "#047857", bg: "#d1fae5" },
  FORMATION:  { icon: "📚", color: "#be185d", bg: "#fce7f3" },
};

export default function InterestButton({ opportunity: opp }: { opportunity: Opportunity }) {
  const [mode, setMode] = useState<Mode>("idle");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  const meta = CAT_META[opp.category] || CAT_META.IMMOBILIER;

  const sendQuick = async () => {
    // Quick = just open WhatsApp (no name/phone captured)
    const msg = `Bonjour 👋\n\nJe suis intéressé(e) par votre annonce :\n*${opp.title}*\n\nPouvez-vous me donner plus d'informations ?`;
    window.open(`https://wa.me/${opp.contact}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const sendDetailed = async () => {
    if (!name.trim() || !phone.trim()) return;
    setStatus("loading");
    try {
      await createInterest(opp.id, { name, phone, message: message || undefined });
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  if (status === "success") return (
    <div style={{ background: "#fff", borderRadius: 20, border: "1px solid var(--border)", padding: "32px 24px", textAlign: "center" }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
      <h3 style={{ fontFamily: "Syne", fontWeight: 700, fontSize: 18, marginBottom: 8 }}>Demande envoyée !</h3>
      <p style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.6 }}>
        Votre intérêt pour <strong>{opp.title}</strong> a bien été enregistré.
        Le propriétaire de l'annonce vous contactera prochainement au <strong>{phone}</strong>.
      </p>
    </div>
  );

  if (mode === "idle") return (
    <div style={{ background: "#fff", borderRadius: 20, border: "1px solid var(--border)", padding: "28px 24px", textAlign: "center" }}>
      <div style={{ fontSize: 36, marginBottom: 10 }}>{meta.icon}</div>
      <h3 style={{ fontFamily: "Syne", fontWeight: 700, fontSize: 18, marginBottom: 8 }}>Vous êtes intéressé(e) ?</h3>
      <p style={{ color: "var(--muted)", fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
        Contactez directement via WhatsApp ou laissez vos coordonnées et soyez recontacté(e).
      </p>
      <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
        <button onClick={sendQuick} style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "12px 24px", borderRadius: 99, border: "none",
          background: "var(--green)", color: "#fff",
          fontFamily: "Syne", fontWeight: 700, fontSize: 14, cursor: "pointer",
          boxShadow: "0 4px 16px rgba(26,158,95,0.25)",
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
            <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.553 4.116 1.524 5.849L.073 23.486a.5.5 0 00.617.608l5.757-1.509A11.96 11.96 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/>
          </svg>
          Contacter sur WhatsApp
        </button>
        <button onClick={() => setMode("detailed")} style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "12px 22px", borderRadius: 99,
          border: "2px solid var(--border)", background: "#fff",
          color: "var(--text)", fontWeight: 600, fontSize: 14, cursor: "pointer",
        }}>
          ✏️ Être recontacté(e)
        </button>
      </div>
    </div>
  );

  const canSend = name.trim() && phone.trim();
  return (
    <div style={{ background: "#fff", borderRadius: 20, border: "1px solid var(--border)", padding: "28px 24px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <h3 style={{ fontFamily: "Syne", fontWeight: 700, fontSize: 18 }}>Laisser vos coordonnées</h3>
        <button onClick={() => setMode("idle")} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", fontSize: 13 }}>
          Annuler
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div>
          <label style={labelStyle}>Votre prénom *</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex : Moussa" style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Votre numéro de téléphone *</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Ex : 77 000 00 00" type="tel" style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Message (optionnel)</label>
          <textarea value={message} onChange={(e) => setMessage(e.target.value)}
            placeholder="Précisez votre demande, vos disponibilités…"
            style={{ ...inputStyle, height: 88, resize: "vertical" }} />
        </div>

        {status === "error" && (
          <p style={{ color: "var(--brand)", fontSize: 13, textAlign: "center" }}>
            ❌ Erreur — veuillez réessayer ou contacter via WhatsApp.
          </p>
        )}

        <button onClick={sendDetailed} disabled={!canSend || status === "loading"} style={{
          width: "100%", padding: "13px", borderRadius: 12, border: "none",
          background: canSend ? "var(--green)" : "#ccc",
          color: "#fff", fontFamily: "Syne", fontWeight: 700, fontSize: 15,
          cursor: canSend ? "pointer" : "not-allowed",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        }}>
          {status === "loading" ? "Envoi…" : "Envoyer ma demande"}
        </button>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  fontSize: 13, fontWeight: 600, color: "var(--muted)", display: "block", marginBottom: 6,
};
const inputStyle: React.CSSProperties = {
  width: "100%", padding: "11px 14px", borderRadius: 10,
  border: "1px solid var(--border)", fontSize: 14,
  outline: "none", fontFamily: "DM Sans, sans-serif", background: "#fff",
};
