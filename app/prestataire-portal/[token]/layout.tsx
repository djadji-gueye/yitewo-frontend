import PrestatairePortalLayoutClient from "./PrestatairePortalLayoutClient";

// Manifest dynamique généré par ./manifest.ts (token dans start_url), détecté
// automatiquement par Next.js pour ce segment de route.

export default function PrestatairePortalLayout({ children }: { children: React.ReactNode }) {
  return <PrestatairePortalLayoutClient>{children}</PrestatairePortalLayoutClient>;
}
