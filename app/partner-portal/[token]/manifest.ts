import type { MetadataRoute } from "next";

export default async function manifest({
  params,
}: {
  params: Promise<{ token: string }>;
}): Promise<MetadataRoute.Manifest> {
  const { token } = await params;

  return {
    name: "Yitewo Partenaire",
    short_name: "Yitewo Pro",
    description: "Espace partenaire Yitewo — commandes, produits, stats",
    // Le token est ici, en dur : l'app installée rouvre directement le bon espace,
    // sans dépendre du localStorage (isolé entre Safari et l'app sur iOS).
    start_url: `/partner-portal/${token}`,
    id: `/partner-portal/${token}`,
    display: "standalone",
    background_color: "#fafaf8",
    theme_color: "#1a1a1a",
    orientation: "portrait-primary",
    lang: "fr-SN",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
