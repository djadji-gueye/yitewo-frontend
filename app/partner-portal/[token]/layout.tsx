import type { Metadata } from "next";
import PartnerPortalLayoutClient from "./PartnerPortalLayoutClient";

// Rendu côté serveur -> le <link rel="manifest"> correct est déjà dans le HTML
// au premier chargement (pas de dépendance à un useEffect côté client).
export const metadata: Metadata = {
  manifest: "/manifest-partner.json",
};

export default function PartnerPortalLayout({ children }: { children: React.ReactNode }) {
  return <PartnerPortalLayoutClient>{children}</PartnerPortalLayoutClient>;
}
