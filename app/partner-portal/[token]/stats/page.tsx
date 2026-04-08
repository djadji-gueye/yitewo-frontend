"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

const BASE = process.env.NEXT_PUBLIC_URL_PROD || "http://localhost:3003";

function StarRating({ rating }: { rating: number }) {
  return (
    <span>
      {[1,2,3,4,5].map((i) => (
        <span key={i} style={{ fontSize: 14, color: i <= Math.round(rating) ? "#f59e0b" : "#e5e7eb" }}>★</span>
      ))}
    </span>
  );
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Aujourd'hui";
  if (days === 1) return "Hier";
  return `Il y a ${days} j`;
}

export default function PartnerStatsPage() {
  const params = useParams();
  const token  = params?.token as string;

  const [partner, setPartner] = useState<any>(null);
  const [stats, setStats]     = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
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
        ]);
      })
      .then(([s, r]) => {
        setStats(s);
        setReviews(r?.reviews || []);
      })
      .finally(() => setLoading(false));
  }, [token]);

  const BADGE_META: Record<string, { label: string; color: string; bg: string; icon: string }> = {
    top:     { label: "Top vendeur",  color: "#92400e", bg: "#fef3c7", icon: "🏆" },
    popular: { label: "Populaire",    color: "#6d28d9", bg: "#ede9fe", icon: "🔥" },
    trusted: { label: "De confiance", color: "#065f46", bg: "#d1fae5", icon: "✅" },
  };

  if (loading) return <div style={{ padding: 60, textAlign: "center", color: "#aaa" }}>Chargement…</div>;

  const badge = stats?.badge ? BADGE_META[stats.badge] : null;

  return (
    <div style={{ fontFamily: "DM Sans, sans-serif" }}>
      <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 22, color: "#1a1a1a", marginBottom: 6 }}>
        Réputation & Statistiques
      </h1>
      <p style={{ fontSize: 13, color: "#aaa", marginBottom: 28 }}>
        Votre visibilité sur Yitewo — abonnés, notes et avis clients.
      </p>

      {/* Badge */}
      {badge && (
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: badge.bg, border: `1px solid ${badge.color}33`,
          borderRadius: 12, padding: "10px 18px", marginBottom: 24,
        }}>
          <span style={{ fontSize: 22 }}>{badge.icon}</span>
          <div>
            <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 14, color: badge.color }}>{badge.label}</p>
            <p style={{ fontSize: 12, color: badge.color, opacity: 0.8 }}>Badge obtenu sur Yitewo</p>
          </div>
        </div>
      )}

      {/* Stats cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 14, marginBottom: 28 }}>
        {[
          { icon: "♥", label: "Abonnés", value: stats?.followers ?? 0, color: "#E8380D" },
          { icon: "⭐", label: "Note moyenne", value: stats?.avgRating ? `${stats.avgRating}/5` : "—", color: "#f59e0b" },
          { icon: "💬", label: "Avis reçus", value: stats?.reviewCount ?? 0, color: "#6d28d9" },
        ].map((s) => (
          <div key={s.label} style={{ background: "#fff", borderRadius: 14, border: "1px solid #f0ebe8", padding: "18px 16px" }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>{s.icon}</div>
            <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 26, color: s.color, marginBottom: 4 }}>
              {s.value}
            </p>
            <p style={{ fontSize: 12, color: "#aaa" }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Badge conditions */}
      <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #f0ebe8", padding: "18px 20px", marginBottom: 24 }}>
        <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 15, color: "#1a1a1a", marginBottom: 14 }}>
          Comment obtenir un badge ?
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            { badge: "trusted", condition: "3+ avis clients",             icon: "✅", done: (stats?.reviewCount || 0) >= 3 },
            { badge: "popular", condition: "20+ abonnés",                 icon: "🔥", done: (stats?.followers || 0) >= 20 },
            { badge: "top",     condition: "Note 4.5+ avec 5+ avis",      icon: "🏆", done: (stats?.avgRating || 0) >= 4.5 && (stats?.reviewCount || 0) >= 5 },
          ].map((b) => (
            <div key={b.badge} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 12px", background: b.done ? "#f0fdf4" : "#fafaf8", borderRadius: 10 }}>
              <span style={{ fontSize: 20 }}>{b.icon}</span>
              <p style={{ fontSize: 13, flex: 1, color: b.done ? "#065f46" : "#6b6b6b" }}>{b.condition}</p>
              <span style={{ fontSize: 12, fontWeight: 700, color: b.done ? "#10b981" : "#aaa" }}>
                {b.done ? "✓ Obtenu" : "En cours"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Reviews list */}
      {reviews.length > 0 && (
        <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #f0ebe8", padding: "18px 20px" }}>
          <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 15, color: "#1a1a1a", marginBottom: 14 }}>
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
                {r.comment && <p style={{ fontSize: 13, color: "#6b6b6b", lineHeight: 1.5 }}>"{r.comment}"</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
