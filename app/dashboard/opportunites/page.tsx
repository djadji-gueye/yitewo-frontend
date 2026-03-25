"use client";

import { useState, useEffect, useCallback } from "react";

const BASE = process.env.NEXT_PUBLIC_URL_PROD || "http://localhost:3003";
function authFetch(path: string, options?: RequestInit) {
  const token = typeof window !== "undefined" ? localStorage.getItem("yitewo_token") : "";
  return fetch(`${BASE}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...options?.headers },
  }).then((r) => r.json());
}

const CAT_META: Record<string, { label: string; icon: string; color: string }> = {
  IMMOBILIER: { label: "Immobilier", icon: "🏠", color: "#f59e0b" },
  EMPLOI:     { label: "Emploi",     icon: "💼", color: "#3b82f6" },
  SERVICE:    { label: "Service",    icon: "🔧", color: "#8b5cf6" },
  COMMERCE:   { label: "Commerce",   icon: "🛒", color: "#10b981" },
  FORMATION:  { label: "Formation",  icon: "📚", color: "#ec4899" },
};

const SUB_STATUS: Record<string, { label: string; color: string }> = {
  PENDING:  { label: "En attente", color: "#f59e0b" },
  APPROVED: { label: "Approuvée",  color: "#10b981" },
  REJECTED: { label: "Refusée",    color: "#ef4444" },
};



function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Aujourd'hui";
  if (days === 1) return "Hier";
  return `Il y a ${days} j`;
}

type Tab = "submissions" | "published" | "scraper";

export default function OpportunitesPage() {
  const [tab, setTab] = useState<Tab>("submissions");
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [published, setPublished] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);

  // Scraper state
  const [scraperResult] = useState<any>(null); // kept for future use

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [subs, pubs] = await Promise.all([
        authFetch("/opportunities/admin/submissions"),
        authFetch("/opportunities/admin/all"),
      ]);
      setSubmissions(Array.isArray(subs) ? subs : []);
      setPublished(Array.isArray(pubs) ? pubs : []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const approve = async (id: string) => {
    setActing(id);
    try {
      await authFetch(`/opportunities/admin/submissions/${id}/approve`, { method: "POST" });
      setSubmissions((prev) => prev.map((s) => s.id === id ? { ...s, status: "APPROVED" } : s));
      await load();
    } finally { setActing(null); }
  };

  const reject = async (id: string) => {
    setActing(id);
    try {
      await authFetch(`/opportunities/admin/submissions/${id}/reject`, { method: "POST" });
      setSubmissions((prev) => prev.map((s) => s.id === id ? { ...s, status: "REJECTED" } : s));
    } finally { setActing(null); }
  };

  const togglePublish = async (id: string, current: boolean) => {
    setActing(id);
    try {
      await authFetch(`/opportunities/admin/${id}/publish`, {
        method: "PATCH",
        body: JSON.stringify({ isPublished: !current }),
      });
      setPublished((prev) => prev.map((p) => p.id === id ? { ...p, isPublished: !current } : p));
    } finally { setActing(null); }
  };

  const deleteOpp = async (id: string) => {
    if (!confirm("Supprimer cette annonce ?")) return;
    setActing(id);
    try {
      await authFetch(`/opportunities/admin/${id}`, { method: "DELETE" });
      setPublished((prev) => prev.filter((p) => p.id !== id));
    } finally { setActing(null); }
  };



  const pendingCount = submissions.filter((s) => s.status === "PENDING").length;
  const externalCount = published.filter((p) => p.isExternal).length;

  return (
    <div style={{ padding: "28px", maxWidth: 1000, margin: "0 auto" }}>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 22, color: "#fff" }}>
          Opportunités
        </h1>
        <button onClick={load} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "6px 12px", color: "#888", fontSize: 12, cursor: "pointer" }}>
          ↻ Actualiser
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 24, background: "#13131f", borderRadius: 10, padding: 4, width: "fit-content", border: "1px solid rgba(255,255,255,0.06)" }}>
        {[
          { key: "submissions", label: "À valider",  count: pendingCount },
          { key: "published",   label: "Publiées",   count: published.filter((p) => p.isPublished).length },
          { key: "scraper",     label: "🤖 Scraper",  count: externalCount },
        ].map((t) => (
          <button key={t.key} onClick={() => setTab(t.key as Tab)} style={{
            padding: "8px 18px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 13,
            background: tab === t.key ? "#E8380D" : "transparent",
            color: tab === t.key ? "#fff" : "#666",
            fontWeight: tab === t.key ? 700 : 400,
            display: "flex", alignItems: "center", gap: 8, transition: "all 0.18s",
          }}>
            {t.label}
            {t.count > 0 && (
              <span style={{ background: tab === t.key ? "rgba(255,255,255,0.25)" : "#E8380D", color: "#fff", borderRadius: 99, fontSize: 10, fontWeight: 800, padding: "1px 6px" }}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading && tab !== "scraper" ? (
        <div style={{ textAlign: "center", padding: "60px", color: "#444" }}>Chargement…</div>
      ) : tab === "submissions" ? (

        /* ── Soumissions ── */
        submissions.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px", color: "#444" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
            <p>Aucune soumission en attente</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {submissions.map((sub) => {
              const cat    = CAT_META[sub.category] || CAT_META.IMMOBILIER;
              const status = SUB_STATUS[sub.status] || SUB_STATUS.PENDING;
              const isPending = sub.status === "PENDING";
              return (
                <div key={sub.id} style={{ background: "#13131f", border: `1px solid ${isPending ? "rgba(245,158,11,0.2)" : "rgba(255,255,255,0.06)"}`, borderRadius: 14, padding: "18px 20px", opacity: isPending ? 1 : 0.6 }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 14, flexWrap: "wrap" }}>
                    <div style={{ width: 44, height: 44, borderRadius: 10, background: cat.color + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
                      {cat.icon}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                        <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 15, color: "#fff" }}>{sub.title}</h3>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: status.color + "22", color: status.color }}>{status.label}</span>
                      </div>
                      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", fontSize: 12, color: "#666", marginBottom: 6 }}>
                        <span>{cat.icon} {cat.label}</span>
                        <span>📍 {sub.location}</span>
                        {sub.price && <span style={{ color: "#E8380D" }}>💰 {sub.price}</span>}
                        <span>📞 {sub.contact}</span>
                        <span>🕐 {timeAgo(sub.createdAt)}</span>
                      </div>
                      <p style={{ fontSize: 12, color: "#777", lineHeight: 1.5 }}>{sub.description}</p>
                    </div>
                    {isPending && (
                      <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                        <button onClick={() => approve(sub.id)} disabled={acting === sub.id}
                          style={{ padding: "8px 18px", borderRadius: 8, border: "none", background: "#10b981", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", opacity: acting === sub.id ? 0.6 : 1 }}>
                          {acting === sub.id ? "…" : "✅ Approuver"}
                        </button>
                        <button onClick={() => reject(sub.id)} disabled={acting === sub.id}
                          style={{ padding: "8px 18px", borderRadius: 8, border: "1px solid rgba(239,68,68,0.3)", background: "transparent", color: "#ef4444", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                          ❌ Rejeter
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )

      ) : tab === "published" ? (

        /* ── Publiées ── */
        published.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px", color: "#444" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📢</div>
            <p>Aucune opportunité publiée</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {published.map((opp) => {
              const cat = CAT_META[opp.category] || CAT_META.IMMOBILIER;
              return (
                <div key={opp.id} style={{ background: "#13131f", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: "14px 18px", display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: cat.color + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>
                    {cat.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3, flexWrap: "wrap" }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: "#ddd" }}>{opp.title}</p>
                      {opp.isExternal && (
                        <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 7px", borderRadius: 99, background: "rgba(14,165,233,0.15)", color: "#0ea5e9" }}>
                          🔗 {opp.sourceName}
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: 11, color: "#555" }}>📍 {opp.location} · 👥 {opp._count?.interests || 0} intéressé(s) · {timeAgo(opp.createdAt)}</p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 99, background: opp.isPublished ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.05)", color: opp.isPublished ? "#10b981" : "#666" }}>
                      {opp.isPublished ? "● Publiée" : "○ Masquée"}
                    </span>
                    <button onClick={() => togglePublish(opp.id, opp.isPublished)} disabled={acting === opp.id}
                      style={{ padding: "5px 12px", borderRadius: 8, fontSize: 11, cursor: "pointer", border: "1px solid rgba(255,255,255,0.08)", background: "transparent", color: "#888" }}>
                      {acting === opp.id ? "…" : opp.isPublished ? "Masquer" : "Publier"}
                    </button>
                    <button onClick={() => deleteOpp(opp.id)} disabled={acting === opp.id}
                      style={{ padding: "5px 10px", borderRadius: 8, fontSize: 11, cursor: "pointer", border: "1px solid rgba(239,68,68,0.2)", background: "transparent", color: "#ef4444" }}>
                      🗑
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )

      ) : (

        /* ── Scraper ── */
        <div>
          <div style={{ background: "#13131f", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: "24px", marginBottom: 20 }}>
            <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 16, color: "#fff", marginBottom: 6 }}>
              🤖 Annonces externes — Expat-Dakar
            </h2>
            <p style={{ color: "#555", fontSize: 13, marginBottom: 20, lineHeight: 1.6 }}>
              Les annonces externes sont importées depuis ton Mac via le script local Playwright.
              Les visiteurs sont redirigés vers Expat-Dakar au clic.
              Le cron backend supprime automatiquement les annonces de plus de 30 jours <strong style={{ color: "#888" }}>chaque lundi à 06h00</strong>.
            </p>

            {/* Instructions script local */}
            <div style={{ background: "rgba(14,165,233,0.08)", border: "1px solid rgba(14,165,233,0.2)", borderRadius: 12, padding: "18px 20px" }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#7dd3fc", marginBottom: 10 }}>
                📋 Comment importer de nouvelles annonces
              </p>
              <p style={{ fontSize: 12, color: "#555", marginBottom: 10, lineHeight: 1.6 }}>
                Lance le script depuis ton Mac (dossier <code style={{ color: "#7dd3fc" }}>yitewo-scraper</code>) :
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  { cmd: "node scraper.mjs",             desc: "Toutes les catégories" },
                  { cmd: "node scraper.mjs immobilier",  desc: "Immobilier seulement" },
                  { cmd: "node scraper.mjs emploi",      desc: "Emploi seulement" },
                  { cmd: "node scraper.mjs services",    desc: "Services seulement" },
                ].map((item) => (
                  <div key={item.cmd} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <code style={{ background: "rgba(0,0,0,0.4)", borderRadius: 6, padding: "5px 12px", color: "#e0f2fe", fontSize: 12, fontFamily: "monospace", flexShrink: 0 }}>
                      {item.cmd}
                    </code>
                    <span style={{ fontSize: 12, color: "#444" }}>{item.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12, marginTop: 20 }}>
            {[
              { label: "Annonces externes",  value: externalCount, color: "#0ea5e9" },
              { label: "Annonces internes",  value: published.filter((p) => !p.isExternal).length, color: "#10b981" },
              { label: "Total publiées",     value: published.filter((p) => p.isPublished).length, color: "#E8380D" },
            ].map((s) => (
              <div key={s.label} style={{ background: "#13131f", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: "16px 18px" }}>
                <p style={{ fontSize: 24, fontFamily: "Syne, sans-serif", fontWeight: 800, color: s.color, marginBottom: 4 }}>{s.value}</p>
                <p style={{ fontSize: 12, color: "#555" }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
