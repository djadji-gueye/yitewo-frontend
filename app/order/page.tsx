import PartnersShop from "@/components/PartnersShop";
import ShopClient from "@/components/ShopClient";

export const dynamic = "force-dynamic";

const BASE = process.env.NEXT_PUBLIC_URL_PROD || "http://localhost:3003";

async function getPartners() {
  try {
    const res = await fetch(`${BASE}/partners/public/shop`, { cache: "no-store" });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

async function getPartnerData(slug: string) {
  try {
    const res = await fetch(`${BASE}/partners/${slug}`, { cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();
    return { ...data, slug };
  } catch {
    return null;
  }
}

export default async function OrderPage({
  searchParams,
}: {
  searchParams?: { partner?: string };
}) {
  const params = await searchParams;
  const partnerSlug = params?.partner;

  if (partnerSlug) {
    const partner = await getPartnerData(partnerSlug);
    return <ShopClient phone={partner?.contact} partner={partner} />;
  }

  const partners = await getPartners();
  return <PartnersShop partners={partners} />;
}
