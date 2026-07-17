import type { Metadata } from "next";
import PartnerPortalEntryClient from "./PartnerPortalEntryClient";

export const metadata: Metadata = {
  manifest: "/manifest-partner.json",
};

export default function PartnerPortalEntry() {
  return <PartnerPortalEntryClient />;
}
