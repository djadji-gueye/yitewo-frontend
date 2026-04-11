"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";

interface Partner {
  id: string;
  name: string;
  slug: string;
  type: string;
  city: string;
  zone?: string;
  address?: string;
  profileImageUrl?: string;
  categories?: { name: string }[];
  followers: number;
  avgRating?: number | null;
  reviewCount: number;
  bannerUrl?: string | null;
  promo?: { title: string; discount?: number } | null;
  lat: number;
  lng: number;
}

const CITY_COORDS: Record<string, [number, number]> = {
  "Dakar":       [14.6937, -17.4441],
  "Saint-Louis": [16.0326, -16.4818],
  "Thiès":       [14.7910, -16.9359],
  "Ziguinchor":  [12.5586, -16.2719],
};

function StarRating({ rating }: { rating: number }) {
  return (
    <span>
      {[1,2,3,4,5].map((i) => (
        <span key={i} style={{ fontSize: 11, color: i <= Math.round(rating) ? "#f59e0b" : "#e5e7eb" }}>★</span>
      ))}
    </span>
  );
}

function getAvatarUrl(name: string, type: string, profileImageUrl?: string) {
  if (profileImageUrl) return profileImageUrl;
  const seed = encodeURIComponent(name);
  const style = type === "Restaurant" ? "rings" : "shapes";
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}&backgroundColor=ffffff&size=60`;
}

// ── Map component using Leaflet ────────────────────────────
function PartnerMap({ partners, selected, onSelect, city }: {
  partners: Partner[];
  selected: Partner | null;
  onSelect: (p: Partner | null) => void;
  city: string;
}) {
  const mapRef  = useRef<any>(null);
  const mapElRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Load Leaflet dynamically
    const loadLeaflet = async () => {
      if (!mapElRef.current) return;

      // Load CSS
      if (!document.getElementById("leaflet-css")) {
        const link = document.createElement("link");
        link.id = "leaflet-css";
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }

      // Load JS
      if (!(window as any).L) {
        await new Promise<void>((resolve) => {
          const script = document.createElement("script");
          script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
          script.onload = () => resolve();
          document.head.appendChild(script);
        });
      }

      const L = (window as any).L;
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }

      const center = CITY_COORDS[city] || CITY_COORDS["Dakar"];
      const map = L.map(mapElRef.current, { zoomControl: true, scrollWheelZoom: true }).setView(center, 13);
      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      // Clear old markers
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      // Add markers
      partners.forEach((p) => {
        const isRestaurant = p.type === "Restaurant";
        const color = isRestaurant ? "#b45309" : "#0369a1";
        const emoji = isRestaurant ? "🍽️" : "🛒";

        const icon = L.divIcon({
          html: `<div style="
            width:36px;height:36px;border-radius:50%;
            background:${p.promo ? "#E8380D" : color};
            border:2.5px solid #fff;
            box-shadow:0 2px 8px rgba(0,0,0,0.3);
            display:flex;align-items:center;justify-content:center;
            font-size:16px;cursor:pointer;
            transform:${selected?.id === p.id ? "scale(1.3)" : "scale(1)"};
            transition:transform 0.2s;
          ">${p.promo ? "🔥" : emoji}</div>`,
          className: "",
          iconSize: [36, 36],
          iconAnchor: [18, 18],
        });

        const marker = L.marker([p.lat, p.lng], { icon })
          .addTo(map)
          .on("click", () => onSelect(p));

        markersRef.current.push(marker);
      });
    };

    loadLeaflet();
    return () => { if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; } };
  }, [partners, city]);

  // Pan to selected partner
  useEffect(() => {
    if (selected && mapRef.current) {
      mapRef.current.panTo([selected.lat, selected.lng], { animate: true, duration: 0.5 });
    }
  }, [selected]);

  return (
    <div ref={mapElRef} style={{ width: "100%", height: "100%", borderRadius: 0 }} />
  );
}

