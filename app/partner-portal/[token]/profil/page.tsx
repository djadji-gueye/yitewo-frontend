"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

const BASE = process.env.NEXT_PUBLIC_URL_PROD || "http://localhost:3003";

const ZONES_DAKAR = ["Almadies", "Mermoz", "Point E", "Yoff", "Ouest-Foire", "Hann", "Grand-Yoff", "HLM", "Plateau", "Parcelles", "Guédiawaye", "Pikine", "Rufisque", "Ouakam", "Ngor"];
const ZONES_SAINTLOUIS = ["Île Nord", "Île Sud", "Sor", "Guet Ndar", "Hydrobase", "Cité Vauvert", "Leona", "UGB", "Bango", "Gandiol"];

export default function PartnerProfilPage() {
  const params = useParams();
  const token = params?.token as string;

  const [partner, setPartner] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  // Champs éditables
  const [zone, setZone] = useState("");
  const [city, setCity] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");

  useEffect(() => {
    if (!token) return;
    fetch(`${BASE}/partners/portal/${token}`)
      .then((r) => r.json())
      .then((data) => {
        setPartner(data);
        setZone(data.zone || "");
        setCity(data.city || "");
        setPhotoUrl(data.profileImageUrl || "");
      })
      .finally(() => setLoading(false));
  }, [token]);

  const handleSave = async () => {
    if (!partner?.id) return;
    setSaving(true); setError(""); setSaved(false);
    try {
      const res = await fetch(`${BASE}/partners/${partner.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          zone,
          city,
          profileImageUrl: photoUrl || undefined,
        }),
      });
      if (!res.ok) throw new Error("Erreur lors de la sauvegarde");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const zones = city === "Saint-Louis" ? ZONES_SAINTLOUIS : ZONES_DAKAR;

  if (loading) return (
    <div style={{ textAlign: "center", padding: 60, color: "#aaa", fontFamily: "DM Sans, sans-serif" }}>
      Chargement…
    </div>
  );

  return (
    <div style={{ maxWidth: 580, fontFamily: "DM Sans, sans-serif" }}>
      <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 22, color: "#1a1a1a", marginBottom: 6 }}>
        Mon profil
      </h1>
      <p style={{ fontSize: 13, color: "#aaa", marginBottom: 28, lineHeight: 1.6 }}>
        Modifiez les informations visibles par vos clients. Le nom et le numéro de téléphone ne peuvent être modifiés que par l'équipe Yitewo.
      </p>

      {/* Photo */}
      <section style={card}>
        <h2 style={sTitle}>Photo de la boutique</h2>
        <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
          <div style={{
            width: 76, height: 76, borderRadius: 12, overflow: "hidden",
            background: "#f7f4f2", flexShrink: 0,
            border: "1px solid #f0ebe8",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            {photoUrl ? (
              <img src={photoUrl} alt="boutique"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
            ) : (
              <span style={{ fontSize: 28 }}>{partner?.type === "Restaurant" ? "🍽️" : "🛒"}</span>
            )}
          </div>
          <div style={{ flex: 1 }}>
            <label style={lbl}>URL de la photo</label>
            <input
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              placeholder="https://…"
              style={inp}
            />
            <p style={{ fontSize: 11, color: "#aaa", marginTop: 5, lineHeight: 1.5 }}>
              Collez le lien d'une photo depuis votre téléphone ou Google Images
            </p>
          </div>
        </div>
      </section>

      {/* Infos fixes */}
      <section style={card}>
        <h2 style={sTitle}>Informations fixes</h2>
        <p style={{ fontSize: 12, color: "#aaa", marginBottom: 14, lineHeight: 1.5 }}>
          Ces informations ne peuvent être modifiées que par l'équipe Yitewo.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            ["Nom de la boutique", partner?.name],
            ["Téléphone", partner?.contact],
            ["Type", partner?.type],
          ].map(([k, v]) => (
            <div key={k} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "10px 14px", background: "#f7f4f2", borderRadius: 10,
            }}>
              <span style={{ fontSize: 13, color: "#aaa" }}>{k}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#1a1a1a" }}>{v}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Localisation */}
      <section style={card}>
        <h2 style={sTitle}>Localisation</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label style={lbl}>Ville</label>
            <select
              value={city}
              onChange={(e) => { setCity(e.target.value); setZone(""); }}
              style={inp}
            >
              <option value="Dakar">Dakar</option>
              <option value="Saint-Louis">Saint-Louis</option>
              <option value="Thiès">Thiès</option>
              <option value="Ziguinchor">Ziguinchor</option>
            </select>
          </div>
          <div>
            <label style={lbl}>Zone / Quartier</label>
            <select value={zone} onChange={(e) => setZone(e.target.value)} style={inp}>
              <option value="">Sélectionner…</option>
              {zones.map((z) => <option key={z} value={z}>{z}</option>)}
            </select>
          </div>
        </div>
      </section>

      {/* Lien boutique */}
      {partner?.slug && (
        <section style={card}>
          <h2 style={sTitle}>Votre lien de commande</h2>
          <div style={{
            background: "#f7f4f2", borderRadius: 10, padding: "11px 14px",
            fontSize: 13, color: "#6b6b6b", wordBreak: "break-all", lineHeight: 1.5, marginBottom: 10,
          }}>
            {typeof window !== "undefined" ? window.location.origin : "https://yitewo.vercel.app"}
            /order?partner={partner.slug}
          </div>
          <button
            onClick={() => {
              const url = `${typeof window !== "undefined" ? window.location.origin : ""}/order?partner=${partner.slug}`;
              navigator.clipboard?.writeText(url);
            }}
            style={{
              padding: "8px 18px", borderRadius: 8,
              border: "1px solid #fdd0c5", background: "#fff5f3",
              color: "#E8380D", fontSize: 13, fontWeight: 600, cursor: "pointer",
            }}
          >
            📋 Copier le lien
          </button>
        </section>
      )}

      {/* Feedback */}
      {error && (
        <div style={{ background: "#fee2e2", border: "1px solid #fecaca", borderRadius: 10, padding: "10px 14px", marginBottom: 16, fontSize: 13, color: "#991b1b" }}>
          ❌ {error}
        </div>
      )}
      {saved && (
        <div style={{ background: "#d1fae5", border: "1px solid #a7f3d0", borderRadius: 10, padding: "10px 14px", marginBottom: 16, fontSize: 13, color: "#065f46" }}>
          ✅ Profil mis à jour avec succès
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={saving}
        style={{
          width: "100%", padding: "13px", borderRadius: 12, border: "none",
          background: saving ? "#f7f4f2" : "#E8380D",
          color: saving ? "#aaa" : "#fff",
          fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 15,
          cursor: saving ? "not-allowed" : "pointer",
          transition: "background 0.18s",
        }}
      >
        {saving ? "Enregistrement…" : "💾 Enregistrer le profil"}
      </button>
    </div>
  );
}

const card: React.CSSProperties = {
  background: "#fff", borderRadius: 14, border: "1px solid #f0ebe8",
  padding: "20px", marginBottom: 16,
};
const sTitle: React.CSSProperties = {
  fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 15,
  color: "#1a1a1a", marginBottom: 14,
};
const lbl: React.CSSProperties = {
  fontSize: 12, fontWeight: 600, color: "#6b6b6b",
  display: "block", marginBottom: 6,
};
const inp: React.CSSProperties = {
  width: "100%", padding: "10px 14px", borderRadius: 10,
  border: "1px solid #f0ebe8", fontSize: 14, outline: "none",
  fontFamily: "DM Sans, sans-serif", background: "#fff",
  color: "#1a1a1a",
};
