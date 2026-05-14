"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

const BASE = process.env.NEXT_PUBLIC_URL_PROD || "http://localhost:3003";

function Stars({ rating }: { rating: number }) {
  return (
    <span>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} style={{ color: i <= Math.round(rating) ? "#f59e0b" : "#e5e7eb", fontSize: 14 }}>★</span>
      ))}
    </span>
  );
}

export default function ReputationPage() {
  const params = useParams();
  const token = params?.token as string;

  const [reviews, setReviews] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [slug, setSlug] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    fetch(`${BASE}/partners/portal/${token}`)
      .then((r) => r.json())
      .then((data) => {
        setSlug(data.slug || "");
        return Promise.all([
          fetch(`${BASE}/reviews?slug=${data.slug}`).then((r) => r.json()).catch(() => []),
          fetch(`${BASE}/social/stats/${data.slug}`).then((r) => r.json()).catch(() => null),
        ]);
      })
      .then(([r, s]) => {
        setReviews(Array.isArray(r) ? r : []);
        setStats(s);
      })
      .finally(() => setLoading(false));
  }, [token]);

  const avg = stats?.avgRating ?? (reviews.length > 0 ? reviews.reduce((a: number, r: any) => a + (r.rating || 0), 0) / reviews.length : 0);
  const count = stats?.reviewCount ?? reviews.length;

  // Distribution par étoile
  const dist = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => Math.round(r.rating) === star).length,
    pct: reviews.length > 0 ? (reviews.filter((r) => Math.round(r.rating) === star).length / reviews.length) * 100 : 0,
  }));

  if (loading) return <div style={{ textAlign: "center", padding: 60, color: "#aaa" }}>Chargement…</div>;

  return (
    <div style={{ maxWidth: 680, fontFamily: "DM Sans, sans-serif" }}>
      <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 22, color: "#1a1a1a", marginBottom: 6 }}>Ma réputation</h1>
      <p style={{ fontSize: 13, color: "#aaa", marginBottom: 24 }}>Les avis laissés par vos clients sur votre profil.</p>

      {/* Score global */}
      <div style={{ background: "#fff", borderRadius: 18, border: "1px solid #f0ebe8", padding: "24px", marginBottom: 20, display: "flex", gap: 28, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontFamily: "Syne", fontWeight: 800, fontSize: 52, color: "#1a1a1a", lineHeight: 1 }}>{avg > 0 ? avg.toFixed(1) : "—"}</p>
          <Stars rating={avg} />
          <p style={{ fontSize: 12, color: "#aaa", marginTop: 6 }}>{count} avis</p>
        </div>

        <div style={{ flex: 1, minWidth: 180 }}>
          {dist.map(({ star, count: c, pct }) => (
            <div key={star} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 11, color: "#6b6b6b", minWidth: 16 }}>{star}</span>
              <span style={{ color: "#f59e0b", fontSize: 12 }}>★</span>
              <div style={{ flex: 1, height: 6, borderRadius: 99, background: "#f0ebe8", overflow: "hidden" }}>
                <div style={{ width: `${pct}%`, height: "100%", background: "#E8380D", borderRadius: 99, transition: "width 0.5s" }} />
              </div>
              <span style={{ fontSize: 11, color: "#aaa", minWidth: 18, textAlign: "right" }}>{c}</span>
            </div>
          ))}
        </div>

        {/* Followers */}
        {stats && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingLeft: 16, borderLeft: "1px solid #f0ebe8" }}>
            <div style={{ textAlign: "center" }}>
              <p style={{ fontFamily: "Syne", fontWeight: 800, fontSize: 22, color: "#1a1a1a" }}>{stats.followersCount ?? 0}</p>
              <p style={{ fontSize: 11, color: "#6b6b6b" }}>Abonnés</p>
            </div>
            <div style={{ textAlign: "center" }}>
              <p style={{ fontFamily: "Syne", fontWeight: 800, fontSize: 22, color: "#1a1a1a" }}>{stats.viewCount ?? 0}</p>
              <p style={{ fontSize: 11, color: "#6b6b6b" }}>Vues profil</p>
            </div>
          </div>
        )}
      </div>

      {/* Liste des avis */}
      {reviews.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", background: "#fff", borderRadius: 18, border: "1px solid #f0ebe8" }}>
          <div style={{ fontSize: 44, marginBottom: 12 }}>⭐</div>
          <p style={{ fontFamily: "Syne", fontWeight: 700, fontSize: 16, color: "#1a1a1a", marginBottom: 8 }}>Pas encore d'avis</p>
          <p style={{ fontSize: 13, color: "#aaa", lineHeight: 1.6, maxWidth: 320, margin: "0 auto" }}>
            Vos premiers clients peuvent laisser un avis depuis votre profil public. Partagez votre lien !
          </p>
          {slug && (
            <button onClick={() => navigator.clipboard?.writeText(`${window.location.origin}/services/${slug}`)}
              style={{ marginTop: 20, padding: "10px 22px", borderRadius: 99, border: "1px solid #fdd0c5", background: "#fff5f3", color: "#E8380D", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
              📋 Copier mon lien profil
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {reviews.map((r) => (
            <div key={r.id} style={{ background: "#fff", borderRadius: 16, border: "1px solid #f0ebe8", padding: "16px 20px" }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 8 }}>
                <div>
                  <p style={{ fontWeight: 700, fontSize: 14, color: "#1a1a1a", marginBottom: 3 }}>{r.authorName || "Client anonyme"}</p>
                  <Stars rating={r.rating} />
                </div>
                <span style={{ fontSize: 11, color: "#aaa", flexShrink: 0 }}>
                  {r.createdAt ? new Date(r.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long" }) : ""}
                </span>
              </div>
              {r.comment && (
                <p style={{ fontSize: 13, color: "#555", lineHeight: 1.6, fontStyle: "italic" }}>"{r.comment}"</p>
              )}
              {/* Réponse prestataire */}
              {r.reply ? (
                <div style={{ marginTop: 10, padding: "10px 12px", background: "#fff5f3", borderRadius: 10, borderLeft: "3px solid #E8380D" }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: "#E8380D", marginBottom: 4 }}>VOTRE RÉPONSE</p>
                  <p style={{ fontSize: 12, color: "#555", lineHeight: 1.6 }}>{r.reply}</p>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
