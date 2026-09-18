import { Suspense } from "react";
import { Metadata } from "next";
import ShopClient from "@/components/ShopClient";
import BusinessListingClient from "./BusinessListingClient";

export const revalidate = 3600;
const BASE = process.env.NEXT_PUBLIC_URL_PROD || "http://localhost:3003";

async function getJson(path: string) {
  try { const res = await fetch(`${BASE}${path}`, { next: { revalidate: 60 } }); return res.ok ? res.json() : null; } catch { return null; }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const partner = await getJson(`/partners/${encodeURIComponent(slug)}`);
  if (partner) return { title: `${partner.name} — Yitewo` };
  const business = await getJson(`/businesses/slug/${encodeURIComponent(slug)}`);
  return business ? { title: `${business.name} — Commerce référencé sur Yitewo`, description: `${business.name} à ${business.city}. Fiche référencée sur Yitewo.` } : { title: "Commerce Yitewo" };
}

async function Content({ slug }: { slug: string }) {
  const partner = await getJson(`/partners/${encodeURIComponent(slug)}`);
  if (partner) return <ShopClient phone={partner.contact} partner={{ ...partner, slug }} />;
  const business = await getJson(`/businesses/slug/${encodeURIComponent(slug)}`);
  if (!business) return <main style={{ padding: 40 }}>Commerce introuvable.</main>;
  return <BusinessListingClient business={business} />;
}

export default async function ShopSlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <Suspense fallback={<div style={{ minHeight: "100vh", padding: 40 }}>Chargement…</div>}><Content slug={slug} /></Suspense>;
}
