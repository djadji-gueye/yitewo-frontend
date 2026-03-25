import { notFound } from "next/navigation";
import InterestButton from "@/components/InterestButton";

const CATEGORY_META: Record<string, { label: string; icon: string; color: string; bg: string }> = {
  IMMOBILIER: { label: "Immobilier",  icon: "🏠", color: "#b45309", bg: "#fef3c7" },
  EMPLOI:     { label: "Emploi",      icon: "💼", color: "#1d4ed8", bg: "#dbeafe" },
  SERVICE:    { label: "Service",     icon: "🔧", color: "#6d28d9", bg: "#ede9fe" },
  COMMERCE:   { label: "Commerce",    icon: "🛒", color: "#047857", bg: "#d1fae5" },
  FORMATION:  { label: "Formation",   icon: "📚", color: "#be185d", bg: "#fce7f3" },
};

function daysSince(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "Aujourd'hui";
  if (days === 1) return "Hier";
  return `Il y a ${days} jours`;
}

async function getOpportunity(slug: string) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_URL_PROD}/opportunities/slug/${slug}`,
      { cache: "no-store" }
    );
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function OpportunityDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const opp = await getOpportunity(slug);
  if (!opp) return notFound();

  const meta = CATEGORY_META[opp.category] || CATEGORY_META.IMMOBILIER;

  return (
    <div style={{ background: "var(--surface)", minHeight: "100vh" }}>
      {/* Hero */}
      <div style={{ position: "relative" }}>
        {opp.imageUrl ? (
          <div style={{ height: 280, overflow: "hidden" }}>
            <img src={opp.imageUrl} alt={opp.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)" }} />
          </div>
        ) : (
          <div style={{ height: 160, background: meta.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 64 }}>
            {meta.icon}
          </div>
        )}
        <a href="/opportunities" style={{ position: "absolute", top: 20, left: 20, display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.9)", backdropFilter: "blur(8px)", padding: "8px 14px", borderRadius: 99, textDecoration: "none", color: "var(--text)", fontSize: 13, fontWeight: 600 }}>
          ← Retour
        </a>
      </div>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "32px 20px 80px" }}>
        {/* Badges */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 99, background: meta.bg, color: meta.color }}>
            {meta.icon} {meta.label}
          </span>
          {opp.badge && (
            <span style={{ fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 99, background: opp.badge === "Urgent" ? "#fee2e2" : "#d1fae5", color: opp.badge === "Urgent" ? "#b91c1c" : "#065f46" }}>
              {opp.badge === "Urgent" ? "🔴" : "🟢"} {opp.badge}
            </span>
          )}
          {opp._count?.interests > 0 && (
            <span style={{ fontSize: 12, fontWeight: 600, padding: "4px 12px", borderRadius: 99, background: "#f0f0ff", color: "#4f46e5" }}>
              👥 {opp._count.interests} personne{opp._count.interests > 1 ? "s" : ""} intéressée{opp._count.interests > 1 ? "s" : ""}
            </span>
          )}
        </div>

        <h1 style={{ fontFamily: "Syne", fontWeight: 800, fontSize: "clamp(22px, 3vw, 32px)", marginBottom: 8, lineHeight: 1.25 }}>
          {opp.title}
        </h1>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 24, color: "var(--muted)", fontSize: 13 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
            {opp.location}
          </span>
          <span>🕐 {daysSince(opp.createdAt)}</span>
          {opp.price && <span style={{ color: "var(--brand)", fontWeight: 700 }}>💰 {opp.price}</span>}
        </div>

        {/* Description */}
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid var(--border)", padding: "24px", marginBottom: 16 }}>
          <h2 style={{ fontFamily: "Syne", fontWeight: 700, fontSize: 16, marginBottom: 12 }}>Description</h2>
          <p style={{ fontSize: 14, lineHeight: 1.7, color: "#333" }}>{opp.description}</p>
        </div>

        {/* Details */}
        {opp.details && opp.details.length > 0 && (
          <div style={{ background: "#fff", borderRadius: 16, border: "1px solid var(--border)", padding: "24px", marginBottom: 24 }}>
            <h2 style={{ fontFamily: "Syne", fontWeight: 700, fontSize: 16, marginBottom: 14 }}>Détails</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {opp.details.map((d: string) => (
                <div key={d} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14 }}>
                  <span style={{ width: 24, height: 24, borderRadius: "50%", background: meta.bg, color: meta.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>✓</span>
                  {d}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Interest CTA */}
        <InterestButton opportunity={{ id: opp.id, title: opp.title, contact: opp.contact, category: opp.category }} />
      </div>
    </div>
  );
}
