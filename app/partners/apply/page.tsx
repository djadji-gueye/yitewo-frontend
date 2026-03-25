"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function RedirectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = searchParams.get("type");

  useEffect(() => {
    // Rediriger vers /partners qui gère maintenant tous les types
    router.replace("/partners");
  }, [router]);

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "DM Sans, sans-serif" }}>
      <p style={{ color: "var(--muted)", fontSize: 14 }}>Redirection…</p>
    </div>
  );
}

export default function PartnerApplyPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>Chargement…</div>}>
      <RedirectContent />
    </Suspense>
  );
}
