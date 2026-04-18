"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";

const BASE = process.env.NEXT_PUBLIC_URL_PROD || "http://localhost:3003";

interface Partner {
  id: string;
  name: string;
  slug: string;
  type: string;
  city: string;
  zone?: string;
  profileImageUrl?: string;
  bannerUrl?: string;
  categories?: { name: string }[];
  followers?: number;
  avgRating?: number | null;
  reviewCount?: number;
  badge?: string | null;
  promo?: { title: string; discount?: number; endsAt: string } | null;
}

const TYPE_META: Record<string, { emoji: string; label: string; color: string; bg: string }> = {
  Marchand: { emoji: "🛒", label: "Marchand", color: "#0369a1", bg: "#e0f2fe" },
  Restaurant: { emoji: "🍽️", label: "Restaurant", color: "#b45309", bg: "#fef3c7" },
};

const BADGE_META: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  top: { label: "Top vendeur", color: "#92400e", bg: "#fef3c7", icon: "🏆" },
  popular: { label: "Populaire", color: "#6d28d9", bg: "#ede9fe", icon: "🔥" },
  trusted: { label: "De confiance", color: "#065f46", bg: "#d1fae5", icon: "✅" },
};

function getAvatarUrl(name: string, type: string, profileImageUrl?: string) {
  if (profileImageUrl) return profileImageUrl;
  const seed = encodeURIComponent(name);
  const style = type === "Restaurant" ? "rings" : "shapes";
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}&backgroundColor=ffffff&size=80`;
}

function getCoverPattern(name: string) {
  const hue = [...name].reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;
  const hue2 = (hue + 60) % 360;
  return `url("data:image/svg+xml,%3Csvg width='400' height='160' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='400' height='160' fill='hsl(${hue},60%25,25%25)'/%3E%3Ccircle cx='350' cy='-20' r='120' fill='hsl(${hue2},70%25,40%25)' opacity='0.6'/%3E%3Ccircle cx='50' cy='180' r='100' fill='hsl(${hue},50%25,15%25)' opacity='0.5'/%3E%3C/svg%3E")`;
}

function StarRating({ rating, size = 12 }: { rating: number; size?: number }) {
  return (
    <span style={{ display: "inline-flex", gap: 1 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} style={{ fontSize: size, color: i <= Math.round(rating) ? "#f59e0b" : "#e5e7eb" }}>★</span>
      ))}
    </span>
  );
}

// ── Follow Button ──────────────────────────────────────────
function FollowButton({ slug, compact = false }: { slug: string; compact?: boolean }) {
  const [following, setFollowing] = useState(false);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState("");
  const [showInput, setShowInput] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(`follow_${slug}`);
    if (saved) {
      const { phone: p } = JSON.parse(saved);
      setPhone(p);
      fetch(`${BASE}/social/follow/${slug}?phone=${p}`)
        .then((r) => r.json())
        .then((d) => { setFollowing(d.following); setCount(d.followers); })
        .catch(() => { });
    } else {
      fetch(`${BASE}/social/follow/${slug}?phone=_none_`)
        .then((r) => r.json())
        .then((d) => setCount(d.followers))
        .catch(() => { });
    }
  }, [slug]);

  const toggle = async (p?: string) => {
    const ph = p || phone;
    if (!ph) { setShowInput(true); return; }
    setLoading(true);
    try {
      if (following) {
        const r = await fetch(`${BASE}/social/follow/${slug}`, {
          method: "DELETE", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: ph }),
        });
        const d = await r.json();
        setFollowing(false); setCount(d.followers);
        localStorage.removeItem(`follow_${slug}`);
      } else {
        const r = await fetch(`${BASE}/social/follow/${slug}`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: ph }),
        });
        const d = await r.json();
        setFollowing(true); setCount(d.followers);
        localStorage.setItem(`follow_${slug}`, JSON.stringify({ phone: ph }));
        setPhone(ph);
      }
    } finally { setLoading(false); setShowInput(false); }
  };

  if (showInput) return (
    <div style={{ display: "flex", gap: 6, alignItems: "center" }} onClick={(e) => e.preventDefault()}>
      <input
        autoFocus type="tel" placeholder="221 77…"
        style={{ padding: "5px 10px", borderRadius: 8, border: "1px solid #f0ebe8", fontSize: 12, width: 130, outline: "none" }}
        onKeyDown={(e) => { if (e.key === "Enter") toggle((e.target as HTMLInputElement).value); }}
      />
      <button onClick={(e) => { e.preventDefault(); setShowInput(false); }}
        style={{ padding: "5px 8px", borderRadius: 8, border: "1px solid #f0ebe8", background: "#fff", cursor: "pointer", fontSize: 11 }}>
        ✕
      </button>
    </div>
  );

  return (
    <button
      onClick={(e) => { e.preventDefault(); toggle(); }}
      disabled={loading}
      style={{
        display: "inline-flex", alignItems: "center", gap: 5,
        padding: compact ? "4px 10px" : "6px 14px",
        borderRadius: 99, border: `1.5px solid ${following ? "#ef4444" : "#E8380D"}`,
        background: following ? "#fee2e2" : "#fff5f3",
        color: following ? "#ef4444" : "#E8380D",
        fontSize: compact ? 11 : 12, fontWeight: 700, cursor: "pointer",
        transition: "all 0.18s",
      }}
    >
      {following ? "♥" : "♡"} {following ? "Suivi" : "Suivre"}
      {count > 0 && <span style={{ opacity: 0.7, fontWeight: 400 }}>· {count}</span>}
    </button>
  );
}

// ── Partner Card ───────────────────────────────────────────
function PartnerCard({ p, index }: { p: Partner; index: number }) {
  const meta = TYPE_META[p.type] || TYPE_META.Marchand;
  const avatarUrl = getAvatarUrl(p.name, p.type, p.profileImageUrl);
  const coverPattern = getCoverPattern(p.name);
  const badgeMeta = p.badge ? BADGE_META[p.badge] : null;
  const initials = p.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const promoActive = p.promo && new Date(p.promo.endsAt) > new Date();
  // Bannière réelle si disponible, sinon pattern généré
  const coverStyle = p.bannerUrl
    ? { backgroundImage: `url(${p.bannerUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
    : { backgroundImage: coverPattern, backgroundSize: "cover" };

  return (
    <Link href={`/order?partner=${p.slug}`} style={{ textDecoration: "none" }}>
      <div className="product-card fade-up" style={{
        background: "#fff", borderRadius: 18, border: "1px solid var(--border)",
        overflow: "hidden", cursor: "pointer", animationDelay: `${index * 0.05}s`,
        height: "100%", display: "flex", flexDirection: "column",
        position: "relative",
      }}>
        {/* Promo banner */}
        {promoActive && (
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, zIndex: 3,
            background: "linear-gradient(90deg, #E8380D, #ff6b35)",
            padding: "5px 12px", fontSize: 11, fontWeight: 700, color: "#fff",
            display: "flex", alignItems: "center", gap: 6,
          }}>
            🔥 {p.promo!.title}
            {p.promo!.discount && <span style={{ background: "rgba(255,255,255,0.25)", borderRadius: 99, padding: "1px 7px" }}>-{p.promo!.discount}%</span>}
          </div>
        )}

        {/* Cover — bannière réelle (background du nom) ou pattern généré */}
        <div style={{
          height: promoActive ? 96 : 120,
          ...coverStyle,
          position: "relative",
          paddingTop: promoActive ? 28 : 0,
        }}>
          {/* Dégradé bas si bannière réelle — pour lisibilité du nom */}
          {p.bannerUrl && (
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.55) 100%)", borderRadius: "inherit", pointerEvents: "none" }} />
          )}
          {/* Badge */}
          {badgeMeta && (
            <div style={{
              position: "absolute", top: promoActive ? 32 : 8, right: 8,
              background: badgeMeta.bg, color: badgeMeta.color,
              fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 99,
              border: `1px solid ${badgeMeta.color}33`,
            }}>
              {badgeMeta.icon} {badgeMeta.label}
            </div>
          )}
          {/* Avatar */}
          <div style={{
            position: "absolute", bottom: -24, left: 16,
            width: 48, height: 48, borderRadius: 12,
            border: "3px solid #fff", overflow: "hidden",
            background: "#fff", boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
          }}>
            <img src={avatarUrl} alt={p.name}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
                (e.target as HTMLImageElement).parentElement!.innerHTML = `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#E8380D,#ff6b35);color:#fff;font-weight:800;font-size:14px">${initials}</div>`;
              }}
            />
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: "30px 14px 14px", flex: 1, display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 6 }}>
            <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 15, color: "var(--text)", lineHeight: 1.2 }}>
              {p.name}
            </h3>
            <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 99, background: meta.bg, color: meta.color, flexShrink: 0 }}>
              {meta.emoji} {meta.label}
            </span>
          </div>

          {/* Rating */}
          {p.avgRating && p.reviewCount && p.reviewCount > 0 ? (
            <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 6 }}>
              <StarRating rating={p.avgRating} />
              <span style={{ fontSize: 12, fontWeight: 700, color: "#1a1a1a" }}>{p.avgRating}</span>
              <span style={{ fontSize: 11, color: "var(--muted)" }}>({p.reviewCount} avis)</span>
            </div>
          ) : (
            <p style={{ fontSize: 11, color: "var(--muted)", marginBottom: 6 }}>Pas encore d'avis</p>
          )}

          <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 10 }}>
            📍 {p.zone ? `${p.zone}, ` : ""}{p.city}
          </p>

          {p.categories && p.categories.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 12 }}>
              {p.categories.slice(0, 2).map((c) => (
                <span key={c.name} style={{ fontSize: 10, padding: "2px 7px", borderRadius: 99, background: "var(--surface)", color: "var(--muted)" }}>
                  {c.name}
                </span>
              ))}
            </div>
          )}

          {/* CTA + Follow */}
          <div style={{ marginTop: "auto", display: "flex", gap: 8, alignItems: "center" }}>
            <div style={{
              flex: 1, padding: "8px 12px", borderRadius: 10, textAlign: "center",
              background: "var(--brand)", color: "#fff",
              fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 13,
            }}>
              Commander →
            </div>
            <FollowButton slug={p.slug} compact />
          </div>
        </div>
      </div>
    </Link>
  );
}

