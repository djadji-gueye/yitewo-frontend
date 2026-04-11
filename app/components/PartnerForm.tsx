"use client";

import { useState, useRef, useCallback } from "react";
import { createPartner } from "@/lib/api";

const BASE = process.env.NEXT_PUBLIC_URL_PROD || "http://localhost:3003";

interface GeoSuggestion { display_name: string; lat: string; lon: string; address: any; }
type Status = "form" | "loading" | "success" | "error";

// ── Catégories Marchand hardcodées ─────────────────────────
const MARCHAND_CATS = [
  { id: "alimentation", label: "Alimentation & épicerie", icon: "🛒" },
  { id: "cosmetique", label: "Cosmétique & beauté", icon: "💄" },
  { id: "telecom", label: "Téléphonie & telecom", icon: "📱" },
  { id: "pharmacie", label: "Pharmacie & parapharmacie", icon: "💊" },
  { id: "boulangerie", label: "Boulangerie & pâtisserie", icon: "🥖" },
  { id: "quincaillerie", label: "Quincaillerie & BTP", icon: "🔨" },
  { id: "materiaux", label: "Matériaux de construction", icon: "🧱" },
  { id: "mode", label: "Mode & vêtements", icon: "👗" },
  { id: "informatique", label: "Informatique & high-tech", icon: "💻" },
  { id: "electromenager", label: "Électroménager", icon: "🔌" },
  { id: "grossiste", label: "Grossiste", icon: "📦" },
  { id: "artisanat", label: "Artisanat & art", icon: "🎨" },
  { id: "bijoux", label: "Bijouterie & accessoires", icon: "💍" },
  { id: "librairie", label: "Librairie & papeterie", icon: "📚" },
  { id: "viande", label: "Viandes & poissons", icon: "🥩" },
  { id: "hygiene", label: "Hygiène & entretien", icon: "🧼" },
  { id: "divers", label: "Maison & divers", icon: "🏠" },
];

const RESTO_CATS = [
  { id: "local", label: "Cuisine locale sénégalaise", icon: "🍛" },
  { id: "fastfood", label: "Fast-food & snacks", icon: "🍔" },
  { id: "traiteur", label: "Traiteur & plats à emporter", icon: "🥘" },
  { id: "international", label: "Cuisine internationale", icon: "🍱" },
  { id: "patisserie", label: "Pâtisserie & café", icon: "☕" },
  { id: "grillades", label: "Grillades & brochettes", icon: "🍖" },
];

