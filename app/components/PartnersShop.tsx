"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

interface Partner {
  id: string;
  name: string;
  slug: string;
  type: string;
  city: string;
  zone?: string;
  categories?: { name: string }[];
}

const TYPE_META: Record<string, { emoji: string; label: string; color: string; bg: string; cover: string; avatar: string }> = {
  Marchand: {
    emoji: "🛒", label: "Marchand",
    color: "#0369a1", bg: "#e0f2fe",
    cover: "linear-gradient(135deg, #0c4a6e 0%, #0369a1 50%, #38bdf8 100%)",
    avatar: "linear-gradient(135deg, #0ea5e9, #0369a1)",
  },
  Restaurant: {
    emoji: "🍽️", label: "Restaurant",
    color: "#b45309", bg: "#fef3c7",
    cover: "linear-gradient(135deg, #78350f 0%, #b45309 50%, #f59e0b 100%)",
    avatar: "linear-gradient(135deg, #f59e0b, #b45309)",
  },
};

function getAvatarUrl(name: string, type: string) {
  const seed = encodeURIComponent(name);
  const style = type === "Restaurant" ? "rings" : "shapes";
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}&backgroundColor=ffffff&size=80`;
}

function getCoverPattern(name: string, type: string) {
  // Génère un pattern SVG unique basé sur le nom
  const hue = [...name].reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;
  const hue2 = (hue + 60) % 360;
  return `url("data:image/svg+xml,%3Csvg width='400' height='160' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='400' height='160' fill='hsl(${hue},60%25,25%25)'/%3E%3Ccircle cx='350' cy='-20' r='120' fill='hsl(${hue2},70%25,40%25)' opacity='0.6'/%3E%3Ccircle cx='50' cy='180' r='100' fill='hsl(${hue},50%25,15%25)' opacity='0.5'/%3E%3Ccircle cx='200' cy='80' r='60' fill='hsl(${hue2},60%25,50%25)' opacity='0.15'/%3E%3C/svg%3E")`;
}

function PartnerCard({ p, index }: { p: Partner; index: number }) {
  const meta = TYPE_META[p.type] || TYPE_META.Marchand;
  const avatarUrl = getAvatarUrl(p.name, p.type);
  const coverPattern = getCoverPattern(p.name, p.type);
  const initials = p.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <Link href={`/order?partner=${p.slug}`} style={{ textDecoration: "none" }}>
      <div
        className="product-card fade-up"
        style={{
          background: "#fff",
          borderRadius: 18,
          border: "1px solid var(--border)",
          overflow: "hidden",
          cursor: "pointer",
          animationDelay: `${index * 0.05}s`,
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Cover image */}
        <div style={{
          height: 120,
          backgroundImage: coverPattern,
          backgroundSize: "cover",
          position: "relative",
          flexShrink: 0,
        }}>
          {/* Badge type */}
          <span style={{
            position: "absolute", top: 10, left: 10,
            fontSize: 10, fontWeight: 700, letterSpacing: "0.06em",
            textTransform: "uppercase",
            padding: "4px 10px", borderRadius: 99,
            background: "rgba(0,0,0,0.45)",
            color: "#fff",
            backdropFilter: "blur(6px)",
          }}>
            {meta.emoji} {meta.label}
          </span>

          {/* Avatar rond en overlay */}
          <div style={{
            position: "absolute",
            bottom: -22,
            left: 16,
            width: 52,
            height: 52,
            borderRadius: "50%",
            border: "3px solid #fff",
            background: meta.avatar,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          }}>
            <img
              src={avatarUrl}
              alt={p.name}
              width={46}
              height={46}
              style={{ borderRadius: "50%" }}
              onError={(e) => {
                const el = e.currentTarget as HTMLImageElement;
                el.style.display = "none";
                (el.parentElement as HTMLElement).innerHTML = `<span style="font-family:Syne,sans-serif;font-weight:800;font-size:16px;color:#fff">${initials}</span>`;
              }}
            />
          </div>
        </div>

        {/* Contenu */}
        <div style={{ padding: "30px 14px 16px 14px", flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
          <p style={{
            fontFamily: "Syne, sans-serif", fontWeight: 800,
            fontSize: 15, color: "var(--text)",
            lineHeight: 1.2,
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {p.name}
          </p>

          <p style={{ fontSize: 12, color: "var(--muted)", display: "flex", alignItems: "center", gap: 3 }}>
            <span>📍</span>
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {p.zone ? `${p.zone}` : p.city}
              {p.zone && <span style={{ color: "#bbb" }}> · {p.city}</span>}
            </span>
          </p>

          {p.categories && p.categories.length > 0 && (
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginTop: 4 }}>
              {p.categories.slice(0, 2).map((c) => (
                <span key={c.name} style={{
                  fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 99,
                  background: "var(--brand-light)", color: "var(--brand)",
                }}>
                  {c.name}
                </span>
              ))}
              {p.categories.length > 2 && (
                <span style={{ fontSize: 10, color: "var(--muted)", padding: "2px 0" }}>
                  +{p.categories.length - 2}
                </span>
              )}
            </div>
          )}

          {/* CTA */}
          <div style={{ marginTop: "auto", paddingTop: 12 }}>
            <div style={{
              width: "100%", padding: "9px", borderRadius: 10,
              background: "var(--brand)", color: "#fff",
              textAlign: "center", fontSize: 13, fontWeight: 700,
              fontFamily: "Syne, sans-serif",
            }}>
              Voir la boutique →
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function PartnersShop({ partners }: { partners: Partner[] }) {
  const [search, setSearch] = useState("");
  const [zone, setZone] = useState("");
  const [type, setType] = useState("");

  const allZones = useMemo(() => {
    const z = new Set<string>();
    partners.forEach((p) => { if (p.zone) z.add(p.zone); if (p.city) z.add(p.city); });
    return Array.from(z).sort();
  }, [partners]);

  const filtered = useMemo(() => {
    return partners.filter((p) => {
      const q = search.toLowerCase();
      const matchSearch = !q ||
        p.name.toLowerCase().includes(q) ||
        p.city.toLowerCase().includes(q) ||
        p.zone?.toLowerCase().includes(q) ||
        p.categories?.some((c) => c.name.toLowerCase().includes(q));
      const matchZone = !zone || p.zone === zone || p.city === zone;
      const matchType = !type || p.type === type;
      return matchSearch && matchZone && matchType;
    });
  }, [partners, search, zone, type]);

  return (
    <div style={{ minHeight: "100vh", background: "var(--surface)" }}>

      {/* ── HERO ── */}
      <div style={{
        background: "linear-gradient(135deg, #1a0500 0%, #3a0c00 50%, #E8380D 100%)",
        padding: "40px 20px 56px",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: -60, right: -60, width: 280, height: 280, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
        <div style={{ position: "absolute", bottom: -40, left: -40, width: 180, height: 180, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />

        <div style={{ maxWidth: 800, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "rgba(255,255,255,0.12)", borderRadius: 99,
            padding: "5px 14px", marginBottom: 16,
          }}>
            <span>🏪</span>
            <span style={{ color: "#ffe8d6", fontSize: 12, fontWeight: 500 }}>
              {partners.length} boutique{partners.length > 1 ? "s" : ""} & restaurant{partners.length > 1 ? "s" : ""}
            </span>
          </div>
          <h1 style={{
            fontFamily: "Syne, sans-serif", fontWeight: 800,
            fontSize: "clamp(26px, 5vw, 38px)", color: "#fff",
            marginBottom: 8, lineHeight: 1.2,
          }}>
            Boutiques & restaurants<br />
            <span style={{ color: "#ffb59a" }}>partenaires Yitewo</span>
          </h1>
          <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
            Épiceries, supérettes, restaurants — commandez directement auprès de nos partenaires.
          </p>

          {/* Barre de recherche dans le hero */}
          <div style={{ position: "relative", maxWidth: 480 }}>
            <span style={{
              position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)",
              fontSize: 16, pointerEvents: "none",
            }}>🔍</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher boutique, restaurant, quartier…"
              style={{
                width: "100%", padding: "14px 16px 14px 46px",
                borderRadius: 14, border: "none",
                fontSize: 14, outline: "none",
                fontFamily: "DM Sans, sans-serif",
                boxShadow: "0 4px 24px rgba(0,0,0,0.2)",
                boxSizing: "border-box",
              }}
            />
            {search && (
              <button onClick={() => setSearch("")} style={{
                position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
                background: "none", border: "none", cursor: "pointer", color: "#aaa", fontSize: 16,
              }}>✕</button>
            )}
          </div>
        </div>
      </div>

      {/* ── FILTRES sticky ── */}
      <div style={{
        background: "#fff",
        borderBottom: "1px solid var(--border)",
        padding: "12px 20px",
        position: "sticky", top: 0, zIndex: 20,
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
      }}>
        <div style={{
          maxWidth: 800, margin: "0 auto",
          display: "flex", gap: 8, overflowX: "auto",
          scrollbarWidth: "none", paddingBottom: 2,
        }}>
          <button onClick={() => { setType(""); setZone(""); }} style={{
            flexShrink: 0, padding: "7px 16px", borderRadius: 99, fontSize: 12,
            cursor: "pointer", fontWeight: !type && !zone ? 700 : 400,
            border: `1.5px solid ${!type && !zone ? "var(--brand)" : "var(--border)"}`,
            background: !type && !zone ? "var(--brand-light)" : "#fff",
            color: !type && !zone ? "var(--brand)" : "var(--muted)",
            transition: "all 0.15s",
          }}>
            Tous ({partners.length})
          </button>

          {["Marchand", "Restaurant"].map((t) => {
            const meta = TYPE_META[t];
            const count = partners.filter(p => p.type === t).length;
            if (count === 0) return null;
            const active = type === t;
            return (
              <button key={t} onClick={() => setType(active ? "" : t)} style={{
                flexShrink: 0, padding: "7px 16px", borderRadius: 99, fontSize: 12,
                cursor: "pointer",
                border: `1.5px solid ${active ? meta.color : "var(--border)"}`,
                background: active ? meta.bg : "#fff",
                color: active ? meta.color : "var(--muted)",
                fontWeight: active ? 700 : 400, transition: "all 0.15s",
              }}>
                {meta.emoji} {t} ({count})
              </button>
            );
          })}

          {allZones.length > 0 && (
            <div style={{ width: 1, background: "var(--border)", margin: "3px 4px", flexShrink: 0 }} />
          )}

          {allZones.map((z) => {
            const active = zone === z;
            return (
              <button key={z} onClick={() => setZone(active ? "" : z)} style={{
                flexShrink: 0, padding: "7px 16px", borderRadius: 99, fontSize: 12,
                cursor: "pointer",
                border: `1.5px solid ${active ? "var(--brand)" : "var(--border)"}`,
                background: active ? "var(--brand-light)" : "#fff",
                color: active ? "var(--brand)" : "var(--muted)",
                fontWeight: active ? 700 : 400, transition: "all 0.15s",
              }}>
                📍 {z}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── GRILLE ── */}
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "24px 16px" }}>

        {filtered.length === 0 ? (
          <div style={{
            background: "#fff", borderRadius: 18, border: "1px solid var(--border)",
            padding: "60px 24px", textAlign: "center",
          }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
            <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 17, color: "var(--text)", marginBottom: 6 }}>
              Aucun résultat trouvé
            </p>
            <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 20 }}>
              Essayez un autre terme ou retirez les filtres.
            </p>
            <button onClick={() => { setSearch(""); setZone(""); setType(""); }} style={{
              padding: "10px 24px", borderRadius: 99, border: "none",
              background: "var(--brand)", color: "#fff",
              fontWeight: 700, fontSize: 13, cursor: "pointer",
            }}>
              Réinitialiser
            </button>
          </div>
        ) : (
          <>
            <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 16 }}>
              {filtered.length} résultat{filtered.length > 1 ? "s" : ""}
              {search && <span> pour "<strong style={{ color: "var(--text)" }}>{search}</strong>"</span>}
            </p>

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: 16,
            }}>
              {filtered.map((p, i) => (
                <PartnerCard key={p.id} p={p} index={i} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
