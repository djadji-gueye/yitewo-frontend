import { Suspense } from "react";
import { Metadata } from "next";
import PartnersShop from "@/components/PartnersShop";
import ShopPagination from "./ShopPagination";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Boutiques & Restaurants au Sénégal | Yitewo",
  description: "Trouvez et commandez auprès des boutiques, épiceries et restaurants de votre quartier. Livraison ou retrait à Dakar, Thiès, Saint-Louis et partout au Sénégal.",
  alternates: { canonical: "https://yitewo.com/shop" },
  openGraph: {
    title: "Boutiques & Restaurants — Yitewo",
    description: "Commandez auprès des marchands et restaurants de votre quartier.",
    url: "https://yitewo.com/shop",
    type: "website",
  },
};

const BASE = process.env.NEXT_PUBLIC_URL_PROD || "http://localhost:3003";
const PAGE_SIZE = 24;

async function getPartners() {
  try {
    const res = await fetch(`${BASE}/partners/public/shop`, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export default async function ShopPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const params = await searchParams;
  const allPartners = await getPartners();
  const parsedPage = Number.parseInt(params?.page || "1", 10);
  const totalPages = Math.max(1, Math.ceil(allPartners.length / PAGE_SIZE));
  const page = Number.isFinite(parsedPage) ? Math.min(Math.max(parsedPage, 1), totalPages) : 1;
  const partners = allPartners.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "var(--surface)", display: "flex", alignItems: "center", justifyContent: "center" }}><p style={{ color: "var(--muted)", fontFamily: "DM Sans, sans-serif" }}>Chargement…</p></div>}>
      <PartnersShop partners={partners} />
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 16px 64px" }}>
        <ShopPagination page={page} totalPages={totalPages} />
      </div>
    </Suspense>
  );
}
