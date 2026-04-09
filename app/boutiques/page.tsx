import { Suspense } from "react";
import BoutiquesClient from "./BoutiquesClient";

export const revalidate = 60;

const BASE = process.env.NEXT_PUBLIC_URL_PROD || "http://localhost:3003";

async function getMapPartners() {
  try {
    const res = await fetch(`${BASE}/partners/public/map`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    return res.json();
  } catch { return []; }
}

export default async function BoutiquesPage() {
  const partners = await getMapPartners();
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", background: "var(--surface)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "var(--muted)", fontFamily: "DM Sans, sans-serif" }}>Chargement de la carte…</p>
      </div>
    }>
      <BoutiquesClient partners={partners} />
    </Suspense>
  );
}
