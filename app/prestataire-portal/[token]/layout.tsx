import type { Metadata } from "next";
import PrestatairePortalLayoutClient from "./PrestatairePortalLayoutClient";

export const metadata: Metadata = {
  manifest: "/manifest-prestataire.json",
};

export default function PrestatairePortalLayout({ children }: { children: React.ReactNode }) {
  return <PrestatairePortalLayoutClient>{children}</PrestatairePortalLayoutClient>;
}
