import { Suspense } from "react";
import BoutiquesClient from "./BoutiquesClient";

export const revalidate = 60;
const BASE = process.env.NEXT_PUBLIC_URL_PROD || "http://localhost:3003";

async function getJson(path: string) {
  try {
    const res = await fetch(`${BASE}${path}`, { next: { revalidate: 60 }, signal: AbortSignal.timeout(8000) });
    return res.ok ? res.json() : [];
  } catch {
    return [];
  }
}

export default async function BoutiquesPage() {
  const [partners, businesses] = await Promise.all([
    getJson("/partners/public/map"),
    getJson("/businesses/map"),
  ]);

  const imported = (Array.isArray(businesses) ? businesses : []).map((business: any) => ({
    ...business,
    id: `business-${business.id}`,
    type: String(business.category || "").toLowerCase().includes("restaurant") ? "Restaurant" : "Marchand",
    lat: business.latitude,
    lng: business.longitude,
    zone: business.zone,
    address: business.address,
    profileImageUrl: business.imageUrl || undefined,
    categories: business.category ? [{ name: business.category }] : [],
    followers: 0,
    reviewCount: 0,
    avgRating: null,
    isBusinessListing: true,
  }));

  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "var(--surface)", display: "flex", alignItems: "center", justifyContent: "center" }}><p style={{ color: "var(--muted)", fontFamily: "DM Sans, sans-serif" }}>Chargement de la carte…</p></div>}>
      <BoutiquesClient partners={[...(Array.isArray(partners) ? partners : []), ...imported]} />
    </Suspense>
  );
}
