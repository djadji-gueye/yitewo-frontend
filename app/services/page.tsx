"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import LocationPicker, { LocationValue } from "@/components/LocationPicker";
import { createServiceRequest } from "@/lib/api";

const BASE = process.env.NEXT_PUBLIC_URL_PROD || "http://localhost:3003";

const SERVICES = [
  { name: "Ménage à domicile", icon: "🧹", desc: "Nettoyage complet ou partiel de votre intérieur", color: "#0369a1", bg: "#e0f2fe", grad: "linear-gradient(135deg,#0c4a6e,#0ea5e9)", tag: "Populaire" },
  { name: "Plombier", icon: "🚰", desc: "Fuites, robinetterie, sanitaire, tuyauterie", color: "#0f766e", bg: "#ccfbf1", grad: "linear-gradient(135deg,#134e4a,#0f9488)", tag: null },
  { name: "Électricien", icon: "💡", desc: "Câblage, pannes électriques, installation", color: "#b45309", bg: "#fef3c7", grad: "linear-gradient(135deg,#78350f,#d97706)", tag: null },
  { name: "Climatisation", icon: "❄️", desc: "Installation, entretien et dépannage clim", color: "#6d28d9", bg: "#ede9fe", grad: "linear-gradient(135deg,#4c1d95,#7c3aed)", tag: null },
  { name: "Coatch sportif", icon: "🏋️", desc: "Coaching sportif personnalisé à domicile", color: "#065f46", bg: "#d1fae5", grad: "linear-gradient(135deg,#064e3b,#059669)", tag: null },
  { name: "Garde d'enfants", icon: "👶", desc: "Baby-sitter expérimentée à domicile", color: "#be185d", bg: "#fce7f3", grad: "linear-gradient(135deg,#831843,#db2777)", tag: null },
  { name: "Jardinage", icon: "🌿", desc: "Entretien jardin, taille haies, désherbage", color: "#15803d", bg: "#dcfce7", grad: "linear-gradient(135deg,#14532d,#16a34a)", tag: null },
  { name: "Coiffeur à domicile", icon: "✂️", desc: "Coupe, coiffure, tresses à domicile", color: "#c2410c", bg: "#ffedd5", grad: "linear-gradient(135deg,#7c2d12,#ea580c)", tag: "Nouveau" },
  { name: "Déménagement", icon: "📦", desc: "Transport, emballage et installation", color: "#1d4ed8", bg: "#dbeafe", grad: "linear-gradient(135deg,#1e3a8a,#2563eb)", tag: null },
  { name: "Cours particuliers", icon: "📚", desc: "Soutien scolaire, langues, mathématiques", color: "#7e22ce", bg: "#f3e8ff", grad: "linear-gradient(135deg,#581c87,#9333ea)", tag: null },
  { name: "Informatique", icon: "💻", desc: "Dépannage PC, installation, réseau Wi-Fi", color: "#0e7490", bg: "#cffafe", grad: "linear-gradient(135deg,#164e63,#0891b2)", tag: null },
  { name: "Urgence dépannage", icon: "🚨", desc: "Intervention rapide toutes urgences 24h/7j", color: "#991b1b", bg: "#fee2e2", grad: "linear-gradient(135deg,#7f1d1d,#dc2626)", tag: "Urgent" },
];

const SERVICE_ICONS: Record<string, string> = {
  "Ménage": "🧹", "Plomberie": "🚰", "Plombier": "🚰", "Livreur": "🚴",
  "Électricité": "⚡", "Électricien": "💡", "Climatisation": "❄️",
  "Bricolage": "🛠️", "Coatch sportif": "🏋️", "Garde": "👶", "Jardinage": "🌿",
  "Coiffure": "✂️", "Déménagement": "📦", "Cours": "📚",
  "Informatique": "💻", "Peinture": "🖌️", "Maçonnerie": "🧱",
  "Sécurité": "🛡️", "Massage": "💆", "Cuisine": "🍽️",
  "Couture": "🪡", "Urgence": "🚨",
};

interface Provider {
  id: string; name: string; city: string; zone?: string;
  contact: string; serviceCategories?: string[];
  message?: string; profileImageUrl?: string;
  // — Prévu pour la fiche détail prestataire —
  workImageUrl?: string; // photo(s) terrain
  rating?: number; // note moyenne (futur système d'avis)
  reviewsCount?: number; // nombre d'avis (futur système d'avis)
  lat?: number; lng?: number;
}

const parseMessage = (msg?: string) => ({
  experience: msg?.match(/Exp[ée]rience\s*:\s*([^|]+)/i)?.[1]?.trim(),
  disponibilite: msg?.match(/Disponibilit[ée]\s*:\s*([^|]+)/i)?.[1]?.trim(),
  bio: msg?.match(/[Àa]\s*propos\s*:\s*(.+?)(?:\s*\|.*)?$/i)?.[1]?.trim(),
  workImageUrl: msg?.match(/Photo\s*terrain\s*:\s*(\S+)/i)?.[1]?.trim(),
});

