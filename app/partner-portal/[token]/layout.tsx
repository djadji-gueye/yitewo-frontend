import type { Metadata } from "next";
import PartnerPortalLayoutClient from "./PartnerPortalLayoutClient";

// generateMetadata (contrairement à manifest.ts) supporte officiellement les
// params de route dynamique — c'est la bonne façon de pointer vers un manifest
// propre à ce token, servi par ./manifest.webmanifest/route.ts.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>;
}): Promise<Metadata> {
  const { token } = await params;
  return { manifest: `/partner-portal/${token}/manifest.webmanifest` };
}

export default function PartnerPortalLayout({ children }: { children: React.ReactNode }) {
  return <PartnerPortalLayoutClient>{children}</PartnerPortalLayoutClient>;
}
