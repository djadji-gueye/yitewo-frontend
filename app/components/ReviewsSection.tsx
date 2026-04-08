"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const ReviewModal = dynamic(() => import("./ReviewModal"), { ssr: false });
const BASE = process.env.NEXT_PUBLIC_URL_PROD || "http://localhost:3003";

interface Review {
  id: string;
  rating: number;
  comment?: string;
  name?: string;
  createdAt: string;
}

function StarRating({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <span style={{ display: "inline-flex", gap: 1 }}>
      {[1,2,3,4,5].map((i) => (
        <span key={i} style={{ fontSize: size, color: i <= Math.round(rating) ? "#f59e0b" : "#e5e7eb" }}>★</span>
      ))}
    </span>
  );
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Aujourd'hui";
  if (days === 1) return "Hier";
  if (days < 30) return `Il y a ${days} j`;
  return new Date(iso).toLocaleDateString("fr-FR", { month: "short", year: "numeric" });
}

interface Props {
  slug: string;
  partnerName: string;
}

export default function ReviewsSection({ slug, partnerName }: Props) {
  const [data, setData]           = useState<{ reviews: Review[]; avgRating: number; total: number } | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading]     = useState(true);

  const load = () => {
    fetch(`${BASE}/social/reviews/${slug}?limit=5`)
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [slug]);

  if (loading) return null;

  return (
    <div style={{
      background: "#fff", borderRadius: 16, border: "1px solid var(--border)",
      padding: "20px 24px", marginTop: 24,
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div>
          <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 16, color: "var(--text)", marginBottom: 4 }}>
            Avis clients
          </h2>
          {data && data.total > 0 ? (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <StarRating rating={data.avgRating} size={16} />
              <span style={{ fontWeight: 800, fontSize: 18, color: "var(--text)" }}>{data.avgRating}</span>
              <span style={{ fontSize: 13, color: "var(--muted)" }}>({data.total} avis)</span>
            </div>
          ) : (
            <p style={{ fontSize: 13, color: "var(--muted)" }}>Aucun avis pour l'instant</p>
          )}
        </div>
        <button
          onClick={() => setShowModal(true)}
          style={{
            padding: "8px 16px", borderRadius: 99, border: "1.5px solid #E8380D",
            background: "#fff5f3", color: "#E8380D",
            fontSize: 13, fontWeight: 700, cursor: "pointer",
          }}
        >
          ⭐ Laisser un avis
        </button>
      </div>

      {/* Reviews list */}
      {data && data.reviews.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {data.reviews.map((r) => (
            <div key={r.id} style={{
              padding: "12px 14px", background: "var(--surface)", borderRadius: 10,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: "50%",
                    background: "linear-gradient(135deg, #E8380D, #ff6b35)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 11, fontWeight: 800, color: "#fff", flexShrink: 0,
                  }}>
                    {r.name?.[0]?.toUpperCase() || "?"}
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>
                      {r.name || "Client anonyme"}
                    </p>
                    <StarRating rating={r.rating} size={11} />
                  </div>
                </div>
                <span style={{ fontSize: 11, color: "var(--muted)" }}>{timeAgo(r.createdAt)}</span>
              </div>
              {r.comment && (
                <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.5, marginTop: 6, paddingLeft: 36 }}>
                  "{r.comment}"
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <ReviewModal
          partnerSlug={slug}
          partnerName={partnerName}
          onClose={() => { setShowModal(false); load(); }}
        />
      )}
    </div>
  );
}