function getServiceIcon(service: string, fallback?: string) {
  if (fallback) return fallback;
  for (const [key, icon] of Object.entries(SERVICE_ICONS)) {
    if (service?.toLowerCase().includes(key.toLowerCase())) return icon;
  }
  return "🔧";
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "À l'instant";
  if (mins < 60) return `Il y a ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `Il y a ${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "Hier";
  return `Il y a ${days}j`;
}

function StarStatic({ n }: { n: number }) {
  return <span style={{ color: "#f59e0b", fontSize: 12 }}>{"★".repeat(n)}{"☆".repeat(5 - n)}</span>;
}

export default function ServicesPage() {
  const [tab, setTab] = useState<"services" | "providers" | "offres">("services");
  const [step, setStep] = useState<"list" | "form" | "loading" | "success" | "error">("list");
  const [service, setService] = useState<typeof SERVICES[0] | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [location, setLocation] = useState<LocationValue>({ city: "Dakar", quarter: "", deliveryFee: 0 });
  const [description, setDescription] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [providers, setProviders] = useState<Provider[]>([]);
  const [providersLoading, setProvidersLoading] = useState(false);
  const [filterCat, setFilterCat] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [nearMode, setNearMode] = useState(false);
  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLng, setUserLng] = useState<number | null>(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [radius, setRadius] = useState(5);
  const [selectedProvider, setSelectedProvider] = useState<(Provider & { bio?: string; experience?: string; disponibilite?: string; workImageUrl?: string }) | null>(null);
  const [providerModalOpen, setProviderModalOpen] = useState(false);

  // — Offres tab state —
  const [offres, setOffres] = useState<any[]>([]);
  const [offresLoading, setOffresLoading] = useState(false);
  const [offresSearch, setOffresSearch] = useState("");

  useEffect(() => {
    if (tab === "providers") {
      setProvidersLoading(true);
      fetch(`${BASE}/partners/public/active`)
        .then((r) => r.json())
        .then(setProviders)
        .catch(() => setProviders([]))
        .finally(() => setProvidersLoading(false));
    }
    if (tab === "offres" && offres.length === 0) {
      setOffresLoading(true);
      // Endpoint public — pas de token, retourne les demandes PENDING sans infos client
      fetch(`${BASE}/service-requests/public`)
        .then((r) => r.json())
        .then((d) => setOffres(Array.isArray(d) ? d : []))
        .catch(() => setOffres([]))
        .finally(() => setOffresLoading(false));
    }
  }, [tab]);

  const openForm = (s: typeof SERVICES[0]) => { setService(s); setDrawerOpen(true); setStep("form"); };
  const closeDrawer = () => { setDrawerOpen(false); setTimeout(() => { if (step !== "success") setStep("list"); }, 300); };

  const openProviderModal = (provider: Provider) => {
    setSelectedProvider({ ...provider, ...parseMessage(provider.message) });
    setProviderModalOpen(true);
  };
  const closeProviderModal = () => { setProviderModalOpen(false); setTimeout(() => setSelectedProvider(null), 300); };

  const handleSend = async () => {
    if (!service || !location.quarter) return;
    setStep("loading");
    try {
      await createServiceRequest({ service: service.name, city: location.city, quarter: location.quarter, description: description || undefined, customerName: name || undefined, customerPhone: phone || undefined });
      setStep("success");
    } catch { setStep("error"); }
  };

  const resetForm = () => { setService(null); setDescription(""); setName(""); setPhone(""); setLocation({ city: "Dakar", quarter: "", deliveryFee: 0 }); setStep("list"); setDrawerOpen(false); };

  const haversine = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const requestGeo = () => {
    if (!navigator.geolocation) return;
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => { setUserLat(pos.coords.latitude); setUserLng(pos.coords.longitude); setNearMode(true); setGeoLoading(false); },
      () => setGeoLoading(false)
    );
  };

  const cats = [...new Set(providers.flatMap((p) => p.serviceCategories || []))];
  const filteredProviders = providers
    .filter((p) => !filterCat || p.serviceCategories?.includes(filterCat))
    .filter((p) => !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.zone?.toLowerCase().includes(search.toLowerCase()))
    .filter((p) => {
      if (!nearMode || userLat === null || userLng === null) return true;
      if (!p.lat || !p.lng) return true;
      return haversine(userLat, userLng, p.lat, p.lng) <= radius;
    })
    .sort((a, b) => {
      if (!nearMode || userLat === null || userLng === null) return 0;
      const da = (a.lat && a.lng) ? haversine(userLat, userLng, a.lat, a.lng) : 999;
      const db = (b.lat && b.lng) ? haversine(userLat, userLng, b.lat, b.lng) : 999;
      return da - db;
    });

  const filteredOffres = offres.filter((o) =>
    !offresSearch ||
    o.service?.toLowerCase().includes(offresSearch.toLowerCase()) ||
    o.city?.toLowerCase().includes(offresSearch.toLowerCase())
  );

  const TABS = [
    { key: "services", label: "🔍 Trouver un service" },
    { key: "providers", label: `👷 Nos prestataires${providers.length > 0 ? ` (${providers.length})` : ""}` },
    { key: "offres", label: `📋 Offres${offres.length > 0 ? ` (${offres.length})` : ""}` },
  ];

  return (
    <div style={{ background: "var(--surface)", minHeight: "100vh", fontFamily: "DM Sans, sans-serif" }}>

      {/* HERO */}
      <div style={{ background: "linear-gradient(135deg, #0d3320 0%, #1A9E5F 100%)", padding: "44px 20px 0", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -60, right: -60, width: 260, height: 260, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
        <div style={{ maxWidth: 900, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.12)", borderRadius: 99, padding: "5px 14px", marginBottom: 16 }}>
            <span>⚡</span>
            <span style={{ color: "#d1fae5", fontSize: 12, fontWeight: 500 }}>Professionnels vérifiés · Intervention rapide</span>
          </div>
          <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "clamp(26px,5vw,40px)", color: "#fff", marginBottom: 10, lineHeight: 1.2 }}>
            Services à domicile
          </h1>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 15, lineHeight: 1.6, maxWidth: 520, marginBottom: 32 }}>
            Des professionnels qualifiés disponibles rapidement chez vous partout au Sénégal.
          </p>
          {/* Tabs */}
          <div style={{ display: "flex", gap: 4 }}>
            {TABS.map((t) => (
              <button key={t.key} onClick={() => setTab(t.key as any)} style={{ padding: "12px 22px", borderRadius: "10px 10px 0 0", border: "none", cursor: "pointer", fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 13, transition: "all 0.2s", background: tab === t.key ? "#fff" : "rgba(255,255,255,0.12)", color: tab === t.key ? "var(--text)" : "rgba(255,255,255,0.75)" }}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 16px 80px" }}>

        {/* ── SERVICES TAB ── */}
        {tab === "services" && (
          <>
            {/* Stats bar */}
            <div style={{ display: "flex", gap: 20, marginBottom: 28, flexWrap: "wrap" }}>
              {[
                { icon: "⚡", label: "Intervention en moins de 2h", color: "#0369a1" },
                { icon: "✅", label: "Prestataires vérifiés", color: "#065f46" },
                { icon: "📞", label: "Suivi en temps réel", color: "#6d28d9" },
              ].map((s) => (
                <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--muted)" }}>
                  <span style={{ fontSize: 16 }}>{s.icon}</span>
                  <span style={{ fontWeight: 500 }}>{s.label}</span>
                </div>
              ))}
            </div>

            <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 18, color: "var(--text)", marginBottom: 20 }}>
              Quel service vous faut-il ?
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14 }}>
              {SERVICES.map((s) => (
                <button key={s.name} onClick={() => openForm(s)} className="product-card" style={{ background: "#fff", borderRadius: 18, border: "1px solid var(--border)", overflow: "hidden", cursor: "pointer", textAlign: "left", padding: 0, display: "flex", flexDirection: "column" }}>
                  <div style={{ height: 86, background: s.grad, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", position: "relative", overflow: "hidden" }}>
                    <div style={{ position: "absolute", top: -30, right: -30, width: 100, height: 100, borderRadius: "50%", background: "rgba(255,255,255,0.1)" }} />
                    <span style={{ fontSize: 36 }}>{s.icon}</span>
                    {s.tag && <span style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase" as const, padding: "4px 10px", borderRadius: 99, background: "rgba(255,255,255,0.2)", color: "#fff" }}>{s.tag}</span>}
                  </div>
                  <div style={{ padding: "14px 16px 16px" }}>
                    <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 14, color: "var(--text)", marginBottom: 4 }}>{s.name}</p>
                    <p style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.5, marginBottom: 12 }}>{s.desc}</p>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 99, background: s.bg, color: s.color, fontSize: 11, fontWeight: 700 }}>Demander →</div>
                  </div>
                </button>
              ))}
            </div>

            {/* CTA Prestataire */}
            <div style={{ marginTop: 48, background: "linear-gradient(135deg, #0d3320, #1A9E5F)", borderRadius: 20, padding: "28px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
              <div>
                <p style={{ fontFamily: "Syne", fontWeight: 800, fontSize: 18, color: "#fff", marginBottom: 6 }}>Vous êtes prestataire de services ?</p>
                <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 13, lineHeight: 1.6 }}>Rejoignez notre réseau et recevez des missions près de chez vous.</p>
              </div>
              <Link href="/partners" style={{ padding: "12px 24px", borderRadius: 10, background: "#fff", color: "#0d3320", fontFamily: "Syne", fontWeight: 700, fontSize: 13, textDecoration: "none", whiteSpace: "nowrap" as const, flexShrink: 0 }}>
                Devenir prestataire →
              </Link>
            </div>
          </>
        )}

        {/* ── PROVIDERS TAB ── */}
        {tab === "providers" && (
          <>
            {/* Search + filters */}
            <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
              <input value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="🔍 Rechercher un prestataire…"
                style={{ flex: "1 1 200px", padding: "10px 14px", borderRadius: 10, border: "1px solid var(--border)", fontSize: 13, outline: "none", background: "#fff" }} />
              <button
                onClick={() => { if (nearMode) { setNearMode(false); } else { requestGeo(); } }}
                disabled={geoLoading}
                style={{ padding: "10px 16px", borderRadius: 10, border: `1.5px solid ${nearMode ? "#E8380D" : "var(--border)"}`, background: nearMode ? "#fff5f3" : "#fff", color: nearMode ? "#E8380D" : "var(--muted)", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" as const, transition: "all 0.2s" }}>
                {geoLoading ? "⏳" : "📍"} {geoLoading ? "Localisation…" : nearMode ? "Près de moi" : "À mes alentours"}
              </button>
            </div>

            {nearMode && userLat !== null && (
              <div style={{ background: "#fff5f3", border: "1px solid #fdd0c5", borderRadius: 12, padding: "12px 16px", marginBottom: 16, display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 13, color: "#E8380D", fontWeight: 700, whiteSpace: "nowrap" as const }}>📍 Rayon</span>
                <input type="range" min={1} max={25} step={1} value={radius} onChange={(e) => setRadius(Number(e.target.value))}
                  style={{ flex: 1, accentColor: "#E8380D" }} />
                <span style={{ fontSize: 13, color: "#E8380D", fontWeight: 700, minWidth: 42 }}>{radius} km</span>
                <span style={{ fontSize: 12, color: "var(--muted)", whiteSpace: "nowrap" as const }}>
                  {filteredProviders.length} prestataire{filteredProviders.length > 1 ? "s" : ""}
                </span>
              </div>
            )}

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, gap: 8, flexWrap: "wrap" }}>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <button onClick={() => setFilterCat(null)} style={pillStyle(!filterCat)}>Tous</button>
                {cats.map((c) => <button key={c} onClick={() => setFilterCat(c)} style={pillStyle(filterCat === c)}>{c}</button>)}
              </div>
              {!nearMode && providers.length > 0 && <span style={{ fontSize: 12, color: "var(--muted)" }}>{filteredProviders.length} prestataire{filteredProviders.length > 1 ? "s" : ""}</span>}
            </div>

            {providersLoading ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
                {[...Array(4)].map((_, i) => (
                  <div key={i} style={{ background: "#fff", borderRadius: 20, border: "1px solid var(--border)", overflow: "hidden", animation: "pulse 1.5s ease-in-out infinite", animationDelay: `${i * 0.12}s` }}>
                    <div style={{ height: 88, background: "#f0f0f0" }} />
                    <div style={{ padding: "40px 18px 18px" }}>
                      <div style={{ width: "60%", height: 16, borderRadius: 6, background: "#f0f0f0", marginBottom: 8 }} />
                      <div style={{ width: "40%", height: 13, borderRadius: 6, background: "#f5f5f5", marginBottom: 16 }} />
                      <div style={{ width: "100%", height: 36, borderRadius: 10, background: "#f0f0f0" }} />
                    </div>
                  </div>
                ))}
                <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}`}</style>
              </div>
            ) : filteredProviders.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 20px", background: "#fff", borderRadius: 20, border: "1px solid var(--border)" }}>
                <div style={{ fontSize: 52, marginBottom: 14 }}>👷</div>
                <p style={{ fontFamily: "Syne", fontWeight: 700, fontSize: 18, color: "var(--text)", marginBottom: 8 }}>
                  {search ? "Aucun résultat" : "Aucun prestataire pour l'instant"}
                </p>
                <p style={{ color: "var(--muted)", fontSize: 13, lineHeight: 1.7, maxWidth: 340, margin: "0 auto 24px" }}>
                  {search ? "Essayez un autre nom ou service." : "Nos prestataires seront bientôt visibles ici."}
                </p>
                <Link href="/partners" style={{ padding: "11px 22px", borderRadius: 10, background: "var(--green)", color: "#fff", fontFamily: "Syne", fontWeight: 700, fontSize: 13, textDecoration: "none" }}>
                  Devenir prestataire
                </Link>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
                {filteredProviders.map((p) => {
                  const parsed = parseMessage(p.message);
                  return <ProviderCard key={p.id} provider={p} {...parsed} onClick={() => openProviderModal(p)} />;
                })}
              </div>
            )}
          </>
        )}

        {/* ── OFFRES TAB ── */}
        {tab === "offres" && (
          <>
            {/* Header informatif */}
            <div style={{ background: "linear-gradient(135deg, #f0fdf4, #dcfce7)", border: "1px solid #a7f3d0", borderRadius: 16, padding: "18px 22px", marginBottom: 24, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
              <div style={{ fontSize: 32 }}>📋</div>
              <div style={{ flex: 1, minWidth: 180 }}>
                <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 14, color: "#065f46", marginBottom: 4 }}>
                  Demandes de service en cours
                </p>
                <p style={{ fontSize: 12, color: "#6b6b6b", lineHeight: 1.6 }}>
                  Des clients cherchent un professionnel dès maintenant. Inscrivez-vous comme prestataire pour postuler.
                </p>
              </div>
              <Link href="/partners"
                style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 20px", borderRadius: 99, background: "#1A9E5F", color: "#fff", textDecoration: "none", fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 12, flexShrink: 0, whiteSpace: "nowrap" as const }}>
                Devenir prestataire →
              </Link>
            </div>

            {/* Barre recherche */}
            <div style={{ position: "relative", marginBottom: 20 }}>
              <svg style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#aaa", pointerEvents: "none" }} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                value={offresSearch}
                onChange={(e) => setOffresSearch(e.target.value)}
                placeholder="Filtrer par service ou ville…"
                style={{ width: "100%", padding: "11px 14px 11px 40px", borderRadius: 12, border: "1px solid var(--border)", background: "#fff", fontSize: 13, color: "var(--text)", outline: "none", boxSizing: "border-box" as const }}
              />
            </div>

            {offresLoading ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[1, 2, 3].map((i) => (
                  <div key={i} style={{ background: "#fff", borderRadius: 14, border: "1px solid var(--border)", padding: 20, opacity: 0.5 }}>
                    <div style={{ height: 14, background: "#f0ebe8", borderRadius: 8, width: "35%", marginBottom: 10 }} />
                    <div style={{ height: 18, background: "#f0ebe8", borderRadius: 8, width: "60%", marginBottom: 8 }} />
                    <div style={{ height: 12, background: "#f0ebe8", borderRadius: 8, width: "45%" }} />
                  </div>
                ))}
              </div>
            ) : filteredOffres.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 20px", background: "#fff", borderRadius: 20, border: "1px solid var(--border)" }}>
                <div style={{ fontSize: 44, marginBottom: 12 }}>📭</div>
                <p style={{ fontFamily: "Syne", fontWeight: 700, fontSize: 16, color: "var(--text)", marginBottom: 8 }}>
                  {offresSearch ? "Aucune offre pour cette recherche" : "Aucune demande en cours"}
                </p>
                <p style={{ fontSize: 13, color: "var(--muted)" }}>
                  {offresSearch ? "Essayez un autre mot-clé." : "De nouvelles demandes arrivent chaque jour. Revenez bientôt !"}
                </p>
                {offresSearch && (
                  <button onClick={() => setOffresSearch("")} style={{ marginTop: 14, padding: "8px 20px", borderRadius: 99, border: "1px solid var(--border)", background: "#fff", color: "var(--muted)", fontSize: 13, cursor: "pointer" }}>
                    Réinitialiser
                  </button>
                )}
              </div>
            ) : (
              <>
                <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 16 }}>
                  {filteredOffres.length} demande{filteredOffres.length > 1 ? "s" : ""} disponible{filteredOffres.length > 1 ? "s" : ""}
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {filteredOffres.map((req) => (
                    <div key={req.id}
                      className="product-card"
                      style={{ background: "#fff", borderRadius: 14, border: "1px solid var(--border)", padding: "16px 20px", display: "flex", alignItems: "flex-start", gap: 14, flexWrap: "wrap" }}>

                      {/* Icône */}
                      <div style={{ width: 46, height: 46, borderRadius: 12, background: "#f0fdf4", border: "1px solid #a7f3d0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
                        {getServiceIcon(req.service, req.serviceIcon)}
                      </div>

                      {/* Contenu */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 14, color: "var(--text)", marginBottom: 6 }}>
                          {req.service}
                        </p>
                        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", fontSize: 12, color: "var(--muted)", marginBottom: req.description ? 8 : 0 }}>
                          <span>📍 {req.quarter}, {req.city}</span>
                          <span>🕐 {timeAgo(req.createdAt)}</span>
                          {/* Coordonnées intentionnellement masquées */}
                          <span style={{ color: "#d1d5db", fontStyle: "italic" }}>🔒 Contact confidentiel</span>
                        </div>
                        {req.description && (
                          <p style={{ fontSize: 12, color: "#888", lineHeight: 1.6, marginTop: 6, padding: "8px 10px", background: "var(--surface)", borderRadius: 8 }}>
                            {req.description}
                          </p>
                        )}
                      </div>

                      {/* CTA */}
                      <div style={{ flexShrink: 0, alignSelf: "center" }}>
                        <Link href="/partners"
                          style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 10, background: "#1A9E5F", color: "#fff", textDecoration: "none", fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 12, whiteSpace: "nowrap" as const }}>
                          Postuler →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer incitation */}
                <div style={{ marginTop: 28, background: "linear-gradient(135deg, #0d3320, #1A9E5F)", borderRadius: 18, padding: "24px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                  <div>
                    <p style={{ fontFamily: "Syne", fontWeight: 800, fontSize: 16, color: "#fff", marginBottom: 6 }}>
                      Ces missions vous correspondent ?
                    </p>
                    <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 13, lineHeight: 1.6 }}>
                      Inscrivez-vous gratuitement et commencez à recevoir des missions.
                    </p>
                  </div>
                  <Link href="/partners"
                    style={{ padding: "11px 22px", borderRadius: 10, background: "#fff", color: "#0d3320", fontFamily: "Syne", fontWeight: 700, fontSize: 13, textDecoration: "none", whiteSpace: "nowrap" as const, flexShrink: 0 }}>
                    S'inscrire comme prestataire →
                  </Link>
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* DRAWER */}
      <div onClick={closeDrawer} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 40, opacity: drawerOpen ? 1 : 0, pointerEvents: drawerOpen ? "auto" : "none", transition: "opacity 0.3s", backdropFilter: "blur(2px)" }} />
      <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: "min(480px,100vw)", background: "#fff", zIndex: 50, transform: drawerOpen ? "translateX(0)" : "translateX(100%)", transition: "transform 0.35s cubic-bezier(0.4,0,0.2,1)", display: "flex", flexDirection: "column", boxShadow: "-8px 0 40px rgba(0,0,0,0.15)" }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 14, flexShrink: 0 }}>
          <button onClick={closeDrawer} style={{ width: 36, height: 36, borderRadius: 99, background: "var(--surface)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 16, color: "var(--muted)", flexShrink: 0 }}>←</button>
          {service && (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: service.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{service.icon}</div>
              <div>
                <p style={{ fontFamily: "Syne", fontWeight: 700, fontSize: 15, color: "var(--text)" }}>{service.name}</p>
                <p style={{ fontSize: 11, color: "var(--muted)" }}>Remplissez le formulaire ci-dessous</p>
              </div>
            </div>
          )}
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
          {step === "success" ? (
            <div style={{ textAlign: "center", padding: "40px 20px" }}>
              <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
              <h2 style={{ fontFamily: "Syne", fontWeight: 800, fontSize: 22, marginBottom: 10 }}>Demande envoyée !</h2>
              <p style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.7, marginBottom: 28 }}>
                Votre demande de <strong>{service?.name}</strong> à <strong>{location.quarter}, {location.city}</strong> a bien été reçue. Un professionnel vous contactera rapidement.
              </p>
              <button onClick={resetForm} style={{ padding: "12px 32px", borderRadius: 99, border: "none", background: "var(--green)", color: "#fff", fontFamily: "Syne", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
                Faire une autre demande
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div>
                <p style={sTitle}>📍 Votre localisation *</p>
                <LocationPicker value={location} onChange={setLocation} showFee={false} />
              </div>
              <div>
                <p style={sTitle}>👤 Vos coordonnées</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Votre prénom" style={inp} />
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Téléphone / WhatsApp" type="tel" style={inp} />
                </div>
              </div>
              <div>
                <p style={sTitle}>📝 Décrivez votre besoin</p>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Précisez le problème, l'urgence, l'accès…" style={{ ...inp, height: 100, resize: "vertical", width: "100%", boxSizing: "border-box" as const }} />
              </div>
              {step === "error" && <div style={{ background: "#fee2e2", borderRadius: 10, padding: "12px 14px", fontSize: 13, color: "#991b1b" }}>❌ Une erreur est survenue. Veuillez réessayer.</div>}
            </div>
          )}
        </div>
        {step !== "success" && (
          <div style={{ padding: "16px 24px", borderTop: "1px solid var(--border)", flexShrink: 0, background: "#fff" }}>
            {!location.quarter && <p style={{ fontSize: 12, color: "var(--muted)", textAlign: "center", marginBottom: 10 }}>📍 Sélectionnez votre zone pour continuer</p>}
            <button onClick={handleSend} disabled={!location.quarter || step === "loading"} style={{ width: "100%", padding: "15px", borderRadius: 12, border: "none", background: location.quarter ? "var(--green)" : "#ccc", color: "#fff", fontFamily: "Syne", fontWeight: 700, fontSize: 15, cursor: location.quarter ? "pointer" : "not-allowed" }}>
              {step === "loading" ? "Envoi en cours…" : "Envoyer la demande ✓"}
            </button>
          </div>
        )}
      </div>

      {/* MODALE DÉTAIL PRESTATAIRE */}
      <ProviderModal provider={selectedProvider} open={providerModalOpen} onClose={closeProviderModal} />
    </div>
  );
}

function ProviderModal({ provider, open, onClose }: { provider: (Provider & { bio?: string; experience?: string; disponibilite?: string }) | null; open: boolean; onClose: () => void }) {
  if (!provider) return null;
  const initials = provider.name.split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase();
  const hue = [...provider.name].reduce((acc: number, c: string) => acc + c.charCodeAt(0), 0) % 360;
  const hue2 = (hue + 70) % 360;

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 60, opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none", transition: "opacity 0.3s", backdropFilter: "blur(2px)" }} />
      <div style={{ position: "fixed", top: "50%", left: "50%", width: "min(520px, 92vw)", maxHeight: "88vh", background: "#fff", borderRadius: 22, zIndex: 70, overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 20px 60px rgba(0,0,0,0.25)", transform: open ? "translate(-50%,-50%) scale(1)" : "translate(-50%,-50%) scale(0.94)", opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none", transition: "transform 0.28s cubic-bezier(0.4,0,0.2,1), opacity 0.25s" }}>

        {/* En-tête avec photo de profil */}
        <div style={{ position: "relative", height: 190, flexShrink: 0, overflow: "hidden" }}>
          {provider.profileImageUrl ? (
            <img src={provider.profileImageUrl} alt={provider.name} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top", display: "block" }} />
          ) : (
            <div style={{ width: "100%", height: "100%", background: `linear-gradient(145deg, hsl(${hue},55%,28%), hsl(${hue2},65%,42%))`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 56, color: "rgba(255,255,255,0.85)" }}>{initials}</span>
            </div>
          )}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 45%, rgba(0,0,0,0.68) 100%)", pointerEvents: "none" }} />
          <button onClick={onClose} style={{ position: "absolute", top: 12, right: 12, width: 34, height: 34, borderRadius: 99, background: "rgba(255,255,255,0.92)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 16, color: "var(--text)" }}>✕</button>
          <span style={{ position: "absolute", top: 12, left: 12, fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 99, background: "rgba(255,255,255,0.92)", color: "#059669" }}>✓ Vérifié</span>
          <div style={{ position: "absolute", bottom: 14, left: 20, right: 20 }}>
            <p style={{ fontFamily: "Syne", fontWeight: 800, fontSize: 19, color: "#fff", marginBottom: 3, textShadow: "0 1px 4px rgba(0,0,0,0.4)" }}>{provider.name}</p>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.88)", fontWeight: 500 }}>📍 {provider.zone ? `${provider.zone}, ` : ""}{provider.city}</p>
          </div>
        </div>

        {/* Contenu scrollable */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 22px", display: "flex", flexDirection: "column", gap: 18 }}>

          {/* Catégories */}
          {provider.serviceCategories && provider.serviceCategories.length > 0 && (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {provider.serviceCategories.map((c: string) => (
                <span key={c} style={{ fontSize: 11, fontWeight: 600, padding: "4px 11px", borderRadius: 99, background: "#fff5f3", color: "#E8380D", border: "1px solid #fdd0c5" }}>{c}</span>
              ))}
            </div>
          )}

          {/* Badges expérience / disponibilité */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {provider.experience && (
              <span style={{ fontSize: 12, fontWeight: 700, padding: "5px 12px", borderRadius: 99, background: "#ede9fe", color: "#6d28d9", display: "inline-flex", alignItems: "center", gap: 4 }}>
                🎓 {provider.experience} d&apos;expérience
              </span>
            )}
            {provider.disponibilite && provider.disponibilite.split(",").map((d: string) => d.trim()).filter(Boolean).map((d: string) => (
              <span key={d} style={{ fontSize: 12, fontWeight: 600, padding: "5px 12px", borderRadius: 99, background: "#fef3c7", color: "#b45309" }}>🕐 {d}</span>
            ))}
          </div>

          {/* À propos */}
          {provider.bio && (
            <div>
              <p style={sTitle}>À propos</p>
              <p style={{ fontSize: 13, color: "#555", lineHeight: 1.7 }}>{provider.bio}</p>
            </div>
          )}

          {/* Photos terrain */}
          <div>
            <p style={sTitle}>📸 Photos</p>
            {(provider.profileImageUrl || provider.workImageUrl) ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 8 }}>
                {provider.profileImageUrl && (
                  <img src={provider.profileImageUrl} alt="Profil" style={{ width: "100%", height: 110, objectFit: "cover", borderRadius: 12, border: "1px solid var(--border)" }} />
                )}
                {provider.workImageUrl && (
                  <img src={provider.workImageUrl} alt="Photo terrain" style={{ width: "100%", height: 110, objectFit: "cover", borderRadius: 12, border: "1px solid var(--border)" }} />
                )}
              </div>
            ) : (
              <p style={{ fontSize: 12, color: "var(--muted)", fontStyle: "italic" }}>Aucune photo terrain pour le moment.</p>
            )}
          </div>

          {/* Avis clients — emplacement prévu pour le futur système de notation */}
          <div style={{ background: "var(--surface)", borderRadius: 14, padding: "14px 16px" }}>
            <p style={sTitle}>⭐ Avis clients</p>
            {provider.rating ? (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <StarStatic n={Math.round(provider.rating)} />
                <span style={{ fontSize: 12, color: "var(--muted)" }}>{provider.rating.toFixed(1)} · {provider.reviewsCount ?? 0} avis</span>
              </div>
            ) : (
              <p style={{ fontSize: 12, color: "var(--muted)" }}>Système de notation bientôt disponible.</p>
            )}
          </div>

          {/* Contact — désactivé pour l'instant (voir décision produit) */}
          {/* <a href={`https://wa.me/${provider.contact?.replace(/[\s+]/g, "")}`} target="_blank" rel="noreferrer"
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "12px 16px", borderRadius: 11, background: "#25D366", color: "#fff", fontFamily: "Syne", fontWeight: 700, fontSize: 13, textDecoration: "none" }}>
            Contacter sur WhatsApp
          </a> */}
        </div>
      </div>
    </>
  );
}

