// app/order/page.tsx
// Redirection 301 permanente vers /shop et /shop/[slug]
// Garde la compatibilité avec tous les anciens liens partagés

import { redirect } from "next/navigation";

export default async function OrderRedirectPage({
  searchParams,
}: {
  searchParams: Promise<{ partner?: string; cat?: string }>;
}) {
  const params = await searchParams;

  if (params?.partner) {
    // /order?partner=chez_mama → /shop/chez_mama
    redirect(`/shop/${params.partner}`);
  }

  if (params?.cat) {
    // /order?cat=viande → /shop?cat=viande
    redirect(`/shop?cat=${params.cat}`);
  }

  // /order → /shop
  redirect("/shop");
}