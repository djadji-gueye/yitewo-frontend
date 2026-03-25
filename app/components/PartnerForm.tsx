"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createPartner } from "@/lib/api";

const PARTNER_TYPES = ["Marchand", "Restaurant"];
const BASE = process.env.NEXT_PUBLIC_URL_PROD || "http://localhost:3003";

interface Category { id: string; name: string; }
interface GeoSuggestion { display_name: string; lat: string; lon: string; address: any; }
type Status = "form" | "loading" | "success" | "error";

export default function PartnerForm({ forcedType }: { forcedType?: string } = {}) {
  const [type, setType] = useState(forcedType || "");
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [zone, setZone] = useState("");
  const [contact, setContact] = useState("");
  const [message, setMessage] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
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
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`${BASE}/categories`)
      .then((r) => r.json())
      .then(setCategories)
      .catch(() => { });
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setGeoSuggestions([]);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const searchGeo = useCallback(async (q: string) => {
    if (q.length < 3) { setGeoSuggestions([]); return; }
    setGeoLoading(true);
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&countrycodes=sn&format=json&addressdetails=1&limit=6&accept-language=fr`;
      const res = await fetch(url, { headers: { "Accept-Language": "fr" } });
      const data: GeoSuggestion[] = await res.json();
      setGeoSuggestions(data);
    } catch {
      setGeoSuggestions([]);
    } finally {
      setGeoLoading(false);
    }
  }, []);

  const handleGeoInput = (val: string) => {
    setGeoQuery(val);
    setGeoSelected(false);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchGeo(val), 400);
  };

  const selectGeo = (s: GeoSuggestion) => {
    const addr = s.address;
    const detectedCity = addr.city || addr.town || addr.municipality || addr.county || "";
    const detectedZone = addr.suburb || addr.neighbourhood || addr.quarter || addr.village || addr.hamlet || addr.road || "";
    const shortName = detectedZone || detectedCity;
    setGeoQuery(shortName || s.display_name.split(",")[0]);
    setCity(detectedCity);
    setZone(detectedZone);
    setGeoSelected(true);
    setGeoSuggestions([]);
  };

  const shortLabel = (s: GeoSuggestion) => {
    const addr = s.address;
    const parts = [
      addr.suburb || addr.neighbourhood || addr.quarter || addr.road || addr.village,
      addr.city || addr.town || addr.municipality,
    ].filter(Boolean);
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
    } catch { console.error("Logo upload failed"); }
    finally { setLogoUploading(false); }
  };

  const canSend = type && name && city && contact;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSend) return;
    setStatus("loading");
    try {
      await createPartner({
        type, name, city, zone: zone || undefined,
        contact, message: message || undefined,
        categories: selectedCats.length ? selectedCats : undefined,
        profileImageUrl: logoUrl || undefined,
      });
      setStatus("success");
    } catch (err: any) {
      setError(err?.message || "Erreur inconnue");
      setStatus("error");
    }
  };

  if (status === "success") return (
    <div style={{ textAlign: "center", padding: "32px 0" }}>
      <div style={{ fontSize: 52, marginBottom: 14 }}>🎉</div>
      <h3 style={{ fontFamily: "Syne", fontWeight: 700, fontSize: 20, marginBottom: 10 }}>
        Demande enregistrée !
      </h3>
      <p style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.7 }}>
        Bienvenue dans le réseau Yitewo. Notre équipe va examiner votre dossier et vous contacter sous 48h au <strong>{contact}</strong>.
      </p>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {!forcedType && <div>
        <label style={labelStyle}>Type de partenaire *</label>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {PARTNER_TYPES.map((t) => (
            <button type="button" key={t} onClick={() => setType(t)} style={{
              padding: "8px 18px", borderRadius: 99, fontSize: 13, cursor: "pointer",
              border: "2px solid " + (type === t ? "var(--brand)" : "var(--border)"),
              background: type === t ? "var(--brand-light)" : "#fff",
              color: type === t ? "var(--brand)" : "var(--muted)",
              fontWeight: type === t ? 700 : 400, transition: "all 0.18s",
            }}>{t}</button>
          ))}
        </div>
      </div>}

      {(type === "Marchand" || type === "Restaurant") && (
        <div>
          <label style={labelStyle}>🖼️ Logo / Photo de boutique <span style={{ fontWeight: 400, color: "#bbb" }}>(optionnel)</span></label>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 68, height: 68, borderRadius: 14, border: "2px solid var(--border, #e5e5e5)", overflow: "hidden", background: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {logoPreview ? <img src={logoPreview} alt="logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontSize: 26 }}>{type === "Restaurant" ? "🍽️" : "🏪"}</span>}
            </div>
            <label style={{ cursor: "pointer", flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "12px 16px", borderRadius: 10, border: "1.5px dashed var(--border, #e5e5e5)", fontSize: 12, color: "var(--muted)", background: "#fafafa" }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--brand)"; e.currentTarget.style.background = "var(--brand-light, #fff5f3)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border, #e5e5e5)"; e.currentTarget.style.background = "#fafafa"; }}
            >
              <span style={{ fontSize: 18 }}>{logoUploading ? "⏳" : logoPreview ? "✅" : "📸"}</span>
              <span style={{ fontWeight: 600 }}>{logoUploading ? "Envoi…" : logoPreview ? "Changer" : "Ajouter un logo"}</span>
              <span style={{ fontSize: 11, color: "#bbb" }}>JPG, PNG · max 5MB</span>
              <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => { if (e.target.files?.[0]) handleLogoUpload(e.target.files[0]); }} />
            </label>
          </div>
        </div>
      )}

      <div>
        <label style={labelStyle}>Nom / Enseigne *</label>
        <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Ex : Épicerie Coumba" style={inputStyle} />
      </div>

      <div ref={dropdownRef} style={{ position: "relative" }}>
        <label style={labelStyle}>
          Adresse / Quartier *
          <span style={{ fontSize: 11, fontWeight: 400, color: "#bbb", marginLeft: 8 }}>🗺️ OpenStreetMap</span>
        </label>
        <div style={{ position: "relative" }}>
          <input
            value={geoQuery}
            onChange={(e) => handleGeoInput(e.target.value)}
            placeholder="Tapez votre quartier, rue… (ex: Mermoz, Plateau)"
            autoComplete="off"
            style={{
              ...inputStyle,
              paddingRight: 40,
              borderColor: geoSelected ? "var(--brand)" : undefined,
              background: geoSelected ? "#fff8f6" : "#fff",
            }}
          />
          {geoLoading && (
            <span style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: "#aaa" }}>⏳</span>
          )}
          {geoSelected && !geoLoading && (
            <span style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: "var(--brand)" }}>✓</span>
          )}
        </div>

        {geoSuggestions.length > 0 && (
          <div style={{
            position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0,
            background: "#fff", border: "1px solid var(--border, #e5e5e5)",
            borderRadius: 12, boxShadow: "0 8px 32px rgba(0,0,0,0.12)", zIndex: 100, overflow: "hidden",
          }}>
            {geoSuggestions.map((s, i) => (
              <button key={i} type="button" onClick={() => selectGeo(s)} style={{
                display: "block", width: "100%", textAlign: "left",
                padding: "11px 16px", background: "none", border: "none",
                borderBottom: i < geoSuggestions.length - 1 ? "1px solid #f5f5f5" : "none",
                cursor: "pointer", fontSize: 13, color: "#1a1a1a",
              }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#fafafa")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
              >
                <span style={{ fontWeight: 600 }}>📍 {shortLabel(s)}</span>
                <span style={{ display: "block", fontSize: 11, color: "#aaa", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {s.display_name}
                </span>
              </button>
            ))}
          </div>
        )}

        {geoSelected && (city || zone) && (
          <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            {city && (
              <span style={{ padding: "4px 12px", borderRadius: 99, fontSize: 12, background: "#fff5f3", color: "var(--brand)", border: "1px solid var(--brand)", fontWeight: 600 }}>
                🏙️ {city}
              </span>
            )}
            {zone && (
              <span style={{ padding: "4px 12px", borderRadius: 99, fontSize: 12, background: "#f5f5f5", color: "#555", border: "1px solid #e5e5e5", fontWeight: 500 }}>
                📌 {zone}
              </span>
            )}
            <button type="button" onClick={() => { setGeoQuery(""); setCity(""); setZone(""); setGeoSelected(false); }} style={{
              padding: "4px 10px", borderRadius: 99, fontSize: 11, background: "none", border: "1px solid #e5e5e5", color: "#aaa", cursor: "pointer",
            }}>
              ✕ Changer
            </button>
          </div>
        )}
      </div>

      <div>
        <label style={labelStyle}>Numéro WhatsApp *</label>
        <input value={contact} onChange={(e) => setContact(e.target.value)} required placeholder="Ex : 221 77 000 00 00" type="tel" style={inputStyle} />
      </div>

      {type === "Marchand" && categories.length > 0 && (
        <div>
          <label style={labelStyle}>Catégories de produits</label>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {categories.map((cat) => {
              const active = selectedCats.includes(cat.id);
              return (
                <button type="button" key={cat.id}
                  onClick={() => setSelectedCats(active ? selectedCats.filter((id) => id !== cat.id) : [...selectedCats, cat.id])}
                  style={{
                    padding: "6px 14px", borderRadius: 99, fontSize: 12, cursor: "pointer",
                    border: "2px solid " + (active ? "var(--green)" : "var(--border)"),
                    background: active ? "var(--green-light)" : "#fff",
                    color: active ? "var(--green)" : "var(--muted)",
                    fontWeight: active ? 700 : 400,
                  }}>{cat.name}</button>
              );
            })}
          </div>
        </div>
      )}

      <div>
        <label style={labelStyle}>Message (optionnel)</label>
        <textarea value={message} onChange={(e) => setMessage(e.target.value)}
          placeholder="Parlez-nous de votre activité, vos produits, votre zone de couverture…"
          style={{ ...inputStyle, height: 90, resize: "vertical" }} />
      </div>

      {status === "error" && (
        <div style={{ background: "#fee2e2", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#991b1b" }}>
          ❌ {error || "Une erreur est survenue."}
        </div>
      )}

      <button type="submit" disabled={!canSend || status === "loading"} style={{
        padding: "14px", borderRadius: 12, border: "none",
        background: canSend ? "var(--brand)" : "#ccc",
        color: "#fff", fontFamily: "Syne", fontWeight: 700, fontSize: 15,
        cursor: canSend ? "pointer" : "not-allowed", transition: "background 0.2s",
      }}>
        {status === "loading" ? "Envoi…" : "Soumettre ma candidature"}
      </button>
    </form>
  );
}

const labelStyle: React.CSSProperties = { fontSize: 13, fontWeight: 600, color: "var(--muted)", display: "block", marginBottom: 6 };
const inputStyle: React.CSSProperties = { width: "100%", padding: "11px 14px", borderRadius: 10, border: "1px solid var(--border, #e5e5e5)", fontSize: 14, outline: "none", fontFamily: "DM Sans, sans-serif", background: "#fff", boxSizing: "border-box" };
