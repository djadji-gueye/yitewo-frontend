"use client";

import { useState } from "react";

const SUBJECTS = [
  "Je veux devenir partenaire",
  "Problème avec ma commande",
  "Signaler un prestataire",
  "Question sur la plateforme",
  "Partenariat / Presse",
  "Autre",
];

type Status = "idle" | "sending" | "success" | "error";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  const canSend = name.trim() && message.trim() && (email.trim() || phone.trim());

  const handleSend = async () => {
    if (!canSend) return;
    setStatus("sending");
    try {
      const res = await fetch("https://formsubmit.co/ajax/yitewoo@gmail.com", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          name,
          email: email || "Non renseigné",
          phone: phone || "Non renseigné",
          subject: `[Yitewo Contact] ${subject}`,
          message,
          _subject: `[Yitewo] ${subject} — ${name}`,
          _captcha: "false",
          _template: "box",
        }),
      });
      if (res.ok) {
        setStatus("success");
        setName(""); setEmail(""); setPhone(""); setMessage(""); setSubject(SUBJECTS[0]);
      } else { setStatus("error"); }
    } catch { setStatus("error"); }
  };

  if (status === "success") return (
    <div style={{ minHeight: "100vh", background: "var(--surface)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "#fff", borderRadius: 20, border: "1px solid var(--border)", padding: "60px 32px", textAlign: "center", maxWidth: 480, width: "100%" }}>
        <div style={{ width: 80, height: 80, borderRadius: "50%", background: "linear-gradient(135deg, #d1fae5, #a7f3d0)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, margin: "0 auto 20px" }}>✅</div>
        <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 22, marginBottom: 10 }}>Message envoyé !</h2>
        <p style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.7, marginBottom: 24 }}>
          Votre message a été transmis à l&apos;équipe Yitewo.<br />Nous vous répondrons sous 24h.
        </p>
        <button onClick={() => setStatus("idle")} style={{ padding: "11px 28px", borderRadius: 99, border: "none", background: "var(--brand)", color: "#fff", fontFamily: "Syne", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
          Nouveau message
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--surface)" }}>
      <div style={{ background: "linear-gradient(135deg, #0a0a1a 0%, #1a1a3e 60%, #2d2d8f 100%)", padding: "48px 20px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -60, right: -60, width: 260, height: 260, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
        <div style={{ maxWidth: 640, margin: "0 auto", position: "relative", zIndex: 1, textAlign: "center" }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(232,56,13,0.2)", border: "2px solid rgba(232,56,13,0.4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, margin: "0 auto 16px" }}>✉️</div>
          <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "clamp(26px, 4vw, 36px)", color: "#fff", marginBottom: 10 }}>Contactez-nous</h1>
          <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 15, lineHeight: 1.6, maxWidth: 480, margin: "0 auto" }}>
            Une question, un problème ou une idée ? Notre équipe vous répond sous 24h.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "40px 20px 80px" }}>
        <div style={{ background: "#fff", borderRadius: 20, border: "1px solid var(--border)", padding: "32px 28px", marginBottom: 20 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

            <div>
              <label style={lbl}>Votre nom *</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Prénom et nom" style={inp} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={lbl}>Email</label>
                <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="votre@email.com" type="email" style={inp} />
              </div>
              <div>
                <label style={lbl}>Téléphone</label>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="77 000 00 00" type="tel" style={inp} />
              </div>
            </div>
            <p style={{ fontSize: 11, color: "var(--muted)", marginTop: -10 }}>* Email ou téléphone requis (au moins un)</p>

            <div>
              <label style={lbl}>Sujet *</label>
              <select value={subject} onChange={(e) => setSubject(e.target.value)} style={inp}>
                {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <label style={lbl}>Message *</label>
                <span style={{ fontSize: 11, color: "var(--muted)" }}>{message.length}/1000</span>
              </div>
              <textarea value={message} onChange={(e) => setMessage(e.target.value.slice(0, 1000))} placeholder="Décrivez votre demande en détail…" style={{ ...inp, height: 140, resize: "vertical" as const }} />
            </div>

            {status === "error" && (
              <div style={{ background: "#fee2e2", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#991b1b" }}>
                ❌ Erreur envoi. Contactez-nous sur <strong>yitewoo@gmail.com</strong>
              </div>
            )}

            <button onClick={handleSend} disabled={!canSend || status === "sending"}
              style={{ width: "100%", padding: "15px", borderRadius: 12, border: "none", background: canSend ? "var(--brand)" : "#ddd", color: canSend ? "#fff" : "#aaa", fontFamily: "Syne", fontWeight: 700, fontSize: 15, cursor: canSend ? "pointer" : "not-allowed", transition: "background .2s" }}>
              {status === "sending" ? "Envoi en cours…" : "Envoyer le message →"}
            </button>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12 }}>
          {[
            { ico: "✉️", label: "Email", val: "yitewoo@gmail.com", href: "mailto:yitewoo@gmail.com" },
            { ico: "📱", label: "WhatsApp", val: "+221 76 780 19 29", href: "https://wa.me/2217767801929?text=Bonjour Yitewo" },
            { ico: "📘", label: "Facebook", val: "@yitewo", href: "https://www.facebook.com/yitewo" },
          ].map((c) => (
            <a key={c.label} href={c.href} target="_blank" rel="noopener noreferrer"
              style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 16px", background: "#fff", borderRadius: 12, border: "1px solid var(--border)", textDecoration: "none" }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--brand)")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
            >
              <span style={{ fontSize: 22 }}>{c.ico}</span>
              <div>
                <p style={{ fontSize: 11, color: "var(--muted)", marginBottom: 1 }}>{c.label}</p>
                <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text)" }}>{c.val}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

const lbl: React.CSSProperties = { fontSize: 13, fontWeight: 600, color: "var(--muted)", display: "block", marginBottom: 6 };
const inp: React.CSSProperties = { width: "100%", padding: "11px 14px", borderRadius: 10, border: "1px solid var(--border)", fontSize: 14, outline: "none", fontFamily: "DM Sans, sans-serif", background: "#fff", boxSizing: "border-box" as const };
