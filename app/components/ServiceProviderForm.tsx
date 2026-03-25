"use client";

import { useState, useRef, useCallback } from "react";
import { createPartner } from "@/lib/api";

const SERVICE_CATEGORIES = [
  "Ménage à domicile",
  "Plomberie",
  "Électricité",
  "Climatisation",
  "Bricolage / Réparations",
  "Garde d'enfants",
  "Jardinage",
  "Coiffure à domicile",
  "Déménagement",
  "Cours particuliers",
  "Informatique / Dépannage PC",
  "Peinture / Carrelage",
  "Maçonnerie",
  "Sécurité / Gardiennage",
  "Massage / Bien-être",
  "Cuisine / Traiteur",
  "Couture / Retouches",
  "Urgences dépannage 24h/7j",
];

const EXPERIENCE_OPTIONS = ["Moins d'un an", "1 à 3 ans", "3 à 5 ans", "Plus de 5 ans"];
const AVAILABILITY_OPTIONS = ["Temps plein", "Temps partiel", "Week-end uniquement", "Sur rendez-vous", "Urgences 24h/7j"];

interface GeoSuggestion { display_name: string; lat: string; lon: string; address: any; }
type Status = "form" | "loading" | "success" | "error";

const BASE = process.env.NEXT_PUBLIC_URL_PROD || "http://localhost:3003";

