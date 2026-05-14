"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import AddressPicker from "@/components/AddressPicker";
import CloudinaryUploader from "@/components/CloudinaryUploader";

const BASE = process.env.NEXT_PUBLIC_URL_PROD || "http://localhost:3003";

const SERVICE_CATEGORIES = [
  "Électricité", "Plomberie", "Peinture", "Menuiserie", "Maçonnerie",
  "Climatisation", "Jardinage", "Ménage", "Garde d'enfants", "Cuisine à domicile",
  "Coiffure", "Beauté & Soins", "Informatique", "Mécanique", "Déménagement",
  "Sécurité", "Photographie", "Couture", "Cours particuliers", "Livraison",
];

export default function PrestataireProfil() {
  const params = useParams();
  const token = params?.token as string;

  const [partner, setPartner] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const [zone, setZone] = useState("");
  const [city, setCity] = useState("Dakar");
  const [photoUrl, setPhotoUrl] = useState("");
  const [workPhotoUrl, setWorkPhotoUrl] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [lat, setLat] = useState<number | undefined>();
  const [lng, setLng] = useState<number | undefined>();
  const [experience, setExperience] = useState("");
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [generatingDesc, setGeneratingDesc] = useState(false);

  useEffect(() => {
    if (!token) return;
    fetch(`${BASE}/partners/portal/${token}`)
      .then((r) => r.json())
      .then((data) => {
        setPartner(data);
        setZone(data.zone || "");
        setCity(data.city || "Dakar");
        setPhotoUrl(data.profileImageUrl || "");
        setWorkPhotoUrl(data.workImageUrl || "");
        setAddress(data.address || "");
        setDescription(data.message || "");
        setLat(data.lat);
        setLng(data.lng);
        setExperience(data.experience || "");
        setSelectedCats(data.serviceCategories || []);
      })
      .finally(() => setLoading(false));
  }, [token]);

  const toggleCat = (c: string) => {
    setSelectedCats((prev) => prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]);
  };

  const handleReformulateIA = async () => {
    if (!description.trim() && !partner?.name) return;
    setGeneratingDesc(true);
    try {
      const prompt = encodeURIComponent(
        `Écris une description courte (2-3 phrases max, professionnelle et accrocheuse) pour ce prestataire de services sénégalais nommé "${partner?.name || "prestataire"}" spécialisé en "${selectedCats.join(", ") || "services divers"}" basé à ${city || "Dakar"}. ${description ? `Description actuelle : "${description}"` : ""}. Réponds uniquement avec la description reformulée, sans titre ni introduction.`
      );
      const res = await fetch(`https://text.pollinations.ai/${prompt}`);
      const text = await res.text();
      setDescription(text.trim().slice(0, 300));
    } catch { /* silencieux */ }
    finally { setGeneratingDesc(false); }
  };

  const handleSave = async () => {
    setSaving(true); setError(""); setSaved(false);
    try {
      const res = await fetch(`${BASE}/partners/portal/${token}/profile`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          zone: zone || undefined,
          city: city || undefined,
          profileImageUrl: photoUrl || undefined,
          workImageUrl: workPhotoUrl || undefined,
          address: address || undefined,
          message: description || undefined,
          lat: lat || undefined,
          lng: lng || undefined,
          experience: experience || undefined,
          serviceCategories: selectedCats,
        }),
      });
      if (!res.ok) throw new Error("Erreur lors de la sauvegarde");
      const updated = await res.json();
      setPartner((prev: any) => ({ ...prev, ...updated }));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e: any) {
      setError(e.message);
    } finally { setSaving(false); }
  };

  const card: React.CSSProperties = { background: "#fff", borderRadius: 14, border: "1px solid #f0ebe8", padding: "20px", marginBottom: 16 };
  const sTitle: React.CSSProperties = { fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 15, color: "#1a1a1a", marginBottom: 14 };
  const lbl: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: "#6b6b6b", display: "block", marginBottom: 6 };
  const inp: React.CSSProperties = { width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid #f0ebe8", fontSize: 14, outline: "none", fontFamily: "DM Sans, sans-serif", background: "#fff", color: "#1a1a1a", boxSizing: "border-box" };

  if (loading) return <div style={{ textAlign: "center", padding: 60, color: "#aaa" }}>Chargement…</div>;

  return (
    <div style={{ maxWidth: 580, fontFamily: "DM Sans, sans-serif" }}>
      <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 22, color: "#1a1a1a", marginBottom: 6 }}>Mon profil</h1>
      <p style={{ fontSize: 13, color: "#aaa", marginBottom: 28, lineHeight: 1.6 }}>
        Ces informations sont visibles par les clients. Le nom et le téléphone ne peuvent être modifiés que par l'équipe Yitewo.
      </p>

      {/* Photo de profil */}
      <section style={card}>
        <h2 style={sTitle}>Photo de profil</h2>
        <p style={{ fontSize: 12, color: "#aaa", marginBottom: 14, lineHeight: 1.6 }}>
          Votre photo occupe tout le haut de votre carte. Une photo professionnelle augmente votre taux de contact.
        </p>
        <CloudinaryUploader
          value={photoUrl ? [photoUrl] : []}
          onChange={(urls) => setPhotoUrl(urls[0] ?? "")}
          token={token}
          folder="partners"
          max={1}
          label="Photo de profil"
          aspect="free"
          hint="Photo verticale recommandée · max 5MB · JPG ou PNG"
        />
      </section>

      {/* Photo lieu de travail */}
      <section style={card}>
        <h2 style={sTitle}>Photo du lieu de travail</h2>
        <p style={{ fontSize: 12, color: "#aaa", marginBottom: 14, lineHeight: 1.6 }}>
          Une photo de votre atelier, chantier ou environnement de travail rassure les clients.
        </p>
        <CloudinaryUploader
          value={workPhotoUrl ? [workPhotoUrl] : []}
          onChange={(urls) => setWorkPhotoUrl(urls[0] ?? "")}
          token={token}
          folder="partners"
          max={1}
          label="Photo lieu de travail"
          aspect="banner"
          hint="Photo horizontale recommandée · max 5MB"
        />
      </section>

      {/* Infos fixes */}
      <section style={card}>
        <h2 style={sTitle}>Informations fixes</h2>
        <p style={{ fontSize: 12, color: "#aaa", marginBottom: 14 }}>Ces informations ne peuvent être modifiées que par l'équipe Yitewo.</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[["Nom complet", partner?.name], ["Téléphone", partner?.contact], ["Type", partner?.type]].map(([k, v]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "#f7f4f2", borderRadius: 10 }}>
              <span style={{ fontSize: 13, color: "#aaa" }}>{k}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#1a1a1a" }}>{v}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Spécialités */}
      <section style={card}>
        <h2 style={sTitle}>Mes spécialités</h2>
        <p style={{ fontSize: 12, color: "#aaa", marginBottom: 14 }}>Sélectionnez les services que vous proposez (au moins 1).</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {SERVICE_CATEGORIES.map((c) => {
            const active = selectedCats.includes(c);
            return (
              <button key={c} onClick={() => toggleCat(c)} style={{
                padding: "7px 14px", borderRadius: 99, fontSize: 12, cursor: "pointer",
                border: `1.5px solid ${active ? "#E8380D" : "#f0ebe8"}`,
                background: active ? "#fff5f3" : "#fff",
                color: active ? "#E8380D" : "#6b6b6b",
                fontWeight: active ? 700 : 400, transition: "all 0.15s",
              }}>
                {active ? "✓ " : ""}{c}
              </button>
            );
          })}
        </div>
      </section>

      {/* Expérience */}
      <section style={card}>
        <h2 style={sTitle}>Expérience</h2>
        <label style={lbl}>Années d'expérience</label>
        <select value={experience} onChange={(e) => setExperience(e.target.value)} style={inp}>
          <option value="">Non renseigné</option>
          <option value="Moins d'1 an">Moins d'1 an</option>
          <option value="1-2 ans">1-2 ans</option>
          <option value="3-5 ans">3-5 ans</option>
          <option value="5-10 ans">5-10 ans</option>
          <option value="Plus de 10 ans">Plus de 10 ans</option>
        </select>
      </section>

      {/* Localisation */}
      <section style={card}>
        <h2 style={sTitle}>Localisation</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
          <div>
            <label style={lbl}>Ville</label>
            <select value={city} onChange={(e) => { setCity(e.target.value); setZone(""); }} style={inp}>
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
              {(city === "Saint-Louis"
                ? ["Île Nord", "Île Sud", "Sor", "Guet Ndar", "Hydrobase", "Cité Vauvert", "Leona", "UGB", "Bango", "Gandiol"]
                : ["Almadies", "Mermoz", "Point E", "Yoff", "Ouest-Foire", "Hann", "Grand-Yoff", "HLM", "Plateau", "Parcelles", "Guédiawaye", "Pikine", "Rufisque", "Ouakam", "Ngor"]
              ).map((z) => <option key={z} value={z}>{z}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label style={lbl}>
            Adresse précise
            <span style={{ fontSize: 10, fontWeight: 400, color: "#aaa", marginLeft: 6 }}>via OpenStreetMap</span>
          </label>
          <AddressPicker value={address} onChange={(addr, la, lo) => { setAddress(addr); if (la) setLat(la); if (lo) setLng(lo); }} />
          {address && <p style={{ fontSize: 11, color: "#10b981", marginTop: 6, fontWeight: 500 }}>📍 {address}</p>}
        </div>
      </section>

      {/* Description */}
      <section style={card}>
        <h2 style={sTitle}>Présentation</h2>
        <p style={{ fontSize: 12, color: "#aaa", marginBottom: 12, lineHeight: 1.6 }}>
          Décrivez votre savoir-faire en quelques phrases. Cette présentation apparaît sur votre profil public.
        </p>
        <div style={{ position: "relative" }}>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value.slice(0, 300))}
            placeholder={`Ex : Électricien professionnel avec ${experience || "plusieurs années"} d'expérience à ${city}. Interventions rapides, devis gratuit…`}
            rows={4}
            style={{ ...inp, resize: "vertical", height: 100 }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6 }}>
            <span style={{ fontSize: 11, color: description.length > 250 ? "#f59e0b" : "#aaa" }}>{description.length}/300</span>
            <button onClick={handleReformulateIA} disabled={generatingDesc} style={{
              display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 99,
              border: "1px solid #e0f2fe", background: "#f0f9ff", color: "#0369a1",
              fontSize: 12, fontWeight: 600, cursor: generatingDesc ? "not-allowed" : "pointer", opacity: generatingDesc ? 0.7 : 1,
            }}>
              {generatingDesc ? "⏳ Génération…" : "✨ Reformuler avec l'IA"}
            </button>
          </div>
        </div>
        {description && (
          <div style={{ marginTop: 12, padding: "10px 14px", background: "#f7f4f2", borderRadius: 10, borderLeft: "3px solid #E8380D" }}>
            <p style={{ fontSize: 11, color: "#aaa", marginBottom: 4, fontWeight: 600 }}>APERÇU SUR VOTRE PROFIL</p>
            <p style={{ fontSize: 13, color: "#555", lineHeight: 1.6, fontStyle: "italic" }}>"{description}"</p>
          </div>
        )}
      </section>

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

      <button onClick={handleSave} disabled={saving} style={{
        width: "100%", padding: "13px", borderRadius: 12, border: "none",
        background: saving ? "#f7f4f2" : "#E8380D", color: saving ? "#aaa" : "#fff",
        fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 15,
        cursor: saving ? "not-allowed" : "pointer",
      }}>
        {saving ? "Enregistrement…" : "💾 Enregistrer le profil"}
      </button>
    </div>
  );
}