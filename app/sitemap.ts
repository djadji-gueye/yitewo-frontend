
import { MetadataRoute } from "next";

const BASE = "https://yitewo.com";
const API = process.env.NEXT_PUBLIC_URL_PROD || "http://localhost:3003";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Pages statiques
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${BASE}/boutiques`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE}/services`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE}/opportunities`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE}/opportunities/poster`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE}/partners`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/faq`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/cgu`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE}/privacy`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
  ];

  // Pages dynamiques — partenaires
  let partnerPages: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch(`${API}/partners/public/active`, { next: { revalidate: 3600 } });
    if (res.ok) {
      const partners: { slug: string; updatedAt?: string }[] = await res.json();
      partnerPages = partners.map((p) => ({
        url: `${BASE}/order?partner=${p.slug}`,
        lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.7,
      }));
    }
  } catch { /* silencieux si API indisponible */ }

  // Pages dynamiques — opportunités
  let opportunityPages: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch(`${API}/opportunities?limit=200`, { next: { revalidate: 3600 } });
    if (res.ok) {
      const data: any = await res.json();
      const opps: { slug?: string; id: string; updatedAt?: string }[] =
        Array.isArray(data) ? data : data?.data ?? [];
      opportunityPages = opps.map((o) => ({
        url: `${BASE}/opportunities/${o.slug || o.id}`,
        lastModified: o.updatedAt ? new Date(o.updatedAt) : new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.6,
      }));
    }
  } catch { /* silencieux */ }

  return [...staticPages, ...partnerPages, ...opportunityPages];
}