import { Suspense } from "react";
import PartnersShop from "@/components/PartnersShop";
import ShopClient from "@/components/ShopClient";
import { Metadata } from "next";

// Cache 60 secondes — la liste des boutiques ne change pas à chaque seconde
export const revalidate = 60;

const BASE = process.env.NEXT_PUBLIC_URL_PROD || "http://localhost:3003";

export async function generateMetadata({ searchParams }: { searchParams: { partner?: string } }): Promise<Metadata> {
  // const slug = searchParams?.partner;
  const params = await searchParams;
  const slug = params?.partner;
  if (!slug) return { title: "Commander" };

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_URL_PROD}/partners/by-slug/${slug}`);
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
        canonical: `https://yitewo.com/order?partner=${slug}`,
      },
    };
  } catch {
    return { title: "Boutique Yitewo" };
  }
}

async function getPartners() {
  try {
    const res = await fetch(`${BASE}/partners/public/shop`, {
      next: { revalidate: 60 },   // ISR : re-fetch en background toutes les 60s
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
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

// ── Skeleton de chargement ────────────────────────────────────────
function ShopSkeleton() {
  return (
    <div style={{ background: "var(--surface)", minHeight: "100vh" }}>
      {/* Hero skeleton */}
      <div style={{
        background: "linear-gradient(135deg, #1a0500 0%, #3a0c00 50%, #E8380D 100%)",
        padding: "40px 20px 56px",
      }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <div style={{ width: 220, height: 22, borderRadius: 99, background: "rgba(255,255,255,0.12)", marginBottom: 16 }} />
          <div style={{ width: 380, height: 44, borderRadius: 10, background: "rgba(255,255,255,0.1)", marginBottom: 12 }} />
          <div style={{ width: 280, height: 20, borderRadius: 8, background: "rgba(255,255,255,0.08)", marginBottom: 28 }} />
          {/* Search bar skeleton */}
          <div style={{ width: "100%", maxWidth: 480, height: 48, borderRadius: 14, background: "rgba(255,255,255,0.12)" }} />
        </div>
      </div>
      {/* Filter bar skeleton */}
      <div style={{ background: "#fff", padding: "12px 20px", borderBottom: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", display: "flex", gap: 8 }}>
          {[80, 110, 120, 90, 100].map((w, i) => (
            <div key={i} style={{ width: w, height: 32, borderRadius: 99, background: "#f0f0f0" }} />
          ))}
        </div>
      </div>
      {/* Cards grid skeleton */}
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "24px 16px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px,1fr))", gap: 16 }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} style={{
              borderRadius: 18, border: "1px solid var(--border)",
              overflow: "hidden", background: "#fff",
              animation: "pulse 1.5s ease-in-out infinite",
              animationDelay: `${i * 0.1}s`,
            }}>
              <div style={{ height: 120, background: "#f0f0f0" }} />
              <div style={{ padding: "30px 14px 16px" }}>
                <div style={{ width: "70%", height: 16, borderRadius: 6, background: "#f0f0f0", marginBottom: 10 }} />
                <div style={{ width: "50%", height: 13, borderRadius: 6, background: "#f5f5f5", marginBottom: 18 }} />
                <div style={{ width: "100%", height: 36, borderRadius: 10, background: "#f0f0f0" }} />
              </div>
            </div>
          ))}
        </div>
      </div>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}

// ── Composant async qui charge les données ───────────────────────
async function ShopContent() {
  const partners = await getPartners();
  return <PartnersShop partners={partners} />;
}

async function PartnerContent({ slug }: { slug: string }) {
  const partner = await getPartnerData(slug);
  return <ShopClient phone={partner?.contact} partner={partner} />;
}

// ── Page principale ───────────────────────────────────────────────
export default async function OrderPage({
  searchParams,
}: {
  searchParams?: { partner?: string };
}) {
  const params = await searchParams;
  const partnerSlug = params?.partner;

  if (partnerSlug) {
    return (
      <Suspense fallback={<ShopSkeleton />}>
        <PartnerContent slug={partnerSlug} />
      </Suspense>
    );
  }

  return (
    <Suspense fallback={<ShopSkeleton />}>
      <ShopContent />
    </Suspense>
  );
}
