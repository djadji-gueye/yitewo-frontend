"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { registerServiceWorker } from "@/lib/push";

export default function ConditionalShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); registerServiceWorker(); }, []);

  const isDashboard = pathname?.startsWith("/dashboard") ||
                      pathname?.startsWith("/partner-portal") ||
                      pathname?.startsWith("/prestataire-portal");

  // Avant le montage côté client, on ne rend ni Navbar ni Footer
  // pour éviter le flash sur les pages dashboard
  if (!mounted) {
    return <>{children}</>;
  }

  if (isDashboard) return <>{children}</>;

  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  );
}