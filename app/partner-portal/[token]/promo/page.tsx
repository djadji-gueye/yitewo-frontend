"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

const BASE = process.env.NEXT_PUBLIC_URL_PROD || "http://localhost:3003";

export default function PartnerPromoPage() {
  const params = useParams();
  const token = params?.token as string;

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activePromo, setActivePromo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [discount, setDiscount] = useState("");
  const [duration, setDuration] = useState("2");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      try {
        // 1️⃣ récupérer partner
        const partnerRes = await fetch(`${BASE}/partners/portal/${token}`);
        if (!partnerRes.ok) throw new Error('Partner fetch failed');

        const partner = await partnerRes.json();

        // 2️⃣ récupérer promo
        if (partner?.slug) {
          const promoRes = await fetch(`${BASE}/social/promos/${partner.slug}`);

          if (!promoRes.ok) return; // évite crash

          const text = await promoRes.text();
          if (!text) return; // évite "Unexpected end of JSON"

          const promo = JSON.parse(text);

          if (promo?.id) setActivePromo(promo);
        }
      } catch (error) {
        console.error('Fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const handleCreate = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      const endsAt = new Date(Date.now() + Number(duration) * 3600000).toISOString();
      const res = await fetch(`${BASE}/social/promos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, title: title.trim(), description: description.trim() || undefined, discount: discount ? Number(discount) : undefined, endsAt }),
      });
      if (res.ok) {
        const d = await res.json();
        setActivePromo(d);
        setTitle(""); setDescription(""); setDiscount(""); setDuration("2");
        setSaved(true);
        setTimeout(() => setSaved(false), 4000);
      }
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!activePromo) return;
    await fetch(`${BASE}/social/promos/${activePromo.id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    setActivePromo(null);
  };

  if (loading) return <div style={{ padding: 60, textAlign: "center", color: "#aaa" }}>Chargement…</div>;

  return (
    <div style={{ maxWidth: 560, fontFamily: "DM Sans, sans-serif" }}>
      <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 22, color: "#1a1a1a", marginBottom: 6 }}>🔥 Promo Flash</h1>
      <p style={{ fontSize: 13, color: "#aaa", marginBottom: 28, lineHeight: 1.6 }}>
        Créez une promo visible en homepage Yitewo. Une seule promo active à la fois.
      </p>

      {activePromo && new Date(activePromo.endsAt) > new Date() ? (
        <div style={{ background: "linear-gradient(135deg, #1a0500, #E8380D)", borderRadius: 14, padding: "20px", marginBottom: 20, color: "#fff" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, opacity: 0.7, marginBottom: 4, textTransform: "uppercase" as const }}>Promo en cours</p>
              <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 16, marginBottom: 6 }}>{activePromo.title}</p>
              {activePromo.discount && (
                <span style={{ background: "rgba(255,255,255,0.25)", borderRadius: 99, padding: "2px 10px", fontSize: 12, fontWeight: 700 }}>-{activePromo.discount}%</span>
              )}
              <p style={{ fontSize: 12, opacity: 0.7, marginTop: 8 }}>
                Expire le {new Date(activePromo.endsAt).toLocaleString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
            <button onClick={handleDelete} style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", borderRadius: 8, padding: "6px 14px", color: "#fff", fontSize: 12, cursor: "pointer" }}>
              Arrêter
            </button>
          </div>
        </div>
      ) : (
        <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #f0ebe8", padding: "20px", marginBottom: 20 }}>
          <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 15, color: "#1a1a1a", marginBottom: 16 }}>Créer une promo</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <label style={lbl}>Titre *</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex : 🔥 -20% sur tout le menu ce soir !" style={inp} maxLength={60} />
              <p style={{ fontSize: 11, color: "#aaa", marginTop: 4 }}>{title.length}/60</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={lbl}>Réduction (%)</label>
                <input type="number" value={discount} onChange={(e) => setDiscount(e.target.value)} placeholder="20" min={1} max={80} style={inp} />
              </div>
              <div>
                <label style={lbl}>Durée</label>
                <select value={duration} onChange={(e) => setDuration(e.target.value)} style={inp}>
                  <option value="1">1 heure</option>
                  <option value="2">2 heures</option>
                  <option value="4">4 heures</option>
                  <option value="8">8 heures</option>
                  <option value="24">24 heures</option>
                </select>
              </div>
            </div>
            <div>
              <label style={lbl}>Description (optionnel)</label>
              <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Ex : Valable sur commande min. 3 000 FCFA" style={inp} />
            </div>
            {saved && (
              <div style={{ background: "#d1fae5", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#065f46" }}>
                ✅ Promo lancée ! Visible maintenant sur la homepage Yitewo.
              </div>
            )}
            <button onClick={handleCreate} disabled={!title.trim() || saving} style={{
              padding: "12px", borderRadius: 10, border: "none",
              background: title.trim() ? "#E8380D" : "#f0ebe8",
              color: title.trim() ? "#fff" : "#aaa",
              fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 14,
              cursor: title.trim() ? "pointer" : "not-allowed",
            }}>
              {saving ? "Création…" : "🔥 Lancer la promo"}
            </button>
          </div>
        </div>
      )}

      <div style={{ background: "#f7f4f2", borderRadius: 12, padding: "14px 16px", fontSize: 12, color: "#6b6b6b", lineHeight: 1.8 }}>
        <p style={{ fontWeight: 600, color: "#1a1a1a", marginBottom: 4 }}>💡 Comment ça marche</p>
        <p>• Votre promo apparaît en bandeau sur la page boutiques</p>
        <p>• Visible par tous les visiteurs Yitewo</p>
        <p>• Expire automatiquement à la durée choisie</p>
      </div>
    </div>
  );
}

const lbl: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: "#6b6b6b", display: "block", marginBottom: 6 };
const inp: React.CSSProperties = { width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid #f0ebe8", fontSize: 14, outline: "none", fontFamily: "DM Sans, sans-serif", background: "#fff", color: "#1a1a1a" };
