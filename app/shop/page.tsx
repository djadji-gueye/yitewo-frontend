import { Suspense } from "react";
import { Metadata } from "next";
import PartnersShop from "@/components/PartnersShop";

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

async function getPartners() {
    try {
        const res = await fetch(`${BASE}/partners/public/shop`, {
            next: { revalidate: 3600 },
            signal: AbortSignal.timeout(8000),
        });
        if (!res.ok) return [];
        return res.json();
    } catch { return []; }
}

export default async function ShopPage() {
    const partners = await getPartners();
    return (
        <Suspense fallback={
            <div style={{ minHeight: "100vh", background: "var(--surface)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <p style={{ color: "var(--muted)", fontFamily: "DM Sans, sans-serif" }}>Chargement…</p>
            </div>
        }>
            <PartnersShop partners={partners} />
        </Suspense>
    );
}