import type { MetadataRoute } from "next";

export default async function manifest({
  params,
}: {
  params: Promise<{ token: string }>;
}): Promise<MetadataRoute.Manifest> {
  const { token } = await params;

  return {
    name: "Yitewo Prestataire",
    short_name: "Yitewo Pro",
    description: "Espace prestataire Yitewo — missions, planning",
    start_url: `/prestataire-portal/${token}`,
    id: `/prestataire-portal/${token}`,
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
