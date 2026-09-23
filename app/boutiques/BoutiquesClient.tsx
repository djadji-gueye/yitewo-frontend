"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

type BusinessType = "Marchand" | "Restaurant";
interface Partner {
  id: string;
  name: string;
  slug: string;
  type: BusinessType;
  city: string;
  zone?: string;
  address?: string;
  phone?: string;
  website?: string;
  profileImageUrl?: string;
  categories?: { name: string }[];
  lat?: number;
  lng?: number;
  promo?: { title: string; discount?: number } | null;
  isBusinessListing?: boolean;
}

const normalize = (value: unknown) => String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
const distanceKm = (aLat: number, aLng: number, bLat: number, bLng: number) => {
  const r = 6371;
  const dLat = (bLat - aLat) * Math.PI / 180;
  const dLng = (bLng - aLng) * Math.PI / 180;
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(aLat * Math.PI / 180) * Math.cos(bLat * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return r * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
};

function textFor(p: Partner) {
  return normalize([p.name, p.city, p.zone, p.address, p.phone, p.website, p.type, ...(p.categories || []).map((c) => c.name)].join(" "));
}

function avatar(p: Partner) {
  if (p.profileImageUrl) return p.profileImageUrl;
  return `https://api.dicebear.com/7.x/${p.type === "Restaurant" ? "rings" : "shapes"}/svg?seed=${encodeURIComponent(p.name)}&backgroundColor=ffffff&size=80`;
}

export default function BoutiquesClient({ partners }: { partners: Partner[] }) {
  const [search, setSearch] = useState("");
  const [type, setType] = useState<"all" | BusinessType>("all");
  const [category, setCategory] = useState("");
  const [city, setCity] = useState("Dakar");
  const [selected, setSelected] = useState<Partner | null>(null);
  const [nearMode, setNearMode] = useState(true);
  const [radius, setRadius] = useState(5);
  const [userPosition, setUserPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [geoLoading, setGeoLoading] = useState(true);
  const [geoError, setGeoError] = useState("");
  const [listView, setListView] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const mapRef = useRef<any>(null);
  const mapElement = useRef<HTMLDivElement>(null);
  const markersRef = useRef<any[]>([]);

  const cities = useMemo(() => [...new Set(partners.map((p) => p.city).filter(Boolean))].sort(), [partners]);
  const categories = useMemo(() => [...new Set(partners.flatMap((p) => (p.categories || []).map((c) => c.name)).filter(Boolean))].sort(), [partners]);
  const hasCriteria = !!search.trim() || type !== "all" || !!category;

  useEffect(() => {
    if (!navigator.geolocation) {
      setGeoLoading(false); setNearMode(false); setGeoError("Autorisez la localisation pour voir les commerces proches de vous."); return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => { setUserPosition({ lat: position.coords.latitude, lng: position.coords.longitude }); setGeoLoading(false); setNearMode(true); },
      () => { setGeoLoading(false); setNearMode(false); setGeoError("Autorisez la localisation pour voir les commerces proches de vous."); },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 },
    );
  }, []);

  const filtered = useMemo(() => {
    let result: Array<Partner & { distance?: number }>;
    const query = normalize(search);
    if (!hasCriteria && nearMode && userPosition) {
      result = partners.filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lng)).map((p) => ({ ...p, distance: distanceKm(userPosition.lat, userPosition.lng, p.lat!, p.lng!) })).filter((p) => p.distance! <= radius).sort((a, b) => a.distance! - b.distance!);
    } else if (hasCriteria && query) {
      const terms = query.split(/\s+/).filter(Boolean);
      result = partners.filter((p) => terms.every((term) => textFor(p).includes(term)));
    } else if (hasCriteria) {
      result = [...partners];
    } else {
      result = partners.filter((p) => normalize(p.city) === normalize(city));
    }
    if (type !== "all") result = result.filter((p) => p.type === type);
    if (category) result = result.filter((p) => p.categories?.some((c) => c.name === category));
    return result;
  }, [partners, search, type, category, city, nearMode, userPosition, radius, hasCriteria]);

  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      if (!mapElement.current || typeof window === "undefined") return;
      if (!(window as any).L) {
        await new Promise<void>((resolve) => { const script = document.createElement("script"); script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"; script.onload = () => resolve(); document.head.appendChild(script); });
      }
      if (cancelled || !mapElement.current) return;
      const L = (window as any).L;
      if (mapRef.current) mapRef.current.remove();
      mapRef.current = L.map(mapElement.current).setView([14.6937, -17.4441], 12);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "© OpenStreetMap", maxZoom: 19 }).addTo(mapRef.current);
      setMapReady(true);
    };
    init();
    return () => { cancelled = true; if (mapRef.current) mapRef.current.remove(); };
  }, []);

  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    const L = (window as any).L;
    markersRef.current.forEach((marker) => marker.remove()); markersRef.current = [];
    filtered.filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lng)).forEach((p) => {
      const marker = L.marker([p.lat, p.lng]).addTo(mapRef.current).bindPopup(`<strong>${p.name}</strong><br>${p.type}`).on("click", () => setSelected(p));
      markersRef.current.push(marker);
    });
    if (userPosition && !hasCriteria && nearMode) mapRef.current.setView([userPosition.lat, userPosition.lng], 14);
  }, [filtered, mapReady, userPosition, hasCriteria, nearMode]);

  return (
    <main style={{ height: "100vh", display: "flex", flexDirection: "column", background: "var(--surface)", fontFamily: "DM Sans, sans-serif" }}>
      <header style={{ background: "linear-gradient(135deg, #1a0500, #E8380D)", padding: 14, color: "#fff" }}>
        <div style={{ maxWidth: 1250, margin: "auto", display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <Link href="/" style={{ color: "#fff", textDecoration: "none" }}>← Accueil</Link>
          <strong style={{ flex: 1, fontSize: 18 }}>🗺️ Commerces proches — {filtered.length}</strong>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher un point Wave, commerce, ville…" style={{ minWidth: 240, padding: "9px 12px", borderRadius: 8, border: 0 }} />
          <select value={city} onChange={(e) => { setCity(e.target.value); setNearMode(false); setSelected(null); }} style={{ padding: 9, borderRadius: 8 }}>
            {cities.map((item) => <option key={item}>{item}</option>)}
          </select>
          <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ padding: 9, borderRadius: 8 }}>
            <option value="">Toutes catégories</option>{categories.map((item) => <option key={item}>{item}</option>)}
          </select>
          <div style={{ display: "flex", gap: 4 }}>{(["all", "Marchand", "Restaurant"] as const).map((item) => <button key={item} onClick={() => setType(item)} style={{ padding: "8px 10px", border: 0, borderRadius: 8, background: type === item ? "#fff" : "#ffffff33", color: type === item ? "#E8380D" : "#fff", cursor: "pointer" }}>{item === "all" ? "Tous" : item}</button>)}</div>
          <button onClick={() => setNearMode(!nearMode)} style={{ padding: "8px 12px", border: 0, borderRadius: 8, cursor: "pointer" }}>{nearMode ? "✓ Près de moi" : "📍 Près de chez vous"}</button>
        </div>
        {nearMode && <div style={{ maxWidth: 1250, margin: "8px auto 0", fontSize: 12 }}>Rayon : <input type="range" min="1" max="30" value={radius} onChange={(e) => setRadius(Number(e.target.value))} /> {radius} km {geoLoading ? "· Localisation…" : geoError ? `· ${geoError}` : ""}</div>}
      </header>
      <div style={{ display: "flex", gap: 12, padding: 12, flex: 1, minHeight: 0 }}>
        <div ref={mapElement} style={{ flex: 1, minHeight: 320, borderRadius: 12, overflow: "hidden", display: listView ? "none" : "block" }} />
        <section style={{ width: listView ? "100%" : 360, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
          <button onClick={() => setListView(!listView)} style={{ padding: 10, borderRadius: 8, border: "1px solid var(--border)", background: "#fff" }}>{listView ? "🗺️ Voir la carte" : "📋 Voir la liste"}</button>
          {filtered.map((p) => <article key={p.id} onClick={() => setSelected(p)} style={{ padding: 12, background: selected?.id === p.id ? "#eff6ff" : "#fff", border: "1px solid var(--border)", borderRadius: 10, cursor: "pointer" }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}><img src={avatar(p)} alt="" width={42} height={42} style={{ borderRadius: 9 }} /><div><strong>{p.name}</strong><div style={{ color: "var(--muted)", fontSize: 12 }}>{p.type} · {p.zone || p.city}</div></div></div>
            {p.distance !== undefined && <small style={{ color: "#059669" }}>{p.distance.toFixed(1)} km</small>}
            {p.categories?.length ? <div style={{ marginTop: 6, fontSize: 12, color: "#4f46e5" }}>{p.categories.map((c) => c.name).join(" · ")}</div> : null}
            {p.isBusinessListing ? <Link href={`/business/${p.slug}`} onClick={(e) => e.stopPropagation()} style={{ display: "block", marginTop: 8, textAlign: "center", color: "#2563eb" }}>Voir la fiche</Link> : <Link href={`/shop/${p.slug}`} onClick={(e) => e.stopPropagation()} style={{ display: "block", marginTop: 8, textAlign: "center", color: "var(--brand)" }}>Commander →</Link>}
          </article>)}
          {!filtered.length && <p style={{ padding: 20, background: "#fff", borderRadius: 10 }}>Aucun commerce trouvé. Élargissez le rayon ou essayez une autre recherche.</p>}
        </section>
      </div>
    </main>
  );
}
