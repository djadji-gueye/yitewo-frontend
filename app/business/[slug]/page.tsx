import { Suspense } from "react";
import { Metadata } from "next";

export const revalidate = 3600;
const BASE = process.env.NEXT_PUBLIC_URL_PROD || "http://localhost:3003";

async function getJson(path: string) {
  try {
    const res = await fetch(`${BASE}${path}`, { next: { revalidate: 60 } });
    return res.ok ? res.json() : null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const business = await getJson(`/businesses/slug/${encodeURIComponent(slug)}`);
  return business
    ? {
        title: `${business.name} — Commerce référencé sur Yitewo`,
        description: `${business.name} à ${business.city}. Fiche référencée sur Yitewo.`,
      }
    : { title: "Commerce Yitewo" };
}

export default async function BusinessListingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const business = await getJson(`/businesses/slug/${encodeURIComponent(slug)}`);

  if (!business) {
    return <main style={{ padding: 40 }}>Commerce introuvable.</main>;
  }

  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", padding: 40 }}>Chargement…</div>}>
      <main style={{ minHeight: "100vh", background: "var(--surface)", padding: "48px 20px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto", background: "#fff", borderRadius: 20, padding: 28, border: "1px solid var(--border)" }}>
          <span
            style={{
              display: "inline-block",
              padding: "5px 10px",
              borderRadius: 99,
              background: business.status === "VERIFIED" ? "#d1fae5" : "#fff7ed",
              color: business.status === "VERIFIED" ? "#047857" : "#c2410c",
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            {business.status === "VERIFIED" ? "✓ Commerce vérifié" : "Commerce référencé · non vérifié"}
          </span>

          <h1 style={{ fontFamily: "Syne, sans-serif", fontSize: 32, margin: "18px 0 8px" }}>{business.name}</h1>
          <p style={{ color: "var(--muted)", marginBottom: 20 }}>
            📍 {business.address || business.zone || business.city}
          </p>

          {business.category && <p style={{ marginBottom: 12 }}>🏷️ {business.category}</p>}
          {business.phone && <p style={{ marginBottom: 8 }}>☎️ {business.phone}</p>}
          {business.website && (
            <p style={{ marginBottom: 20 }}>
              <a href={business.website} target="_blank" rel="noreferrer">Voir le site web</a>
            </p>
          )}

          <p style={{ color: "var(--muted)", lineHeight: 1.6, marginBottom: 24 }}>
            Cette fiche est référencée sur Yitewo à partir de données OpenStreetMap. Le propriétaire peut demander sa validation.
          </p>

          <a
            href={business.website || `https://www.google.com/search?q=${encodeURIComponent(business.name + ' ' + business.city)}`}
            target="_blank"
            rel="noreferrer"
            style={{
              display: "inline-block",
              borderRadius: 10,
              padding: "12px 18px",
              background: "var(--brand)",
              color: "#fff",
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            Revendiquer cette fiche
          </a>
        </div>
      </main>
    </Suspense>
  );
}
