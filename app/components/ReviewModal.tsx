"use client";

import { useState } from "react";

const BASE = process.env.NEXT_PUBLIC_URL_PROD || "http://localhost:3003";

interface Props {
  partnerSlug: string;
  partnerName: string;
  orderId?: string;
  onClose: () => void;
}

export default function ReviewModal({ partnerSlug, partnerName, orderId, onClose }: Props) {
  const [rating, setRating]   = useState(0);
  const [hover, setHover]     = useState(0);
  const [comment, setComment] = useState("");
  const [name, setName]       = useState("");
  const [phone, setPhone]     = useState(localStorage.getItem("yitewo_phone") || "");
  const [saving, setSaving]   = useState(false);
  const [done, setDone]       = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) return;
    setSaving(true);
    try {
      await fetch(`${BASE}/social/reviews/${partnerSlug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment: comment.trim() || undefined, name: name.trim() || undefined, phone: phone.trim() || undefined, orderId }),
      });
      if (phone) localStorage.setItem("yitewo_phone", phone);
      setDone(true);
    } finally {
      setSaving(false);
    }
  };

  const labels = ["", "Mauvais 😞", "Passable 😐", "Bien 🙂", "Très bien 😊", "Excellent 🤩"];

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 200, backdropFilter: "blur(3px)" }} />
      <div style={{
        position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
        background: "#fff", borderRadius: 20, padding: "28px", width: "100%", maxWidth: 420,
        zIndex: 201, boxShadow: "0 24px 64px rgba(0,0,0,0.2)",
        fontFamily: "DM Sans, sans-serif",
      }}>
        {done ? (
          <div style={{ textAlign: "center", padding: "16px 0" }}>
            <div style={{ fontSize: 52, marginBottom: 12 }}>🎉</div>
            <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 20, marginBottom: 8 }}>Merci pour votre avis !</h3>
            <p style={{ color: "#6b6b6b", fontSize: 14, marginBottom: 20 }}>Votre avis aide les autres clients à choisir.</p>
            <button onClick={onClose} style={{ padding: "10px 28px", borderRadius: 99, border: "none", background: "#E8380D", color: "#fff", fontWeight: 700, cursor: "pointer" }}>
              Fermer
            </button>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 18 }}>Noter {partnerName}</h3>
              <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#aaa", fontSize: 20 }}>✕</button>
            </div>

            {/* Stars */}
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 8 }}>
                {[1,2,3,4,5].map((s) => (
                  <button key={s} onClick={() => setRating(s)}
                    onMouseEnter={() => setHover(s)} onMouseLeave={() => setHover(0)}
                    style={{ background: "none", border: "none", cursor: "pointer", fontSize: 36, lineHeight: 1, transition: "transform 0.1s", transform: (hover || rating) >= s ? "scale(1.15)" : "scale(1)" }}>
                    <span style={{ color: (hover || rating) >= s ? "#f59e0b" : "#e5e7eb" }}>★</span>
                  </button>
                ))}
              </div>
              {(hover || rating) > 0 && (
                <p style={{ fontSize: 14, color: "#f59e0b", fontWeight: 600 }}>{labels[hover || rating]}</p>
              )}
            </div>

            {/* Fields */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
              <input value={name} onChange={(e) => setName(e.target.value)}
                placeholder="Votre prénom (optionnel)"
                style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #f0ebe8", fontSize: 14, outline: "none" }} />
              <input value={phone} onChange={(e) => setPhone(e.target.value)}
                placeholder="Votre téléphone (optionnel)"
                type="tel"
                style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #f0ebe8", fontSize: 14, outline: "none" }} />
              <textarea value={comment} onChange={(e) => setComment(e.target.value)}
                placeholder="Votre commentaire (optionnel)…"
                style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #f0ebe8", fontSize: 14, outline: "none", height: 80, resize: "none" }} />
            </div>

            <button onClick={handleSubmit} disabled={rating === 0 || saving} style={{
              width: "100%", padding: "12px", borderRadius: 12, border: "none",
              background: rating > 0 ? "#E8380D" : "#f0ebe8",
              color: rating > 0 ? "#fff" : "#aaa",
              fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 15,
              cursor: rating > 0 ? "pointer" : "not-allowed",
            }}>
              {saving ? "Envoi…" : "Publier mon avis"}
            </button>
          </>
        )}
      </div>
    </>
  );
}