function ProviderCard({ provider, bio, experience, disponibilite, onClick }: { provider: Provider; bio?: string; experience?: string; disponibilite?: string; onClick?: () => void }) {
  const initials = provider.name.split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase();
  const hue = [...provider.name].reduce((acc: number, c: string) => acc + c.charCodeAt(0), 0) % 360;
  const hue2 = (hue + 70) % 360;

  return (
    <div onClick={onClick} className="product-card" style={{ background: "#fff", borderRadius: 20, border: "1px solid var(--border)", overflow: "hidden", display: "flex", flexDirection: "column", cursor: onClick ? "pointer" : "default" }}>
      <div style={{ position: "relative", height: 200, flexShrink: 0, overflow: "hidden" }}>
        {provider.profileImageUrl ? (
          <img src={provider.profileImageUrl} alt={provider.name} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top", display: "block" }} />
        ) : (
          <div style={{ width: "100%", height: "100%", background: `linear-gradient(145deg, hsl(${hue},55%,28%), hsl(${hue2},65%,42%))`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 52, color: "rgba(255,255,255,0.85)" }}>{initials}</span>
          </div>
        )}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 45%, rgba(0,0,0,0.68) 100%)", pointerEvents: "none" }} />
        <span style={{ position: "absolute", top: 10, right: 10, fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 99, background: "rgba(255,255,255,0.92)", color: "#059669" }}>✓ Vérifié</span>
        <div style={{ position: "absolute", bottom: 12, left: 14, right: 14 }}>
          <p style={{ fontFamily: "Syne", fontWeight: 800, fontSize: 15, color: "#fff", marginBottom: 3, textShadow: "0 1px 4px rgba(0,0,0,0.4)" }}>{provider.name}</p>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.88)", fontWeight: 500 }}>📍 {provider.zone ? `${provider.zone}, ` : ""}{provider.city}</p>
        </div>
      </div>
      <div style={{ padding: "12px 16px 16px", flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
        {provider.serviceCategories && provider.serviceCategories.length > 0 && (
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
            {provider.serviceCategories.slice(0, 3).map((c: string) => (
              <span key={c} style={{ fontSize: 10, fontWeight: 600, padding: "3px 9px", borderRadius: 99, background: "#fff5f3", color: "#E8380D", border: "1px solid #fdd0c5" }}>{c}</span>
            ))}
            {provider.serviceCategories.length > 3 && <span style={{ fontSize: 10, color: "var(--muted)", padding: "3px 0" }}>+{provider.serviceCategories.length - 3}</span>}
          </div>
        )}
        {experience && (
          <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 99, background: "#ede9fe", color: "#6d28d9", display: "inline-flex", alignItems: "center", gap: 4, width: "fit-content" }}>
            🎓 {experience} d&apos;expérience
          </span>
        )}
        {disponibilite && (
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
            {disponibilite.split(",").map((d: string) => d.trim()).filter(Boolean).map((d: string) => (
              <span key={d} style={{ fontSize: 10, fontWeight: 600, padding: "3px 9px", borderRadius: 99, background: "#fef3c7", color: "#b45309" }}>🕐 {d}</span>
            ))}
          </div>
        )}
        {bio && <p style={{ fontSize: 12, color: "#555", lineHeight: 1.6, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{bio}</p>}
        {/* <a href={`https://wa.me/${provider.contact?.replace(/[\s+]/g, "")}`} target="_blank" rel="noreferrer"
          style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "10px 16px", borderRadius: 11, background: "#25D366", color: "#fff", fontFamily: "Syne", fontWeight: 700, fontSize: 12, textDecoration: "none", marginTop: "auto" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
          Contacter sur WhatsApp
        </a> */}
      </div>
    </div>
  );
}

function pillStyle(active: boolean): React.CSSProperties {
  return { padding: "6px 14px", borderRadius: 99, fontSize: 12, cursor: "pointer", border: `2px solid ${active ? "var(--green)" : "var(--border)"}`, background: active ? "var(--green-light)" : "#fff", color: active ? "var(--green)" : "var(--muted)", fontWeight: active ? 700 : 400 };
}
const sTitle: React.CSSProperties = { fontFamily: "Syne, sans-serif", fontWeight: 600, fontSize: 13, color: "var(--muted)", marginBottom: 10 };
const inp: React.CSSProperties = { width: "100%", padding: "12px 14px", borderRadius: 10, border: "1px solid var(--border)", fontSize: 14, outline: "none", fontFamily: "DM Sans, sans-serif", background: "var(--surface)", boxSizing: "border-box" as const };