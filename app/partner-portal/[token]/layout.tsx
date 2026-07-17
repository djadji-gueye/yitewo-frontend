import PartnerPortalLayoutClient from "./PartnerPortalLayoutClient";

// Le manifest dynamique (avec le token dans start_url) est généré par
// ./manifest.ts, co-localisé dans ce même segment de route — Next.js le
// détecte et pose le <link rel="manifest"> automatiquement.

export default function PartnerPortalLayout({ children }: { children: React.ReactNode }) {
  return <PartnerPortalLayoutClient>{children}</PartnerPortalLayoutClient>;
}
