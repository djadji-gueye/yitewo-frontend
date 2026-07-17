import type { Metadata } from "next";
import PrestatairePortalEntryClient from "./PrestatairePortalEntryClient";

export const metadata: Metadata = {
  manifest: "/manifest-prestataire.json",
};

export default function PrestatairePortalEntry() {
  return <PrestatairePortalEntryClient />;
}
