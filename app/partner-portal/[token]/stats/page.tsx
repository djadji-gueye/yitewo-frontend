"use client";

import { usePlan } from "@/hooks/usePlan";
import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";

const BASE = process.env.NEXT_PUBLIC_URL_PROD || "http://localhost:3003";

type Period = "7j" | "30j" | "90j" | "tout";

function StarRating({ rating }: { rating: number }) {
  return (
    <span>{[1, 2, 3, 4, 5].map((i) => (
      <span key={i} style={{ fontSize: 14, color: i <= Math.round(rating) ? "#f59e0b" : "#e5e7eb" }}>★</span>
    ))}</span>
  );
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Aujourd'hui";
  if (days === 1) return "Hier";
  return `Il y a ${days} j`;
}

// ── Graphes SVG robustes 2026 ────────────────────────────

// Lignes de grille horizontales
function GridLines({ W, H, steps = 4 }: { W: number; H: number; steps?: number }) {
  return (
    <>
      {Array.from({ length: steps + 1 }, (_, i) => {
        const y = H - (i / steps) * H;
        return <line key={i} x1={0} y1={y} x2={W} y2={y} stroke="#f0ebe8" strokeWidth="1" />;
      })}
    </>
  );
}

// Tooltip hover via title SVG natif (compat tous navigateurs)
function BarChart({
  data, color = "#E8380D", label = "", unit = "",
}: {
  data: { label: string; value: number }[];
  color?: string; label?: string; unit?: string;
}) {
  if (!data || data.length === 0) return (
    <div style={{ height: 120, display: "flex", alignItems: "center", justifyContent: "center", color: "#aaa", fontSize: 13 }}>
      Aucune donnée pour cette période
    </div>
  );

  const safeData = data.map((d) => ({ ...d, value: isNaN(d.value) ? 0 : d.value }));
  const max = Math.max(...safeData.map((d) => d.value), 1);
  const W = 520, H = 110, padL = 32, padB = 22;
  const innerW = W - padL;
  const barW = Math.max(6, Math.min(32, innerW / safeData.length - 6));
  const gap = innerW / safeData.length;

  // Labels Y
  const ySteps = 4;
  const yLabels = Array.from({ length: ySteps + 1 }, (_, i) => ({
    y: H - (i / ySteps) * H,
    val: Math.round((i / ySteps) * max),
  }));

  return (
    <div>
      {label && (
        <p style={{ fontSize: 12, color: "#888", marginBottom: 8, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
          {label}
        </p>
      )}
      <svg width="100%" viewBox={`0 0 ${W} ${H + padB}`} style={{ overflow: "visible", display: "block" }}>
        {/* Grille */}
        <g transform={`translate(${padL},0)`}>
          {yLabels.map((l, i) => (
            <g key={i}>
              <line x1={0} y1={l.y} x2={innerW} y2={l.y} stroke="#f0ebe8" strokeWidth="1" />
              <text x={-6} y={l.y + 4} textAnchor="end" fontSize="9" fill="#bbb">{l.val}{unit}</text>
            </g>
          ))}
        </g>
        {/* Barres */}
        <g transform={`translate(${padL},0)`}>
          {safeData.map((d, i) => {
            const barH = max > 0 ? Math.max((d.value / max) * H, d.value > 0 ? 3 : 0) : 0;
            const x = i * gap + gap / 2 - barW / 2;
            const y = H - barH;
            const isWeekend = safeData.length <= 7 && (i === 5 || i === 6);
            return (
              <g key={i}>
                {/* Barre fond */}
                <rect x={x} y={0} width={barW} height={H} fill={isWeekend ? "#fdf4f2" : "#fafaf8"} rx="3" />
                {/* Barre valeur */}
                <rect x={x} y={y} width={barW} height={barH} fill={color} rx="3"
                  opacity={d.value === 0 ? 0 : 0.88}>
                  <title>{d.label}: {d.value}{unit}</title>
                </rect>
                {/* Valeur au dessus si > 0 */}
                {d.value > 0 && barH > 14 && (
                  <text x={x + barW / 2} y={y - 5} textAnchor="middle" fontSize="9" fill={color} fontWeight="700">{d.value}{unit}</text>
                )}
                {/* Label bas */}
                <text x={x + barW / 2} y={H + 14} textAnchor="middle" fontSize="9" fill={isWeekend ? "#E8380D" : "#bbb"} fontWeight={isWeekend ? "700" : "400"}>
                  {d.label}
                </text>
              </g>
            );
          })}
        </g>
        {/* Axe X */}
        <line x1={padL} y1={H} x2={W} y2={H} stroke="#f0ebe8" strokeWidth="1" />
      </svg>
    </div>
  );
}

function LineChart({
  data, color = "#E8380D", label = "", unit = "",
}: {
  data: { label: string; value: number }[];
  color?: string; label?: string; unit?: string;
}) {
  if (!data || data.length === 0) return (
    <div style={{ height: 120, display: "flex", alignItems: "center", justifyContent: "center", color: "#aaa", fontSize: 13 }}>
      Aucune donnée pour cette période
    </div>
  );

  const safeData = data.map((d) => ({ ...d, value: isNaN(d.value) ? 0 : d.value }));
  const max = Math.max(...safeData.map((d) => d.value), 1);
  const W = 520, H = 100, padL = 36, padB = 22;
  const innerW = W - padL;

  const pts = safeData.map((d, i) => ({
    x: padL + (i / Math.max(safeData.length - 1, 1)) * innerW,
    y: H - Math.max((d.value / max) * (H - 8), 0),
    v: d.value,
    l: d.label,
  }));

  const pathD = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const areaD = pts.length > 1
    ? `${pathD} L${pts[pts.length - 1].x.toFixed(1)},${H} L${pts[0].x.toFixed(1)},${H} Z`
    : "";

  // Labels Y
  const ySteps = 3;
  const yLabels = Array.from({ length: ySteps + 1 }, (_, i) => ({
    y: H - (i / ySteps) * H,
    val: Math.round((i / ySteps) * max),
  }));

  return (
    <div>
      {label && (
        <p style={{ fontSize: 12, color: "#888", marginBottom: 8, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
          {label}
        </p>
      )}
      <svg width="100%" viewBox={`0 0 ${W} ${H + padB}`} style={{ overflow: "visible", display: "block" }}>
        {/* Labels Y */}
        {yLabels.map((l, i) => (
          <g key={i}>
            <line x1={padL} y1={l.y} x2={W} y2={l.y} stroke="#f0ebe8" strokeWidth="1" strokeDasharray={i === 0 ? "0" : "3,3"} />
            <text x={padL - 6} y={l.y + 4} textAnchor="end" fontSize="9" fill="#bbb">{l.val}{unit}</text>
          </g>
        ))}
        {/* Zone remplie */}
        {areaD && (
          <defs>
            <linearGradient id={`grad-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.18" />
              <stop offset="100%" stopColor={color} stopOpacity="0.01" />
            </linearGradient>
          </defs>
        )}
        {areaD && <path d={areaD} fill={`url(#grad-${color.replace("#", "")})`} />}
        {/* Ligne */}
        {pts.length > 1 && (
          <path d={pathD} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        )}
        {/* Points */}
        {pts.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="5" fill="#fff" stroke={color} strokeWidth="2">
              <title>{p.l}: {p.v}{unit}</title>
            </circle>
            {p.v > 0 && (
              <text x={p.x} y={p.y - 9} textAnchor="middle" fontSize="9" fill={color} fontWeight="700">{p.v}{unit}</text>
            )}
            <text x={p.x} y={H + 14} textAnchor="middle" fontSize="9" fill="#bbb">{p.l}</text>
          </g>
        ))}
        {/* Axe X */}
        <line x1={padL} y1={H} x2={W} y2={H} stroke="#e8e0dc" strokeWidth="1.5" />
      </svg>
    </div>
  );
}

export default function PartnerStatsPage() {
  const params = useParams();
  const token = params?.token as string;

  const [partner, setPartner] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [period, setPeriod] = useState<Period>("30j");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    fetch(`${BASE}/partners/portal/${token}`)
      .then((r) => r.json())
      .then((p) => {
        setPartner(p);
        return Promise.all([
          fetch(`${BASE}/social/stats/${p.slug}`).then((r) => r.json()),
          fetch(`${BASE}/social/reviews/${p.slug}?limit=20`).then((r) => r.json()),
          fetch(`${BASE}/orders?partnerToken=${token}`).then((r) => r.json()).catch(() => []),
        ]);
      })
      .then(([s, r, o]) => {
        setStats(s);
        setReviews(r?.reviews || []);
        setOrders(Array.isArray(o) ? o : o?.data ?? []);
      })
      .finally(() => setLoading(false));
  }, [token]);

  // Filtrer selon la période
  const filteredOrders = useMemo(() => {
    if (period === "tout") return orders;
    const days = period === "7j" ? 7 : period === "30j" ? 30 : 90;
    const cutoff = Date.now() - days * 86400000;
    return orders.filter((o) => new Date(o.createdAt).getTime() > cutoff);
  }, [orders, period]);

  // Données graphe commandes par jour (7 derniers jours)
  const ordersChartData = useMemo(() => {
    const days = period === "7j" ? 7 : period === "30j" ? 30 : 14;
    return Array.from({ length: days }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (days - 1 - i));
      const label = days <= 7
        ? d.toLocaleDateString("fr-FR", { weekday: "short" }).slice(0, 3)
        : `${d.getDate()}/${d.getMonth() + 1}`;
      const count = filteredOrders.filter((o) => {
        const od = new Date(o.createdAt);
        return od.getDate() === d.getDate() && od.getMonth() === d.getMonth() && od.getFullYear() === d.getFullYear();
      }).length;
      return { label, value: count };
    });
  }, [filteredOrders, period]);

  // Revenus par jour
  const revenueChartData = useMemo(() => {
    const days = period === "7j" ? 7 : period === "30j" ? 30 : 14;
    return Array.from({ length: days }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (days - 1 - i));
      const label = days <= 7
        ? d.toLocaleDateString("fr-FR", { weekday: "short" }).slice(0, 3)
        : `${d.getDate()}/${d.getMonth() + 1}`;
      const rev = filteredOrders
        .filter((o) => o.status === "DELIVERED" && (() => { const od = new Date(o.createdAt); return od.getDate() === d.getDate() && od.getMonth() === d.getMonth(); })())
        .reduce((s, o) => s + (o.totalPrice || 0), 0);
      return { label, value: Math.round(rev / 1000) }; // en milliers FCFA
    });
  }, [filteredOrders, period]);

  const totalRevenue = filteredOrders.filter((o) => o.status === "DELIVERED").reduce((s, o) => s + (o.totalPrice || 0), 0);
  const pendingCount = filteredOrders.filter((o) => o.status === "PENDING").length;
  const deliveredCount = filteredOrders.filter((o) => o.status === "DELIVERED").length;
  const convRate = filteredOrders.length > 0 ? Math.round((deliveredCount / filteredOrders.length) * 100) : 0;

  const BADGE_META: Record<string, { label: string; color: string; bg: string; icon: string }> = {
    top: { label: "Top vendeur", color: "#92400e", bg: "#fef3c7", icon: "🏆" },
    popular: { label: "Populaire", color: "#6d28d9", bg: "#ede9fe", icon: "🔥" },
    trusted: { label: "De confiance", color: "#065f46", bg: "#d1fae5", icon: "✅" },
  };

  if (loading) return <div style={{ padding: 60, textAlign: "center", color: "#aaa" }}>Chargement…</div>;

  const badge = stats?.badge ? BADGE_META[stats.badge] : null;


  // Protection plan
  const planInfo = usePlan(partner?.plan || "free");
  if (!loading && !planInfo.canSeeStats) {
    return (
      <div style={{ padding: 28, maxWidth: 520, margin: "0 auto" }}>
        <div style={{ background: "#fff", border: "1px solid #f0ebe8", borderRadius: 20, padding: "40px 32px", textAlign: "center" }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>📈</div>
          <h2 style={{ fontFamily: "Syne", fontWeight: 800, fontSize: 20, color: "#1a1a1a", marginBottom: 10 }}>Statistiques de visites</h2>
          <p style={{ color: "#888", fontSize: 14, lineHeight: 1.7, marginBottom: 24 }}>
            Les statistiques détaillées sont disponibles à partir du plan Pro (4 900 FCFA/mois).
          </p>
          <div style={{ filter: "blur(5px)", opacity: 0.35, pointerEvents: "none", marginBottom: 24 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {["1 234 vues", "89 clics", "7.2% taux", "Mermoz"].map((v) => (
                <div key={v} style={{ background: "#f5f5f5", borderRadius: 10, padding: 14 }}>
                  <p style={{ fontSize: 20, fontWeight: 800 }}>{v}</p>
                </div>
              ))}
            </div>
          </div>
          <a href="/pricing" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 28px", borderRadius: 99, background: "#E8380D", color: "#fff", textDecoration: "none", fontFamily: "Syne", fontWeight: 700, fontSize: 14 }}>
            🚀 Passer au Pro — 4 900 FCFA/mois
          </a>
        </div>
      </div>
    );
  }


  return (
    <div style={{ fontFamily: "DM Sans, sans-serif" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 22, color: "#1a1a1a", marginBottom: 4 }}>
            Réputation & Statistiques
          </h1>
          <p style={{ fontSize: 13, color: "#aaa" }}>Analysez vos performances et votre visibilité</p>
        </div>

        {/* Filtre période */}
        <div style={{ display: "flex", gap: 4, background: "#f7f4f2", padding: 4, borderRadius: 10 }}>
          {(["7j", "30j", "90j", "tout"] as Period[]).map((p) => (
            <button key={p} onClick={() => setPeriod(p)} style={{
              padding: "6px 14px", borderRadius: 8, border: "none",
              background: period === p ? "#fff" : "transparent",
              color: period === p ? "#1a1a1a" : "#aaa",
              fontWeight: period === p ? 700 : 400, fontSize: 13,
              cursor: "pointer", boxShadow: period === p ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
              transition: "all 0.15s",
            }}>
              {p === "tout" ? "Tout" : p}
            </button>
          ))}
        </div>
      </div>

      {/* Badge */}
      {badge && (
        <div style={{ display: "inline-flex", alignItems: "center", gap: 10, background: badge.bg, border: `1px solid ${badge.color}33`, borderRadius: 12, padding: "10px 18px", marginBottom: 20 }}>
          <span style={{ fontSize: 22 }}>{badge.icon}</span>
          <div>
            <p style={{ fontFamily: "Syne,sans-serif", fontWeight: 700, fontSize: 14, color: badge.color, margin: 0 }}>{badge.label}</p>
            <p style={{ fontSize: 11, color: badge.color, opacity: 0.7, margin: 0 }}>Badge obtenu sur Yitewo</p>
          </div>
        </div>
      )}

      {/* KPIs période */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px,1fr))", gap: 12, marginBottom: 24 }}>
        {[
          { icon: "🛒", label: "Commandes", value: filteredOrders.length, color: "#E8380D" },
          { icon: "✅", label: "Livrées", value: deliveredCount, color: "#10b981" },
          { icon: "⏳", label: "En attente", value: pendingCount, color: "#f59e0b" },
          { icon: "💰", label: "Revenus (k FCFA)", value: Math.round(totalRevenue / 1000), color: "#6366f1" },
          { icon: "📊", label: "Taux livraison", value: `${convRate}%`, color: "#0ea5e9" },
        ].map((s) => (
          <div key={s.label} style={{ background: "#fff", borderRadius: 12, border: "1px solid #f0ebe8", padding: "16px 14px" }}>
            <div style={{ fontSize: 20, marginBottom: 8 }}>{s.icon}</div>
            <p style={{ fontFamily: "Syne,sans-serif", fontWeight: 800, fontSize: 22, color: s.color, margin: "0 0 2px" }}>{s.value}</p>
            <p style={{ fontSize: 11, color: "#aaa", margin: 0 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Graphe commandes */}
      <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #f0ebe8", padding: "20px", marginBottom: 16 }}>
        <h2 style={{ fontFamily: "Syne,sans-serif", fontWeight: 700, fontSize: 15, color: "#1a1a1a", marginBottom: 16 }}>
          Commandes par jour
          <span style={{ fontSize: 11, fontWeight: 400, color: "#aaa", marginLeft: 8 }}>sur {period === "tout" ? "toute la période" : period}</span>
        </h2>
        <BarChart data={ordersChartData} color="#E8380D" />
      </div>

      {/* Graphe revenus */}
      <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #f0ebe8", padding: "20px", marginBottom: 16 }}>
        <h2 style={{ fontFamily: "Syne,sans-serif", fontWeight: 700, fontSize: 15, color: "#1a1a1a", marginBottom: 16 }}>
          Revenus livrés (en milliers FCFA)
          <span style={{ fontSize: 11, fontWeight: 400, color: "#aaa", marginLeft: 8 }}>sur {period === "tout" ? "toute la période" : period}</span>
        </h2>
        <LineChart data={revenueChartData} color="#10b981" />
      </div>

      {/* Social stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px,1fr))", gap: 12, marginBottom: 20 }}>
        {[
          { icon: "♥", label: "Abonnés", value: stats?.followers ?? 0, color: "#E8380D" },
          { icon: "⭐", label: "Note moyenne", value: stats?.avgRating ? `${stats.avgRating}/5` : "—", color: "#f59e0b" },
          { icon: "💬", label: "Avis reçus", value: stats?.reviewCount ?? 0, color: "#6d28d9" },
        ].map((s) => (
          <div key={s.label} style={{ background: "#fff", borderRadius: 14, border: "1px solid #f0ebe8", padding: "18px 16px" }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>{s.icon}</div>
            <p style={{ fontFamily: "Syne,sans-serif", fontWeight: 800, fontSize: 26, color: s.color, margin: "0 0 2px" }}>{s.value}</p>
            <p style={{ fontSize: 12, color: "#aaa", margin: 0 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Progression badges */}
      <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #f0ebe8", padding: "18px 20px", marginBottom: 20 }}>
        <h2 style={{ fontFamily: "Syne,sans-serif", fontWeight: 700, fontSize: 15, color: "#1a1a1a", marginBottom: 14 }}>
          Progression des badges
        </h2>
        {[
          { icon: "✅", label: "De confiance", condition: "3+ avis clients", current: stats?.reviewCount ?? 0, target: 3, color: "#10b981" },
          { icon: "🔥", label: "Populaire", condition: "20+ abonnés", current: stats?.followers ?? 0, target: 20, color: "#6d28d9" },
          { icon: "🏆", label: "Top vendeur", condition: "Note 4.5+ / 5+ avis", current: stats?.reviewCount ?? 0, target: 5, color: "#f59e0b" },
        ].map((b) => {
          const pct = Math.min(100, Math.round((b.current / b.target) * 100));
          const done = pct >= 100;
          return (
            <div key={b.label} style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 16 }}>{b.icon}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: done ? b.color : "#1a1a1a" }}>{b.label}</span>
                  <span style={{ fontSize: 11, color: "#aaa" }}>{b.condition}</span>
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: done ? b.color : "#aaa" }}>{done ? "✓ Obtenu" : `${b.current}/${b.target}`}</span>
              </div>
              <div style={{ height: 6, background: "#f0ebe8", borderRadius: 99, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${pct}%`, background: b.color, borderRadius: 99, transition: "width 0.6s ease" }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Avis clients */}
      {reviews.length > 0 && (
        <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #f0ebe8", padding: "18px 20px" }}>
          <h2 style={{ fontFamily: "Syne,sans-serif", fontWeight: 700, fontSize: 15, color: "#1a1a1a", marginBottom: 14 }}>
            Derniers avis ({reviews.length})
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {reviews.map((r) => (
              <div key={r.id} style={{ padding: "10px 12px", background: "#fafaf8", borderRadius: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{r.name || "Client anonyme"}</span>
                    <StarRating rating={r.rating} />
                  </div>
                  <span style={{ fontSize: 11, color: "#aaa" }}>{timeAgo(r.createdAt)}</span>
                </div>
                {r.comment && <p style={{ fontSize: 13, color: "#6b6b6b", lineHeight: 1.5, margin: 0 }}>"{r.comment}"</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
