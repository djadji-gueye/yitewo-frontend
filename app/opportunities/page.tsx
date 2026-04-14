"use client";

import Link from "next/link";
import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const BASE = process.env.NEXT_PUBLIC_URL_PROD || "http://localhost:3003";

const CATEGORY_META: Record<string, { label: string; icon: string; color: string; bg: string }> = {
  IMMOBILIER: { label: "Immobilier", icon: "🏠", color: "#b45309", bg: "#fef3c7" },
  EMPLOI: { label: "Emploi", icon: "💼", color: "#1d4ed8", bg: "#dbeafe" },
  SERVICE: { label: "Service", icon: "🔧", color: "#6d28d9", bg: "#ede9fe" },
  COMMERCE: { label: "Commerce", icon: "🛒", color: "#047857", bg: "#d1fae5" },
  FORMATION: { label: "Formation", icon: "📚", color: "#be185d", bg: "#fce7f3" },
};

const CITIES = ["Dakar", "Saint-Louis", "Thiès", "Ziguinchor"];
const LIMIT = 12;

function daysSince(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Aujourd'hui";
  if (days === 1) return "Hier";
  return `Il y a ${days} j`;
}

function CardSkeleton() {
  return (
    <div style={{ background: "#fff", borderRadius: 18, border: "1px solid var(--border)", overflow: "hidden" }}>
      <div className="skeleton" style={{ height: 100 }} />
      <div style={{ padding: "16px 18px" }}>
        <div className="skeleton" style={{ height: 14, width: "40%", borderRadius: 8, marginBottom: 12 }} />
        <div className="skeleton" style={{ height: 18, borderRadius: 8, marginBottom: 8 }} />
        <div className="skeleton" style={{ height: 14, width: "70%", borderRadius: 8 }} />
      </div>
    </div>
  );
}

function OpportunitiesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [city, setCity] = useState(searchParams.get("city") || "");
  const [source, setSource] = useState(searchParams.get("source") || ""); // "external" | "internal" | ""
  const [page, setPage] = useState(Number(searchParams.get("page") || 1));
  const [searchInput, setSearchInput] = useState(search);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(LIMIT));
      if (category) params.set("category", category);
      if (city) params.set("city", city);
      if (search) params.set("search", search);
      if (source === "external") params.set("isExternal", "true");
      if (source === "internal") params.set("isExternal", "false");

      const res = await fetch(`${BASE}/opportunities?${params}`);
      const json = await res.json();
      setData(json);
    } catch {
      setData({ items: [], total: 0, totalPages: 0 });
    } finally {
      setLoading(false);
    }
  }, [page, category, city, search, source]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Reset page when filters change
  const applyFilter = (key: string, val: string) => {
    setPage(1);
    if (key === "category") setCategory(val);
    if (key === "city") setCity(val);
    if (key === "source") setSource(val);
  };

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1);
  };

  const clearFilters = () => {
    setCategory(""); setCity(""); setSource("");
    setSearch(""); setSearchInput(""); setPage(1);
  };

  const hasFilters = category || city || source || search;
  const items: any[] = data?.items || [];
  const totalPages: number = data?.totalPages || 0;
  const total: number = data?.total || 0;

  return (
    <div style={{ background: "var(--surface)", minHeight: "100vh" }}>

      {/* ── Header ── */}
      <div style={{
        background: "linear-gradient(135deg, #0a0a1a 0%, #1a1a3e 60%, #2d2d8f 100%)",
        padding: "44px 20px 52px", position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: -60, right: -60, width: 280, height: 280, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
        <div style={{ maxWidth: 1000, margin: "0 auto", position: "relative", zIndex: 1 }}>
          {/* Titre + boutons actions en flex responsive */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 18, flexWrap: "wrap" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.12)", borderRadius: 99, padding: "5px 14px" }}>
              <span style={{ color: "#c8d8ff", fontSize: 13, fontWeight: 500 }}>✨ Offres & Annonces</span>
            </div>
            {/* Boutons déplacés ici — visibles sur mobile */}
            <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
              <Link href="/opportunities/mes-annonces" style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)",
                color: "#fff", padding: "9px 14px", borderRadius: 99,
                textDecoration: "none", fontWeight: 600, fontSize: 12, whiteSpace: "nowrap",
              }}>
                📋 <span style={{ display: "var(--btn-label, inline)" }}>Mes annonces</span>
              </Link>
              <Link href="/opportunities/poster" style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                background: "var(--brand)", color: "#fff", padding: "9px 14px", borderRadius: 99,
                textDecoration: "none", fontWeight: 700, fontSize: 13, whiteSpace: "nowrap",
                boxShadow: "0 4px 16px rgba(232,56,13,0.4)",
              }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Publier
              </Link>
            </div>
          </div>
          <h1 style={{ fontFamily: "Syne", fontWeight: 800, fontSize: "clamp(26px, 4vw, 42px)", color: "#fff", marginBottom: 10, lineHeight: 1.2 }}>
            Opportunités
          </h1>
          <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 15, maxWidth: 520, lineHeight: 1.6, marginBottom: 28 }}>
            Immobilier, emploi, services, commerces — trouvez ou publiez une opportunité partout au Sénégal.
          </p>

          {/* Search bar */}
          <div style={{ position: "relative", maxWidth: 500 }}>
            <svg style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.4)" }}
              width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Rechercher une opportunité…"
              style={{ width: "100%", padding: "13px 120px 13px 46px", borderRadius: 99, border: "1px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.1)", color: "#fff", fontSize: 14, outline: "none", backdropFilter: "blur(8px)" }}
            />
            <button onClick={handleSearch} style={{
              position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)",
              padding: "7px 18px", borderRadius: 99, border: "none",
              background: "#E8380D", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer",
            }}>
              Rechercher
            </button>
          </div>
        </div>


      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 20px 64px" }}>

        {/* ── Filters bar ── */}
        <style>{`
          @media (max-width: 640px) {
            .filters-bar { flex-direction: column !important; align-items: flex-start !important; gap: 10px !important; }
            .filters-sep { display: none !important; }
            .pills-scroll { overflow-x: auto; scrollbar-width: none; -webkit-overflow-scrolling: touch; padding-bottom: 2px; }
            .pills-scroll::-webkit-scrollbar { display: none; }
          }
        `}</style>
        <div className="filters-bar" style={{
          background: "#fff", borderRadius: 14, border: "1px solid var(--border)",
          padding: "16px 20px", marginBottom: 24,
          display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center",
        }}>

          {/* Category */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0, width: "100%", maxWidth: "100%" }}>
            <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600, flexShrink: 0 }}>Catégorie</span>
            <div className="pills-scroll" style={{ display: "flex", gap: 6, overflowX: "auto", scrollbarWidth: "none" as const }}>
              <button onClick={() => applyFilter("category", "")} style={filterPill(!category)}>Toutes</button>
              {Object.entries(CATEGORY_META).map(([k, m]) => (
                <button key={k} onClick={() => applyFilter("category", k)} style={{
                  ...filterPill(category === k),
                  borderColor: category === k ? m.color : "var(--border)",
                  background: category === k ? m.bg : "#fff",
                  color: category === k ? m.color : "var(--muted)",
                }}>
                  {m.icon} {m.label}
                </button>
              ))}
            </div>
          </div>

          <div className="filters-sep" style={{ width: 1, height: 24, background: "var(--border)", flexShrink: 0 }} />

          {/* City */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600 }}>Ville</span>
            <select value={city} onChange={(e) => applyFilter("city", e.target.value)}
              style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid var(--border)", fontSize: 12, outline: "none", background: "#fff", color: city ? "var(--text)" : "var(--muted)" }}>
              <option value="">Toutes</option>
              {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="filters-sep" style={{ width: 1, height: 24, background: "var(--border)", flexShrink: 0 }} />

          {/* Source */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600 }}>Source</span>
            <div style={{ display: "flex", gap: 6 }}>
              {[
                { val: "", label: "Toutes" },
                { val: "internal", label: "✍️ Yitewo" },
                //   { val: "external", label: "🔗 Externes" },
              ].map((s) => (
                <button key={s.val} onClick={() => applyFilter("source", s.val)} style={filterPill(source === s.val)}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Clear */}
          {hasFilters && (
            <button onClick={clearFilters} style={{
              marginLeft: "auto", padding: "6px 14px", borderRadius: 8,
              border: "1px solid var(--border)", background: "#fff",
              color: "var(--brand)", fontSize: 12, fontWeight: 600, cursor: "pointer",
            }}>
              ✕ Effacer les filtres
            </button>
          )}
        </div>

        {/* ── Results count ── */}
        {!loading && (
          <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 20 }}>
            {total} annonce{total > 1 ? "s" : ""}
            {hasFilters && " · filtres actifs"}
            {totalPages > 1 && ` · page ${page}/${totalPages}`}
          </p>
        )}

        {/* ── Grid ── */}
        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
            {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : items.length === 0 ? (
          <div style={{ textAlign: "center", padding: "64px 20px", color: "var(--muted)" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
            <p style={{ fontFamily: "Syne", fontWeight: 600, fontSize: 18, marginBottom: 8 }}>Aucune annonce</p>
            <p style={{ fontSize: 14, marginBottom: 20 }}>
              {hasFilters ? "Essayez d'autres filtres" : "Soyez le premier à publier !"}
            </p>
            {hasFilters ? (
              <button onClick={clearFilters} style={{ background: "var(--brand)", color: "#fff", border: "none", padding: "10px 24px", borderRadius: 99, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
                Effacer les filtres
              </button>
            ) : (
              <Link href="/opportunities/poster" style={{ display: "inline-block", background: "var(--brand)", color: "#fff", padding: "10px 24px", borderRadius: 99, textDecoration: "none", fontWeight: 700, fontSize: 14 }}>
                Publier une annonce
              </Link>
            )}
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
            {items.map((opp: any, i: number) => {
              const meta = CATEGORY_META[opp.category] || CATEGORY_META.IMMOBILIER;
              const isExt = opp.isExternal && opp.sourceUrl;
              const href = isExt ? opp.sourceUrl : `/opportunities/${opp.slug}`;
              return (
                <a
                  key={opp.id}
                  href={href}
                  target={isExt ? "_blank" : undefined}
                  rel={isExt ? "noopener noreferrer" : undefined}
                  className={`fade-up delay-${Math.min((i % 6) + 1, 6)}`}
                  style={{
                    background: "#fff", borderRadius: 18,
                    border: "1px solid var(--border)",
                    textDecoration: "none", color: "var(--text)",
                    overflow: "hidden", display: "flex", flexDirection: "column",
                    boxShadow: "var(--shadow-card)",
                    transition: "transform 0.22s, box-shadow 0.22s",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-4px)";
                    (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 12px 36px rgba(0,0,0,0.12)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)";
                    (e.currentTarget as HTMLAnchorElement).style.boxShadow = "var(--shadow-card)";
                  }}
                >
                  {/* Image or colored header */}
                  {opp.imageUrl ? (
                    <div style={{ height: 160, overflow: "hidden" }}>
                      <img src={opp.imageUrl} alt={opp.title} style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    </div>
                  ) : (
                    <div style={{ height: 80, background: meta.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36 }}>
                      {meta.icon}
                    </div>
                  )}

                  <div style={{ padding: "16px 18px 18px", flex: 1, display: "flex", flexDirection: "column" }}>
                    {/* Badges */}
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 99, background: meta.bg, color: meta.color }}>
                        {meta.icon} {meta.label}
                      </span>
                      {opp.badge && (
                        <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 99, background: opp.badge === "Urgent" ? "#fee2e2" : "#d1fae5", color: opp.badge === "Urgent" ? "#b91c1c" : "#065f46" }}>
                          {opp.badge === "Urgent" ? "🔴" : "🟢"} {opp.badge}
                        </span>
                      )}
                      {isExt && (
                        <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 99, background: "#e0f2fe", color: "#0369a1", display: "flex", alignItems: "center", gap: 4 }}>
                          🔗 {opp.sourceName}
                        </span>
                      )}
                      {opp._count?.interests > 0 && (
                        <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 99, background: "#f0f0ff", color: "#4f46e5" }}>
                          👥 {opp._count.interests}
                        </span>
                      )}
                    </div>

                    <h3 style={{ fontFamily: "Syne", fontWeight: 700, fontSize: 15, marginBottom: 6, lineHeight: 1.3, flex: 1 }}>
                      {opp.title}
                    </h3>

                    <p style={{
                      fontSize: 13, color: "var(--muted)", lineHeight: 1.5, marginBottom: 12,
                      display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden"
                    }}>
                      {opp.description}
                    </p>

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto" }}>
                      <span style={{ fontSize: 12, color: "var(--muted)", display: "flex", alignItems: "center", gap: 4 }}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
                        </svg>
                        {opp.location}
                      </span>
                      <span style={{ fontSize: 11, color: "var(--muted)" }}>{daysSince(opp.createdAt)}</span>
                    </div>

                    {opp.price && (
                      <div style={{ marginTop: 10, padding: "5px 12px", background: "var(--brand-light)", borderRadius: 8, display: "inline-block" }}>
                        <span style={{ color: "var(--brand)", fontWeight: 700, fontSize: 13 }}>{opp.price}</span>
                      </div>
                    )}

                    {/* External CTA */}
                    {isExt && (
                      <div style={{ marginTop: 12, padding: "8px 12px", background: "#e0f2fe", borderRadius: 8, fontSize: 12, color: "#0369a1", fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                          <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                          <polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
                        </svg>
                        Voir sur {opp.sourceName}
                      </div>
                    )}
                  </div>
                </a>
              );
            })}
          </div>
        )}

        {/* ── Pagination ── */}
        {totalPages > 1 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 40, flexWrap: "wrap" }}>
            <button
              onClick={() => setPage(page - 1)}
              disabled={page <= 1}
              style={pageBtn(false, page <= 1)}
            >
              ← Précédent
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
              .reduce((acc: (number | string)[], p, i, arr) => {
                if (i > 0 && (p as number) - (arr[i - 1] as number) > 1) acc.push("…");
                acc.push(p);
                return acc;
              }, [])
              .map((p, i) =>
                p === "…" ? (
                  <span key={`ellipsis-${i}`} style={{ color: "var(--muted)", padding: "0 4px" }}>…</span>
                ) : (
                  <button key={p} onClick={() => setPage(p as number)} style={pageBtn(p === page, false)}>
                    {p}
                  </button>
                )
              )}

            <button
              onClick={() => setPage(page + 1)}
              disabled={page >= totalPages}
              style={pageBtn(false, page >= totalPages)}
            >
              Suivant →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function filterPill(active: boolean): React.CSSProperties {
  return {
    flexShrink: 0, padding: "5px 14px", borderRadius: 99, fontSize: 12,
    border: "1px solid " + (active ? "var(--text)" : "var(--border)"),
    background: active ? "var(--text)" : "#fff",
    color: active ? "#fff" : "var(--muted)",
    fontWeight: active ? 700 : 400, cursor: "pointer",
    transition: "all 0.18s", whiteSpace: "nowrap" as const,
  };
}

function pageBtn(active: boolean, disabled: boolean): React.CSSProperties {
  return {
    padding: "8px 16px", borderRadius: 10, fontSize: 13, cursor: disabled ? "not-allowed" : "pointer",
    border: "1px solid " + (active ? "var(--brand)" : "var(--border)"),
    background: active ? "var(--brand)" : "#fff",
    color: active ? "#fff" : disabled ? "#ccc" : "var(--text)",
    fontWeight: active ? 700 : 400, transition: "all 0.18s",
    opacity: disabled ? 0.5 : 1,
  };
}

export default function OpportunitiesPage() {
  return (
    <Suspense fallback={
      <div style={{ background: "var(--surface)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "var(--muted)", fontSize: 14 }}>Chargement…</div>
      </div>
    }>
      <OpportunitiesContent />
    </Suspense>
  );
}
