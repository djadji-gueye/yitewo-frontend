"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function PrestatairePortalEntry() {
  const router = useRouter();
  const [noToken, setNoToken] = useState(false);

  useEffect(() => {
    const last = typeof window !== "undefined" ? localStorage.getItem("yitewo_last_prestataire_token") : null;
    if (last) {
      router.replace(`/prestataire-portal/${last}`);
    } else {
      setNoToken(true);
    }
  }, [router]);

  if (noToken) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12, padding: 24, textAlign: "center", fontFamily: "DM Sans, sans-serif", background: "#fafaf8" }}>
        <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 24 }}>
          yite<span style={{ color: "#E8380D" }}>wo</span>
        </div>
        <p style={{ color: "#666", fontSize: 14, maxWidth: 320 }}>
          Ouvre le lien personnalisé reçu par WhatsApp ou SMS pour accéder à ton espace prestataire.
        </p>
      </div>
    );
  }

  return null;
}