// ── Main component ─────────────────────────────────────────
export default function BoutiquesClient({ partners }: { partners: Partner[] }) {
  const [city, setCity]         = useState("Dakar");
  const [typeFilter, setType]   = useState<"all" | "Marchand" | "Restaurant">("all");
  const [search, setSearch]     = useState("");
  const [selected, setSelected] = useState<Partner | null>(null);
  const [listView, setListView] = useState(
    typeof window !== "undefined" && window.innerWidth < 768
  );

  const cities = useMemo(() => [...new Set(partners.map((p) => p.city))].sort(), [partners]);

  const filtered = useMemo(() => {
    let list = partners.filter((p) => p.city === city);
    if (typeFilter !== "all") list = list.filter((p) => p.type === typeFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((p) =>
        p.name.toLowerCase().includes(q) ||
        p.zone?.toLowerCase().includes(q) ||
        p.categories?.some((c) => c.name.toLowerCase().includes(q))
      );
    }
    return list;
  }, [partners, city, typeFilter, search]);

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "var(--surface)", fontFamily: "DM Sans, sans-serif" }}>

      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #1a0500 0%, #3a0c00 50%, #E8380D 100%)",
        padding: "14px 20px", flexShrink: 0, zIndex: 20,
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <Link href="/" style={{ color: "rgba(255,255,255,0.7)", textDecoration: "none", fontSize: 13 }}>← Accueil</Link>
          <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 18, color: "#fff", flex: 1 }}>
            🗺️ Carte des boutiques — {filtered.length} partenaire{filtered.length > 1 ? "s" : ""}
          </h1>

          {/* Search */}
          <div style={{ position: "relative", flex: "1 1 200px", maxWidth: 260 }}>
            <svg style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.5)" }}
              width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher…"
              style={{ width: "100%", padding: "8px 12px 8px 30px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.12)", color: "#fff", fontSize: 13, outline: "none" }} />
          </div>

          {/* City */}
          <select value={city} onChange={(e) => { setCity(e.target.value); setSelected(null); }}
            style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.12)", color: "#fff", fontSize: 13, outline: "none" }}>
            {cities.map((c) => <option key={c} value={c} style={{ background: "#1a1a2e" }}>{c}</option>)}
          </select>

          {/* Type */}
          <div style={{ display: "flex", gap: 4 }}>
            {(["all", "Marchand", "Restaurant"] as const).map((t) => (
              <button key={t} onClick={() => setType(t)} style={{
                padding: "6px 12px", borderRadius: 8, border: "none",
                background: typeFilter === t ? "#fff" : "rgba(255,255,255,0.15)",
                color: typeFilter === t ? "#E8380D" : "#fff",
                fontSize: 11, fontWeight: typeFilter === t ? 700 : 400, cursor: "pointer",
              }}>
                {t === "all" ? "Tous" : t === "Marchand" ? "🛒" : "🍽️"}
              </button>
            ))}
          </div>

          {/* Toggle view */}
          <button onClick={() => setListView(!listView)} style={{
            padding: "6px 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.2)",
            background: "rgba(255,255,255,0.12)", color: "#fff", fontSize: 11, cursor: "pointer",
          }}>
            {listView ? "🗺️ Voir la carte" : "📋 Liste des boutiques"}
          </button>
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden", position: "relative" }}>

        {/* Map */}
        {!listView && (
          <div style={{ flex: 1, position: "relative" }}>
            <PartnerMap partners={filtered} selected={selected} onSelect={setSelected} city={city} />

            {/* Legend */}
            <div style={{
              position: "absolute", bottom: 20, left: 12, zIndex: 1000,
              background: "rgba(255,255,255,0.95)", borderRadius: 10,
              padding: "8px 12px", fontSize: 11, boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            }}>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <span>🛒 Marchand</span>
                <span>🍽️ Restaurant</span>
                <span>🔥 Promo active</span>
              </div>
            </div>
          </div>
        )}

        {/* List view (mobile or toggle) */}
        {listView && (
          <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
              {filtered.map((p) => (
                <PartnerCard key={p.id} p={p} selected={selected?.id === p.id} onClick={() => setSelected(selected?.id === p.id ? null : p)} />
              ))}
            </div>
          </div>
        )}

        {/* Side panel — desktop sidebar / mobile bottom sheet */}
        {selected && !listView && (
          <div style={{
            width: "clamp(280px, 30vw, 340px)", flexShrink: 0, background: "#fff",
            borderLeft: "1px solid var(--border)", overflowY: "auto",
            animation: "slideIn 0.2s ease",
            // Mobile: bottom sheet
          }} className="partner-panel">
          <style>{`
            @media (max-width: 768px) {
              .partner-panel {
                position: fixed !important;
                bottom: 0; left: 0; right: 0;
                width: 100% !important;
                max-height: 65vh;
                border-left: none !important;
                border-top: 1px solid var(--border);
                border-radius: 16px 16px 0 0;
                box-shadow: 0 -8px 32px rgba(0,0,0,0.15);
                z-index: 500;
              }
            }
          `}</style>
            <style>{`@keyframes slideIn { from { transform: translateX(100%) } to { transform: translateX(0) } }`}</style>

            {/* Cover — bannière perso ou gradient */}
            <div style={{ height: 120, background: selected.bannerUrl ? "none" : "linear-gradient(135deg, #1a0500, #E8380D)", position: "relative", overflow: "hidden" }}>
              {selected.bannerUrl && (
                <img src={selected.bannerUrl} alt="bannière" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={(e) => { (e.target as HTMLImageElement).style.display="none"; (e.target as HTMLImageElement).parentElement!.style.background="linear-gradient(135deg,#1a0500,#E8380D)"; }} />
              )}
              <button onClick={() => setSelected(null)} style={{
                position: "absolute", top: 10, right: 10,
                background: "rgba(0,0,0,0.4)", border: "none", borderRadius: "50%",
                width: 28, height: 28, color: "#fff", cursor: "pointer", fontSize: 14,
              }}>✕</button>

              {/* Promo */}
              {selected.promo && (
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "rgba(232,56,13,0.9)", padding: "6px 14px", fontSize: 11, color: "#fff", fontWeight: 700 }}>
                  🔥 {selected.promo.title}
                  {selected.promo.discount && <span style={{ marginLeft: 6, background: "rgba(255,255,255,0.25)", borderRadius: 99, padding: "1px 6px" }}>-{selected.promo.discount}%</span>}
                </div>
              )}
            </div>

            {/* Avatar */}
            <div style={{ padding: "0 20px" }}>
              <div style={{ width: 64, height: 64, borderRadius: 14, border: "3px solid #fff", overflow: "hidden", marginTop: -32, boxShadow: "0 4px 12px rgba(0,0,0,0.15)", background: "#f7f4f2" }}>
                <img src={getAvatarUrl(selected.name, selected.type, selected.profileImageUrl)} alt={selected.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            </div>

            <div style={{ padding: "12px 20px 24px" }}>
              <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 18, color: "var(--text)", marginBottom: 4 }}>
                {selected.name}
              </h2>
              <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 8 }}>
                {selected.type === "Restaurant" ? "🍽️" : "🛒"} {selected.type} · {selected.zone ? `${selected.zone}, ` : ""}{selected.city}
              </p>

              {selected.avgRating && selected.reviewCount > 0 && (
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                  <StarRating rating={selected.avgRating} />
                  <span style={{ fontSize: 13, fontWeight: 700 }}>{selected.avgRating}</span>
                  <span style={{ fontSize: 12, color: "var(--muted)" }}>({selected.reviewCount} avis)</span>
                </div>
              )}

              {selected.followers > 0 && (
                <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 10 }}>
                  ♥ {selected.followers} abonné{selected.followers > 1 ? "s" : ""}
                </p>
              )}

              {selected.address && (
                <div style={{ display: "flex", gap: 6, alignItems: "flex-start", marginBottom: 14, padding: "8px 12px", background: "var(--surface)", borderRadius: 8 }}>
                  <span>📍</span>
                  <p style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.5 }}>{selected.address}</p>
                </div>
              )}

              {selected.categories && selected.categories.length > 0 && (
                <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 16 }}>
                  {selected.categories.map((c) => (
                    <span key={c.name} style={{ fontSize: 11, padding: "3px 9px", borderRadius: 99, background: "#f0f0ff", color: "#4f46e5" }}>{c.name}</span>
                  ))}
                </div>
              )}

              <Link href={`/order?partner=${selected.slug}`} style={{
                display: "block", padding: "12px", borderRadius: 12,
                background: "var(--brand)", color: "#fff", textAlign: "center",
                textDecoration: "none", fontFamily: "Syne, sans-serif",
                fontWeight: 700, fontSize: 14,
              }}>
                Commander chez {selected.name} →
              </Link>
            </div>
          </div>
        )}

        {/* Partners list sidebar (desktop, when no selection) */}
        {!listView && !selected && filtered.length > 0 && (
          <div style={{
            width: 280, flexShrink: 0, background: "#fff",
            borderLeft: "1px solid var(--border)", overflowY: "auto",
          }}>
            <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--border)" }}>
              <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 14, color: "var(--text)" }}>
                {filtered.length} boutique{filtered.length > 1 ? "s" : ""} à {city}
              </p>
            </div>
            <div style={{ padding: "8px" }}>
              {filtered.map((p) => (
                <button key={p.id} onClick={() => setSelected(p)} style={{
                  width: "100%", textAlign: "left", padding: "10px 12px",
                  borderRadius: 10, border: "none", cursor: "pointer",
                  background: "transparent", marginBottom: 4,
                  transition: "background 0.15s",
                }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, overflow: "hidden", flexShrink: 0, background: "var(--surface)" }}>
                      <img src={getAvatarUrl(p.name, p.type, p.profileImageUrl)} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</p>
                      <p style={{ fontSize: 11, color: "var(--muted)" }}>
                        {p.zone || p.city}
                        {p.avgRating ? ` · ⭐ ${p.avgRating}` : ""}
                        {p.promo ? " · 🔥" : ""}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    {/* Mobile floating map button */}
    {listView && (
      <div style={{ display: "none" }} className="mobile-map-btn">
        <style>{`.mobile-map-btn { display: block !important; position: fixed; bottom: 80px; right: 16px; z-index: 100; } @media (min-width: 769px) { .mobile-map-btn { display: none !important; } }`}</style>
        <button onClick={() => setListView(false)} style={{ padding: "10px 18px", borderRadius: 99, border: "none", background: "#E8380D", color: "#fff", fontWeight: 700, fontSize: 13, boxShadow: "0 4px 16px rgba(232,56,13,0.4)", cursor: "pointer" }}>
          🗺️ Voir la carte
        </button>
      </div>
    )}
    {!listView && !selected && (
      <div style={{ display: "none" }} className="mobile-list-btn">
        <style>{`.mobile-list-btn { display: block !important; position: fixed; bottom: 80px; left: 16px; z-index: 100; } @media (min-width: 769px) { .mobile-list-btn { display: none !important; } }`}</style>
        <button onClick={() => setListView(true)} style={{ padding: "10px 18px", borderRadius: 99, border: "none", background: "#fff", color: "#1a1a1a", fontWeight: 700, fontSize: 13, boxShadow: "0 4px 16px rgba(0,0,0,0.15)", cursor: "pointer" }}>
          📋 {filtered.length} boutiques
        </button>
      </div>
    )}
    </div>
  );
}

