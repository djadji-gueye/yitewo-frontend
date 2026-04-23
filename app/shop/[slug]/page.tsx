import { Suspense } from "react";
import ShopClient from "@/components/ShopClient";
import { Metadata } from "next";

export const revalidate = 3600;

const BASE = process.env.NEXT_PUBLIC_URL_PROD || "http://localhost:3003";

export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string }>;
}): Promise<Metadata> {
    const { slug } = await params;

    try {
        const res = await fetch(`${BASE}/partners/by-slug/${slug}`);
        if (!res.ok) return { title: "Boutique Yitewo" };
        const partner = await res.json();

        return {
            title: `${partner.name} — Commander en ligne`,
            description: `Commandez directement auprès de ${partner.name} à ${partner.zone || partner.city}, Sénégal. Livraison rapide via Yitewo.`,
            openGraph: {
                title: `${partner.name} sur Yitewo`,
                description: `Découvrez ${partner.name} à ${partner.zone || partner.city} et commandez en ligne.`,
                images: partner.profileImageUrl ? [{ url: partner.profileImageUrl }] : [],
                type: "website",
                locale: "fr_SN",
                siteName: "Yitewo",
            },
            alternates: {
                canonical: `https://yitewo.com/boutique/${slug}`,
            },
        };
    } catch {
        return { title: "Boutique Yitewo" };
    }
}

async function getPartnerData(slug: string) {
    try {
        const res = await fetch(`${BASE}/partners/${slug}`, {
            next: { revalidate: 60 },
        });
        if (!res.ok) return null;
        const data = await res.json();
        return { ...data, slug };
    } catch {
        return null;
    }
}

function ShopSkeleton() {
    return (
        <div style={{ background: "var(--surface)", minHeight: "100vh" }}>
            <div style={{
                background: "linear-gradient(135deg, #1a0500 0%, #3a0c00 50%, #E8380D 100%)",
                padding: "40px 20px 56px",
            }}>
                <div style={{ maxWidth: 800, margin: "0 auto" }}>
                    <div style={{ width: 220, height: 22, borderRadius: 99, background: "rgba(255,255,255,0.12)", marginBottom: 16 }} />
                    <div style={{ width: 380, height: 44, borderRadius: 10, background: "rgba(255,255,255,0.1)", marginBottom: 12 }} />
                    <div style={{ width: 280, height: 20, borderRadius: 8, background: "rgba(255,255,255,0.08)", marginBottom: 28 }} />
                    <div style={{ width: "100%", maxWidth: 480, height: 48, borderRadius: 14, background: "rgba(255,255,255,0.12)" }} />
                </div>
            </div>
        </div>
    );
}

async function PartnerContent({ slug }: { slug: string }) {
    const partner = await getPartnerData(slug);
    return <ShopClient phone={partner?.contact} partner={partner} />;
}

export default async function BoutiqueSlugPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;

    return (
        <Suspense fallback={<ShopSkeleton />}>
            <PartnerContent slug={slug} />
        </Suspense>
    );
}