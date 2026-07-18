import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;

  const manifest = {
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

  return NextResponse.json(manifest, {
    headers: {
      "Content-Type": "application/manifest+json",
      "Cache-Control": "public, max-age=300",
    },
  });
}