function PartnerCard({ p, selected, onClick }: { p: Partner; selected: boolean; onClick: () => void }) {
  return (
    <div onClick={onClick} style={{
      background: "#fff", borderRadius: 14, border: `1.5px solid ${selected ? "var(--brand)" : "var(--border)"}`,
      padding: "14px", cursor: "pointer", transition: "all 0.18s",
    }}>
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
        <div style={{ width: 44, height: 44, borderRadius: 10, overflow: "hidden", flexShrink: 0, background: "var(--surface)" }}>
          <img src={getAvatarUrl(p.name, p.type, p.profileImageUrl)} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 14, color: "var(--text)", marginBottom: 2 }}>{p.name}</p>
          <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 6 }}>📍 {p.zone || p.city}</p>
          {p.avgRating && p.reviewCount > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <StarRating rating={p.avgRating} />
              <span style={{ fontSize: 11, color: "var(--muted)" }}>({p.reviewCount})</span>
            </div>
          )}
        </div>
        {p.promo && <span style={{ fontSize: 10, background: "#fff5f3", color: "#E8380D", border: "1px solid #fdd0c5", borderRadius: 99, padding: "2px 7px", fontWeight: 700, flexShrink: 0 }}>🔥 Promo</span>}
      </div>
      <Link href={`/order?partner=${p.slug}`} onClick={(e) => e.stopPropagation()} style={{
        display: "block", marginTop: 12, padding: "8px", borderRadius: 8,
        background: "var(--brand-light)", color: "var(--brand)", textAlign: "center",
        textDecoration: "none", fontSize: 12, fontWeight: 700,
      }}>
        Commander →
      </Link>
    </div>
  );
}