// ── Main PartnersShop ──────────────────────────────────────
export default function PartnersShop({ partners }: { partners: Partner[] }) {
  const [search, setSearch] = useState("");
  const [typeFilter, setType] = useState<"all" | "Marchand" | "Restaurant">("all");
  const [cityFilter, setCity] = useState("all");
  const [sortBy, setSort] = useState<"name" | "rating" | "followers">("rating");

  const cities = useMemo(() => {
    const c = [...new Set(partners.map((p) => p.city))].sort();
    return c;
  }, [partners]);

  // Promos actives
  const activePromos = partners.filter((p) => p.promo && new Date(p.promo.endsAt) > new Date());

  const filtered = useMemo(() => {
    let list = partners;
    if (typeFilter !== "all") list = list.filter((p) => p.type === typeFilter);
    if (cityFilter !== "all") list = list.filter((p) => p.city === cityFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((p) =>
        p.name.toLowerCase().includes(q) ||
        p.zone?.toLowerCase().includes(q) ||
        p.categories?.some((c) => c.name.toLowerCase().includes(q))
      );
    }
    return [...list].sort((a, b) => {
      if (sortBy === "rating") return (b.avgRating || 0) - (a.avgRating || 0);
      if (sortBy === "followers") return (b.followers || 0) - (a.followers || 0);
      return a.name.localeCompare(b.name);
    });
  }, [partners, typeFilter, cityFilter, search, sortBy]);

  return (
    <div style={{ background: "var(--surface)", minHeight: "100vh" }}>

      {/* Hero */}
      <div style={{
        background: "linear-gradient(135deg, #1a0500 0%, #3a0c00 50%, #E8380D 100%)",
        padding: "44px 20px 56px", position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: -60, right: -60, width: 280, height: 280, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
        <div style={{ maxWidth: 800, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <h1 style={{ fontFamily: "Syne", fontWeight: 800, fontSize: "clamp(26px,4vw,40px)", color: "#fff", marginBottom: 8 }}>
            Boutiques & Restaurants
          </h1>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 15, marginBottom: 24 }}>
            {partners.length} partenaires disponibles à Dakar & Saint-Louis
          </p>
          {/* Search */}
          <div style={{ position: "relative", maxWidth: 480 }}>
            <svg style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.5)" }}
              width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher une boutique, quartier…"
              style={{ width: "100%", padding: "12px 16px 12px 42px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.12)", color: "#fff", fontSize: 14, outline: "none" }}
            />
          </div>
        </div>
      </div>

      {/* Promos flash banner */}
      {activePromos.length > 0 && (
        <div style={{ background: "linear-gradient(90deg, #1a0500, #3a0c00)", padding: "12px 20px", overflowX: "auto" }}>
          <div style={{ maxWidth: 800, margin: "0 auto", display: "flex", gap: 10, alignItems: "center" }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#fcd34d", flexShrink: 0 }}>🔥 PROMOS DU JOUR</span>
            {activePromos.map((p) => (
              <Link key={p.id} href={`/order?partner=${p.slug}`} style={{
                flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 6,
                background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: 99, padding: "4px 12px", textDecoration: "none",
              }}>
                <span style={{ fontSize: 11, color: "#fff", fontWeight: 600 }}>{p.name}</span>
                <span style={{ fontSize: 10, color: "#fcd34d" }}>{p.promo!.title}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div style={{ background: "#fff", borderBottom: "1px solid var(--border)", padding: "12px 20px", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: 800, margin: "0 auto", display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          {/* Type */}
          {(["all", "Marchand", "Restaurant"] as const).map((t) => (
            <button key={t} onClick={() => setType(t)} style={{
              padding: "6px 14px", borderRadius: 99, fontSize: 12, cursor: "pointer",
              border: `1px solid ${typeFilter === t ? "var(--brand)" : "var(--border)"}`,
              background: typeFilter === t ? "var(--brand-light)" : "#fff",
              color: typeFilter === t ? "var(--brand)" : "var(--muted)",
              fontWeight: typeFilter === t ? 700 : 400,
            }}>
              {t === "all" ? "Tous" : t === "Marchand" ? "🛒 Marchands" : "🍽️ Restaurants"}
            </button>
          ))}

          {/* City */}
          {cities.length > 1 && (
            <select value={cityFilter} onChange={(e) => setCity(e.target.value)}
              style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid var(--border)", fontSize: 12, outline: "none", background: "#fff" }}>
              <option value="all">📍 Toutes les villes</option>
              {cities.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          )}

          {/* Sort */}
          <select value={sortBy} onChange={(e) => setSort(e.target.value as any)}
            style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid var(--border)", fontSize: 12, outline: "none", background: "#fff", marginLeft: "auto" }}>
            <option value="rating">⭐ Mieux notés</option>
            <option value="followers">🔥 Plus suivis</option>
            <option value="name">A-Z</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "24px 16px 64px" }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--muted)" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
            <p style={{ fontFamily: "Syne", fontWeight: 600, fontSize: 18 }}>Aucune boutique trouvée</p>
          </div>
        ) : (
          <>
            <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 16 }}>
              {filtered.length} boutique{filtered.length > 1 ? "s" : ""}
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px,1fr))", gap: 16 }}>
              {filtered.map((p, i) => <PartnerCard key={p.id} p={p} index={i} />)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
