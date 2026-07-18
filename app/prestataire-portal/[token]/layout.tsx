import type { Metadata } from "next";
import PrestatairePortalLayoutClient from "./PrestatairePortalLayoutClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>;
}): Promise<Metadata> {
  const { token } = await params;
  return { manifest: `/prestataire-portal/${token}/manifest.webmanifest` };
}

export default function PrestatairePortalLayout({ children }: { children: React.ReactNode }) {
  return <PrestatairePortalLayoutClient>{children}</PrestatairePortalLayoutClient>;
}