export default function PartnerForm({ forcedType }: { forcedType?: string } = {}) {
  const [type, setType] = useState(forcedType || "");
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [zone, setZone] = useState("");
  const [contact, setContact] = useState("");
  const [message, setMessage] = useState("");
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [status, setStatus] = useState<Status>("form");
  const [error, setError] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [logoPreview, setLogoPreview] = useState("");
  const [logoUploading, setLogoUploading] = useState(false);
  const [geoQuery, setGeoQuery] = useState("");
  const [geoSuggestions, setGeoSuggestions] = useState<GeoSuggestion[]>([]);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoSelected, setGeoSelected] = useState(false);
  const [geoLat, setGeoLat] = useState<number | undefined>();
  const [geoLng, setGeoLng] = useState<number | undefined>();
  const [geoAddress, setGeoAddress] = useState("");
  const debRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  const cats = type === "Restaurant" ? RESTO_CATS : MARCHAND_CATS;
  const totalSteps = 3;

  const searchGeo = useCallback(async (q: string) => {
    if (q.length < 3) { setGeoSuggestions([]); return; }
    setGeoLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q + " Sénégal")}&countrycodes=sn&format=json&addressdetails=1&limit=6&accept-language=fr`,
        { headers: { "Accept-Language": "fr" } }
      );
      setGeoSuggestions(await res.json());
    } catch { setGeoSuggestions([]); }
    finally { setGeoLoading(false); }
  }, []);

  const handleGeoInput = (val: string) => {
    setGeoQuery(val); setGeoSelected(false);
    if (debRef.current) clearTimeout(debRef.current);
    debRef.current = setTimeout(() => searchGeo(val), 380);
  };

  const selectGeo = (s: GeoSuggestion) => {
    const a = s.address;
    const detectedCity = a.city || a.town || a.municipality || a.county || "";
    const detectedZone = a.suburb || a.neighbourhood || a.quarter || a.village || a.road || "";
    const parts = [a.road || a.pedestrian, detectedZone, detectedCity].filter(Boolean);
    setGeoQuery(detectedZone || detectedCity || s.display_name.split(",")[0]);
    setCity(detectedCity); setZone(detectedZone); setGeoSelected(true);
    setGeoSuggestions([]);
    setGeoLat(parseFloat(s.lat)); setGeoLng(parseFloat(s.lon));
    setGeoAddress(parts.join(", "));
  };

  const shortLabel = (s: GeoSuggestion) => {
    const a = s.address;
    const parts = [a.suburb || a.neighbourhood || a.quarter || a.road || a.village, a.city || a.town || a.municipality].filter(Boolean);
    return parts.length ? parts.join(", ") : s.display_name.split(",").slice(0, 2).join(", ");
  };

  const handleLogoUpload = async (file: File) => {
    setLogoUploading(true);
    const reader = new FileReader();
    reader.onload = (e) => setLogoPreview(e.target?.result as string);
    reader.readAsDataURL(file);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(`${BASE}/partners/upload-profile-image`, { method: "POST", body: fd });
      const data = await res.json();
      setLogoUrl(data.url);
    } catch { } finally { setLogoUploading(false); }
  };

  const toggleCat = (id: string) =>
    setSelectedCats((prev) => prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]);

  const handleSubmit = async () => {
    if (!name || !city || !contact) return;
    setStatus("loading");
    try {
      await createPartner({
        type, name, city, zone: zone || undefined,
        contact, message: message || undefined,
        profileImageUrl: logoUrl || undefined,
        address: geoAddress || undefined,
        lat: geoLat, lng: geoLng,
      });
      setStatus("success");
    } catch (err: any) {
      setError(err?.message || "Erreur inconnue");
      setStatus("error");
    }
  };

  // ── Étape 1 valide si nom + localisation ─────────────────
  const step1Valid = name.trim().length > 0 && geoSelected;
  const step2Valid = contact.trim().length >= 8;

  // ── Succès ────────────────────────────────────────────────
  if (status === "success") return (
    <div style={{ textAlign: "center", padding: "40px 20px" }}>
      <div style={{ width: 80, height: 80, borderRadius: "50%", background: "linear-gradient(135deg,#d1fae5,#a7f3d0)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 38, margin: "0 auto 20px", boxShadow: "0 8px 24px rgba(16,185,129,0.2)" }}>🎉</div>
      <h3 style={{ fontFamily: "Syne", fontWeight: 800, fontSize: 22, marginBottom: 10, color: "#1a1a1a" }}>Demande enregistrée !</h3>
      <p style={{ color: "#6b6b6b", fontSize: 14, lineHeight: 1.8, maxWidth: 380, margin: "0 auto" }}>
        Bienvenue dans le réseau Yitewo. Notre équipe va examiner votre dossier et vous contactera sous 24h au <strong>{contact}</strong>.
      </p>
    </div>
  );

  return (
    <div style={{ fontFamily: "DM Sans, sans-serif" }}>

      {/* Progress bar */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
          {[
            { n: 1, label: "Informations" },
            { n: 2, label: "Contact" },
            { n: 3, label: "Finaliser" },
          ].map((s) => (
            <div key={s.n} style={{ display: "flex", alignItems: "center", gap: 7, flex: 1 }}>
              <div style={{
                width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                background: step > s.n ? "#10b981" : step === s.n ? "var(--brand)" : "#f0ebe8",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, fontWeight: 700,
                color: step >= s.n ? "#fff" : "#aaa",
                transition: "all 0.3s",
              }}>
                {step > s.n ? "✓" : s.n}
              </div>
              <span style={{ fontSize: 12, fontWeight: step === s.n ? 700 : 400, color: step === s.n ? "#1a1a1a" : "#aaa" }}>
                {s.label}
              </span>
              {s.n < totalSteps && (
                <div style={{ flex: 1, height: 2, background: step > s.n ? "#10b981" : "#f0ebe8", borderRadius: 99, margin: "0 8px", transition: "background 0.3s" }} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── ÉTAPE 1 — Informations ── */}
      {step === 1 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Logo */}
          <div>
            <label style={lbl}>🖼️ Logo / Photo de boutique <span style={{ fontWeight: 400, color: "#bbb", fontSize: 11 }}>(optionnel)</span></label>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 72, height: 72, borderRadius: 16, border: "2px solid #f0ebe8", overflow: "hidden", background: "#f7f4f2", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {logoPreview
                  ? <img src={logoPreview} alt="logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : <span style={{ fontSize: 28 }}>{type === "Restaurant" ? "🍽️" : "🏪"}</span>}
              </div>
              <label style={{ cursor: "pointer", flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "14px", borderRadius: 12, border: "1.5px dashed #e0dbd8", fontSize: 12, color: "#6b6b6b", background: "#fafaf8", transition: "all 0.2s" }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--brand)"; e.currentTarget.style.background = "#fff5f3"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e0dbd8"; e.currentTarget.style.background = "#fafaf8"; }}>
                <span style={{ fontSize: 20 }}>{logoUploading ? "⏳" : logoPreview ? "✅" : "📸"}</span>
                <span style={{ fontWeight: 600 }}>{logoUploading ? "Envoi en cours…" : logoPreview ? "Changer la photo" : "Ajouter un logo"}</span>
                <span style={{ fontSize: 11, color: "#bbb" }}>JPG, PNG · max 5MB</span>
                <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => { if (e.target.files?.[0]) handleLogoUpload(e.target.files[0]); }} />
              </label>
            </div>
          </div>

          {/* Nom */}
          <div>
            <label style={lbl}>Nom / Enseigne *</label>
            <input value={name} onChange={(e) => setName(e.target.value)}
              placeholder={type === "Restaurant" ? "Ex : Restaurant Chez Fatou" : "Ex : Épicerie Coumba"}
              style={{ ...inp, borderColor: name.trim() ? "#10b981" : undefined }} />
          </div>

          {/* Adresse */}
          <div ref={dropRef} style={{ position: "relative" }}>
            <label style={lbl}>
              Adresse / Quartier *
              <span style={{ fontSize: 11, fontWeight: 400, color: "#bbb", marginLeft: 8 }}>🗺️ OpenStreetMap</span>
            </label>
            <div style={{ position: "relative" }}>
              <input value={geoQuery} onChange={(e) => handleGeoInput(e.target.value)}
                placeholder="Tapez votre quartier, rue… (ex: Mermoz, Plateau)"
                autoComplete="off"
                style={{ ...inp, paddingRight: 40, borderColor: geoSelected ? "#10b981" : undefined, background: geoSelected ? "#f0fdf6" : "#fff" }}
              />
              {geoLoading && <span style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: "#aaa" }}>⏳</span>}
              {geoSelected && !geoLoading && <span style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", fontSize: 14, color: "#10b981" }}>✓</span>}
            </div>

            {geoSuggestions.length > 0 && (
              <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, background: "#fff", border: "1px solid #f0ebe8", borderRadius: 12, boxShadow: "0 8px 32px rgba(0,0,0,0.12)", zIndex: 100, overflow: "hidden" }}>
                {geoSuggestions.map((s, i) => (
                  <button key={i} type="button" onClick={() => selectGeo(s)}
                    style={{ display: "block", width: "100%", textAlign: "left", padding: "11px 16px", background: "none", border: "none", borderBottom: i < geoSuggestions.length - 1 ? "1px solid #f7f4f2" : "none", cursor: "pointer", fontSize: 13 }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#fafaf8")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
                  >
                    <span style={{ fontWeight: 600, color: "#1a1a1a" }}>📍 {shortLabel(s)}</span>
                    <span style={{ display: "block", fontSize: 11, color: "#aaa", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.display_name}</span>
                  </button>
                ))}
              </div>
            )}

            {geoSelected && (city || zone) && (
              <div style={{ marginTop: 8, display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                {city && <span style={{ padding: "3px 12px", borderRadius: 99, fontSize: 12, background: "#fff5f3", color: "var(--brand)", border: "1px solid #fdd0c5", fontWeight: 600 }}>🏙️ {city}</span>}
                {zone && <span style={{ padding: "3px 12px", borderRadius: 99, fontSize: 12, background: "#f7f4f2", color: "#555", border: "1px solid #f0ebe8" }}>📌 {zone}</span>}
                <button type="button" onClick={() => { setGeoQuery(""); setCity(""); setZone(""); setGeoSelected(false); }}
                  style={{ padding: "3px 10px", borderRadius: 99, fontSize: 11, background: "none", border: "1px solid #f0ebe8", color: "#aaa", cursor: "pointer" }}>
                  ✕ Changer
                </button>
              </div>
            )}
          </div>

          {/* Catégories */}
          <div>
            <label style={lbl}>
              Catégories {type === "Marchand" ? "de produits" : "de cuisine"}
              <span style={{ fontWeight: 400, color: "#bbb", fontSize: 11, marginLeft: 6 }}>
                {selectedCats.length > 0 ? `${selectedCats.length} sélectionnée${selectedCats.length > 1 ? "s" : ""}` : "Sélectionnez vos catégories"}
              </span>
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {cats.map((cat) => {
                const active = selectedCats.includes(cat.id);
                return (
                  <button type="button" key={cat.id} onClick={() => toggleCat(cat.id)} style={{
                    display: "inline-flex", alignItems: "center", gap: 5,
                    padding: "7px 14px", borderRadius: 99, fontSize: 12, cursor: "pointer",
                    border: `1.5px solid ${active ? "var(--brand)" : "#f0ebe8"}`,
                    background: active ? "var(--brand-light)" : "#fff",
                    color: active ? "var(--brand)" : "#6b6b6b",
                    fontWeight: active ? 700 : 400, transition: "all 0.18s",
                  }}>
                    <span>{cat.icon}</span> {cat.label}
                    {active && <span style={{ fontSize: 10, marginLeft: 2 }}>✓</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* CTA Étape 1 */}
          <button type="button" onClick={() => setStep(2)} disabled={!step1Valid}
            style={{
              padding: "13px", borderRadius: 12, border: "none",
              background: step1Valid ? "var(--brand)" : "#f0ebe8",
              color: step1Valid ? "#fff" : "#aaa",
              fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 14,
              cursor: step1Valid ? "pointer" : "not-allowed", transition: "all 0.2s",
            }}>
            Continuer → Contact
          </button>
          {!step1Valid && (
            <p style={{ textAlign: "center", fontSize: 12, color: "#aaa", marginTop: -8 }}>
              {!name.trim() ? "✍️ Ajoutez le nom de votre boutique" : !geoSelected ? "📍 Sélectionnez votre localisation" : ""}
            </p>
          )}
        </div>
      )}

      {/* ── ÉTAPE 2 — Contact ── */}
      {step === 2 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Récap étape 1 */}
          <div style={{ background: "#f7f4f2", borderRadius: 12, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12 }}>
            {logoPreview && <img src={logoPreview} alt="" style={{ width: 40, height: 40, borderRadius: 8, objectFit: "cover" }} />}
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: "#1a1a1a" }}>{name}</p>
              <p style={{ fontSize: 12, color: "#6b6b6b" }}>📍 {zone ? `${zone}, ` : ""}{city}</p>
            </div>
            <button type="button" onClick={() => setStep(1)} style={{ marginLeft: "auto", padding: "4px 10px", borderRadius: 8, border: "1px solid #f0ebe8", background: "#fff", fontSize: 11, color: "#aaa", cursor: "pointer" }}>
              Modifier
            </button>
          </div>

          <div>
            <label style={lbl}>📱 Numéro WhatsApp *</label>
            <input value={contact} onChange={(e) => setContact(e.target.value)}
              placeholder="Ex : 221 77 000 00 00" type="tel"
              style={{ ...inp, borderColor: step2Valid ? "#10b981" : undefined }} />
            <p style={{ fontSize: 11, color: "#aaa", marginTop: 5 }}>
              Ce numéro sera utilisé pour vous contacter et affiché aux clients.
            </p>
          </div>

          <div>
            <label style={lbl}>💬 Message (optionnel)</label>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)}
              placeholder="Parlez-nous de votre activité, vos produits, votre zone de couverture, vos horaires…"
              style={{ ...inp, height: 100, resize: "vertical" as const }} />
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button type="button" onClick={() => setStep(1)} style={{ flex: 1, padding: "12px", borderRadius: 12, border: "1px solid #f0ebe8", background: "#fff", fontFamily: "Syne", fontWeight: 600, fontSize: 14, cursor: "pointer", color: "#6b6b6b" }}>
              ← Retour
            </button>
            <button type="button" onClick={() => setStep(3)} disabled={!step2Valid}
              style={{ flex: 2, padding: "12px", borderRadius: 12, border: "none", background: step2Valid ? "var(--brand)" : "#f0ebe8", color: step2Valid ? "#fff" : "#aaa", fontFamily: "Syne", fontWeight: 700, fontSize: 14, cursor: step2Valid ? "pointer" : "not-allowed" }}>
              Continuer → Finaliser
            </button>
          </div>
        </div>
      )}

      {/* ── ÉTAPE 3 — Récap + Envoi ── */}
      {step === 3 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          <div style={{ background: "#f7f4f2", borderRadius: 14, padding: "20px" }}>
            <p style={{ fontFamily: "Syne", fontWeight: 700, fontSize: 15, color: "#1a1a1a", marginBottom: 14 }}>📋 Récapitulatif</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                ["Type", type],
                ["Boutique", name],
                ["Localisation", [zone, city].filter(Boolean).join(", ")],
                ["Contact", contact],
                ["Catégories", selectedCats.length > 0 ? `${selectedCats.length} catégorie${selectedCats.length > 1 ? "s" : ""}` : "Aucune"],
              ].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #f0ebe8" }}>
                  <span style={{ fontSize: 13, color: "#aaa" }}>{k}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#1a1a1a", textAlign: "right", maxWidth: "60%" }}>{v}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: "#fff5f3", border: "1px solid #fdd0c5", borderRadius: 10, padding: "12px 14px", fontSize: 12, color: "#b45309", lineHeight: 1.6 }}>
            ⏱ Votre demande sera examinée par notre équipe sous <strong>24h</strong>. Vous serez contacté au <strong>{contact}</strong>.
          </div>

          {status === "error" && (
            <div style={{ background: "#fee2e2", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#991b1b" }}>
              ❌ {error || "Une erreur est survenue."}
            </div>
          )}

          <div style={{ display: "flex", gap: 10 }}>
            <button type="button" onClick={() => setStep(2)} style={{ flex: 1, padding: "12px", borderRadius: 12, border: "1px solid #f0ebe8", background: "#fff", fontFamily: "Syne", fontWeight: 600, fontSize: 14, cursor: "pointer", color: "#6b6b6b" }}>
              ← Retour
            </button>
            <button type="button" onClick={handleSubmit} disabled={status === "loading"}
              style={{ flex: 2, padding: "13px", borderRadius: 12, border: "none", background: "var(--brand)", color: "#fff", fontFamily: "Syne", fontWeight: 700, fontSize: 15, cursor: "pointer", boxShadow: "0 4px 16px rgba(232,56,13,0.3)" }}>
              {status === "loading" ? "⏳ Envoi en cours…" : "✅ Soumettre ma candidature"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const lbl: React.CSSProperties = {
  fontSize: 13, fontWeight: 600, color: "#6b6b6b",
  display: "block", marginBottom: 8,
};
const inp: React.CSSProperties = {
  width: "100%", padding: "11px 14px", borderRadius: 10,
  border: "1px solid #f0ebe8", fontSize: 14, outline: "none",
  fontFamily: "DM Sans, sans-serif", background: "#fff",
  boxSizing: "border-box" as const, transition: "border-color 0.2s",
};