export default function ServiceProviderForm() {
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [zone, setZone] = useState("");
  const [contact, setContact] = useState("");
  const [experience, setExperience] = useState("");
  const [availability, setAvailability] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [bio, setBio] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [imageUploading, setImageUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const [status, setStatus] = useState<Status>("form");
  const [error, setError] = useState("");

  const [geoQuery, setGeoQuery] = useState("");
  const [geoSuggestions, setGeoSuggestions] = useState<GeoSuggestion[]>([]);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoSelected, setGeoSelected] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const searchGeo = useCallback(async (q: string) => {
    if (q.length < 3) { setGeoSuggestions([]); return; }
    setGeoLoading(true);
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&countrycodes=sn&format=json&addressdetails=1&limit=6&accept-language=fr`;
      const res = await fetch(url, { headers: { "Accept-Language": "fr" } });
      setGeoSuggestions(await res.json());
    } catch { setGeoSuggestions([]); }
    finally { setGeoLoading(false); }
  }, []);

  const handleGeoInput = (val: string) => {
    setGeoQuery(val); setGeoSelected(false);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchGeo(val), 400);
  };

  const selectGeo = (s: GeoSuggestion) => {
    const addr = s.address;
    const detectedCity = addr.city || addr.town || addr.municipality || addr.county || "";
    const detectedZone = addr.suburb || addr.neighbourhood || addr.quarter || addr.village || addr.hamlet || addr.road || "";
    setGeoQuery(detectedZone || detectedCity || s.display_name.split(",")[0]);
    setCity(detectedCity); setZone(detectedZone);
    setGeoSelected(true); setGeoSuggestions([]);
  };

  const shortLabel = (s: GeoSuggestion) => {
    const addr = s.address;
    const parts = [addr.suburb || addr.neighbourhood || addr.quarter || addr.road || addr.village, addr.city || addr.town || addr.municipality].filter(Boolean);
    return parts.length ? parts.join(", ") : s.display_name.split(",").slice(0, 2).join(", ");
  };

  const handleImageUpload = async (file: File) => {
    setImageUploading(true);
    // Preview local immédiat
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(`${BASE}/partners/upload-profile-image`, { method: "POST", body: fd });
      const data = await res.json();
      setProfileImageUrl(data.url);
    } catch {
      setError("Erreur lors de l'upload de la photo.");
    } finally {
      setImageUploading(false);
    }
  };

  const toggleCategory = (cat: string) =>
    setSelectedCategories((prev) => prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]);

  const toggleAvailability = (opt: string) =>
    setAvailability((prev) => prev.includes(opt) ? prev.filter((a) => a !== opt) : [...prev, opt]);

  const canSend = name && city && contact && selectedCategories.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSend) return;
    setStatus("loading");
    try {
      await createPartner({
        type: "Prestataire",
        name, city,
        zone: zone || undefined,
        contact,
        message: [
          experience ? `Expérience : ${experience}` : null,
          availability.length ? `Disponibilité : ${availability.join(", ")}` : null,
          bio ? `À propos : ${bio}` : null,
        ].filter(Boolean).join(" | ") || undefined,
        serviceCategories: selectedCategories,
        profileImageUrl: profileImageUrl || undefined,
      });
      setStatus("success");
    } catch (err: any) {
      setError(err?.message || "Erreur inconnue");
      setStatus("error");
    }
  };

  // ── Initiales pour avatar par défaut ──
  const initials = name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "?";
  const hue = [...name].reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;

  if (status === "success") return (
    <div style={{ textAlign: "center", padding: "32px 0" }}>
      <div style={{ fontSize: 52, marginBottom: 14 }}>🎉</div>
      <h3 style={{ fontFamily: "Syne", fontWeight: 700, fontSize: 20, marginBottom: 10 }}>Candidature enregistrée !</h3>
      <p style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.7 }}>
        Bienvenue dans le réseau Yitewo. Notre équipe va examiner votre dossier et vous contacter sous 48h au <strong>{contact}</strong>.
      </p>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* ── Photo de profil ── */}
      <div>
        <label style={labelStyle}>📷 Photo de profil <span style={{ color: "var(--muted)", fontWeight: 400 }}>(optionnelle)</span></label>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {/* Avatar preview */}
          <div style={{
            width: 76, height: 76, borderRadius: "50%",
            border: "2px solid var(--border, #e5e5e5)",
            overflow: "hidden", flexShrink: 0,
            background: imagePreview ? "transparent" : `linear-gradient(135deg, hsl(${hue},50%,30%), hsl(${(hue + 60) % 360},60%,45%))`,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}>
            {imagePreview ? (
              <img src={imagePreview} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <span style={{ fontFamily: "Syne", fontWeight: 800, fontSize: 22, color: "#fff" }}>{initials}</span>
            )}
          </div>

          {/* Upload zone */}
          <label style={{
            cursor: "pointer",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            gap: 4,
            padding: "14px 20px",
            borderRadius: 12,
            border: "1.5px dashed var(--border, #e5e5e5)",
            fontSize: 13, color: "var(--muted)",
            fontFamily: "DM Sans",
            transition: "all 0.2s",
            flex: 1,
            background: "#fafafa",
          }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--brand)"; e.currentTarget.style.background = "var(--brand-light, #fff5f3)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border, #e5e5e5)"; e.currentTarget.style.background = "#fafafa"; }}
          >
            <span style={{ fontSize: 22 }}>{imageUploading ? "⏳" : imagePreview ? "✅" : "📸"}</span>
            <span style={{ fontWeight: 600, fontSize: 12 }}>
              {imageUploading ? "Envoi en cours…" : imagePreview ? "Photo ajoutée — changer" : "Ajouter une photo"}
            </span>
            <span style={{ fontSize: 11, color: "#bbb" }}>JPG, PNG, WEBP · max 5MB</span>
            <input
              type="file" accept="image/*" style={{ display: "none" }}
              onChange={(e) => { if (e.target.files?.[0]) handleImageUpload(e.target.files[0]); }}
            />
          </label>
        </div>
      </div>

      {/* ── Nom ── */}
      <div>
        <label style={labelStyle}>Nom complet *</label>
        <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Ex : Moussa Diallo" style={inputStyle} />
      </div>

      {/* ── Adresse géo ── */}
      <div ref={dropdownRef} style={{ position: "relative" }}>
        <label style={labelStyle}>
          Quartier / Zone d'intervention *
          <span style={{ fontSize: 11, fontWeight: 400, color: "#bbb", marginLeft: 8 }}>🗺️ OpenStreetMap</span>
        </label>
        <div style={{ position: "relative" }}>
          <input
            value={geoQuery}
            onChange={(e) => handleGeoInput(e.target.value)}
            placeholder="Tapez votre quartier… (ex: Mermoz, Plateau)"
            autoComplete="off"
            style={{ ...inputStyle, paddingRight: 40, borderColor: geoSelected ? "var(--brand)" : undefined, background: geoSelected ? "#fff8f6" : "#fff" }}
          />
          {geoLoading && <span style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: "#aaa" }}>⏳</span>}
          {geoSelected && !geoLoading && <span style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: "var(--brand)" }}>✓</span>}
        </div>
        {geoSuggestions.length > 0 && (
          <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, background: "#fff", border: "1px solid var(--border, #e5e5e5)", borderRadius: 12, boxShadow: "0 8px 32px rgba(0,0,0,0.12)", zIndex: 100, overflow: "hidden" }}>
            {geoSuggestions.map((s, i) => (
              <button key={i} type="button" onClick={() => selectGeo(s)}
                style={{ display: "block", width: "100%", textAlign: "left", padding: "11px 16px", background: "none", border: "none", borderBottom: i < geoSuggestions.length - 1 ? "1px solid #f5f5f5" : "none", cursor: "pointer", fontSize: 13, color: "#1a1a1a" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#fafafa")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
              >
                <span style={{ fontWeight: 600 }}>📍 {shortLabel(s)}</span>
                <span style={{ display: "block", fontSize: 11, color: "#aaa", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.display_name}</span>
              </button>
            ))}
          </div>
        )}
        {geoSelected && (city || zone) && (
          <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            {city && <span style={{ padding: "4px 12px", borderRadius: 99, fontSize: 12, background: "#fff5f3", color: "var(--brand)", border: "1px solid var(--brand)", fontWeight: 600 }}>🏙️ {city}</span>}
            {zone && <span style={{ padding: "4px 12px", borderRadius: 99, fontSize: 12, background: "#f5f5f5", color: "#555", border: "1px solid #e5e5e5", fontWeight: 500 }}>📌 {zone}</span>}
            <button type="button" onClick={() => { setGeoQuery(""); setCity(""); setZone(""); setGeoSelected(false); }} style={{ padding: "4px 10px", borderRadius: 99, fontSize: 11, background: "none", border: "1px solid #e5e5e5", color: "#aaa", cursor: "pointer" }}>✕ Changer</button>
          </div>
        )}
      </div>

      {/* ── WhatsApp ── */}
      <div>
        <label style={labelStyle}>Numéro WhatsApp *</label>
        <input value={contact} onChange={(e) => setContact(e.target.value)} required placeholder="Ex : 221 77 000 00 00" type="tel" style={inputStyle} />
      </div>

      {/* ── Catégories ── */}
      <div>
        <label style={labelStyle}>Votre / vos spécialités * <span style={{ color: "var(--muted)", fontWeight: 400 }}>(au moins une)</span></label>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {SERVICE_CATEGORIES.map((cat) => {
            const active = selectedCategories.includes(cat);
            return (
              <button type="button" key={cat} onClick={() => toggleCategory(cat)} style={{ padding: "6px 14px", borderRadius: 99, fontSize: 12, cursor: "pointer", border: "2px solid " + (active ? "var(--green)" : "var(--border)"), background: active ? "var(--green-light)" : "#fff", color: active ? "var(--green)" : "var(--muted)", fontWeight: active ? 700 : 400, transition: "all 0.18s" }}>
                {active ? "✓ " : ""}{cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Expérience ── */}
      <div>
        <label style={labelStyle}>Années d'expérience</label>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {EXPERIENCE_OPTIONS.map((opt) => (
            <button type="button" key={opt} onClick={() => setExperience(opt)} style={{ padding: "8px 18px", borderRadius: 99, fontSize: 13, cursor: "pointer", border: "2px solid " + (experience === opt ? "var(--brand)" : "var(--border)"), background: experience === opt ? "var(--brand-light)" : "#fff", color: experience === opt ? "var(--brand)" : "var(--muted)", fontWeight: experience === opt ? 700 : 400, transition: "all 0.18s" }}>
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* ── Disponibilités ── */}
      <div>
        <label style={labelStyle}>Disponibilités</label>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {AVAILABILITY_OPTIONS.map((opt) => {
            const active = availability.includes(opt);
            return (
              <button type="button" key={opt} onClick={() => toggleAvailability(opt)} style={{ padding: "6px 14px", borderRadius: 99, fontSize: 12, cursor: "pointer", border: "2px solid " + (active ? "var(--brand)" : "var(--border)"), background: active ? "var(--brand-light)" : "#fff", color: active ? "var(--brand)" : "var(--muted)", fontWeight: active ? 700 : 400, transition: "all 0.18s" }}>
                {active ? "✓ " : ""}{opt}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Bio ── */}
      <div>
        <label style={labelStyle}>Décrivez-vous en quelques mots <span style={{ color: "var(--muted)", fontWeight: 400 }}>(optionnel)</span></label>
        <textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Parlez de votre parcours, vos compétences, vos équipements…" style={{ ...inputStyle, height: 90, resize: "vertical" }} />
      </div>

      {status === "error" && (
        <div style={{ background: "#fee2e2", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#991b1b" }}>❌ {error || "Une erreur est survenue."}</div>
      )}

      <button type="submit" disabled={!canSend || status === "loading"} style={{ padding: "14px", borderRadius: 12, border: "none", background: canSend ? "var(--brand)" : "#ccc", color: "#fff", fontFamily: "Syne", fontWeight: 700, fontSize: 15, cursor: canSend ? "pointer" : "not-allowed", transition: "background 0.2s" }}>
        {status === "loading" ? "Envoi…" : "Soumettre ma candidature"}
      </button>
    </form>
  );
}

const labelStyle: React.CSSProperties = { fontSize: 13, fontWeight: 600, color: "var(--muted)", display: "block", marginBottom: 6 };
const inputStyle: React.CSSProperties = { width: "100%", padding: "11px 14px", borderRadius: 10, border: "1px solid var(--border, #e5e5e5)", fontSize: 14, outline: "none", fontFamily: "DM Sans, sans-serif", background: "#fff", boxSizing: "border-box" };
