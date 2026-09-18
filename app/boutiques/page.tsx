import { Suspense } from "react";
import BoutiquesClient from "./BoutiquesClient";

export const revalidate = 60;
const BASE = process.env.NEXT_PUBLIC_URL_PROD || "http://localhost:3003";

async function getJson(path: string) {
  try {
    const res = await fetch(`${BASE}${path}`, { next: { revalidate: 60 }, signal: AbortSignal.timeout(8000) });
    return res.ok ? res.json() : [];
  } catch { return []; }
}

async function getMapListings() {
  const [partners, businesses] = await Promise.all([
    getJson('/partners/public/map'),
    getJson('/businesses/map'),
  ]);

  // Adaptation non destructive : le composant existant continue de recevoir
  // des partenaires, avec quelques champs compatibles pour les fiches OSM.
  const importedBusinesses = (Array.isArray(businesses) ? businesses : []).map((b: any) => ({
    ...b,
    id: `business-${b.id}`,
    type: String(b.category || '').toLowerCase().includes('restaurant') ? 'Restaurant' : 'Marchand',
    slug: b.slug,
    lat: b.latitude,
    lng: b.longitude,
    zone: b.zone || undefined,
    profileImageUrl: b.imageUrl || undefined,
    categories: b.category ? [{ name: b.category }] : [],
    followers: 0,
    reviewCount: 0,
    avgRating: null,
    isBusinessListing: true,
    verificationStatus: b.status,
  }));

  return [...(Array.isArray(partners) ? partners : []), ...importedBusinesses];
}

export default async function BoutiquesPage() {
  const listings = await getMapListings();
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "var(--surface)", display: "flex", alignItems: "center", justifyContent: "center" }}><p style={{ color: "var(--muted)", fontFamily: "DM Sans, sans-serif" }}>Chargement de la carte…</p></div>}>
      <BoutiquesClient partners={listings} />
    </Suspense>
  );
}
