"use client";

import { useEffect, useState } from "react";
import { useParams, usePathname } from "next/navigation";
import Link from "next/link";

const BASE = process.env.NEXT_PUBLIC_URL_PROD || "http://localhost:3003";

export default function PartnerPortalLayout({ children }: { children: React.ReactNode }) {
  const params  = useParams();
  const pathname = usePathname();
  const token   = params?.token as string;

  const [partner, setPartner] = useState<any>(null);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) { setError("Token manquant"); setChecking(false); return; }

    fetch(`${BASE}/partners/portal/${token}`)
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((data) => { setPartner(data); setChecking(false); })
      .catch(() => { setError("Lien invalide ou expiré"); setChecking(false); });
  }, [token]);

  const NAV = [
    { href: `/partner-portal/${token}`,           icon: "⊞", label: "Tableau de bord" },
    { href: `/partner-portal/${token}/produits`,  icon: "📦", label: "Mes produits" },
    { href: `/partner-portal/${token}/commandes`, icon: "🛒", label: "Mes commandes" },
  ];

  // ── Loading ───────────────────────────────────────────────
  if (checking) return (
    <div style={{
      minHeight: "100vh", background: "#fafaf8",
      display: "flex", alignItems: "center", justifyContent: "center",
      flexDirection: "column", gap: 16, fontFamily: "DM Sans, sans-serif",
    }}>
      <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 28, color: "#1a1a1a" }}>
        yite<span style={{ color: "#E8380D" }}>wo</span>
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        {[0,1,2].map((i) => (
          <div key={i} style={{
            width: 8, height: 8, borderRadius: "50%", background: "#E8380D",
            animation: "bounce 1.2s ease infinite",
            animationDelay: `${i * 0.2}s`,
          }} />
        ))}
      </div>
      <style>{`@keyframes bounce{0%,80%,100%{transform:scale(0.6);opacity:0.4}40%{transform:scale(1);opacity:1}}`}</style>
    </div>
  );

  // ── Error ─────────────────────────────────────────────────
  if (error || !partner) return (
    <div style={{
      minHeight: "100vh", background: "#fafaf8",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "DM Sans, sans-serif", padding: 20,
    }}>
      <div style={{
        background: "#fff", borderRadius: 20, border: "1px solid #f0ebe8",
        padding: "48px 36px", textAlign: "center", maxWidth: 400,
      }}>
        <div style={{ fontSize: 52, marginBottom: 16 }}>🔒</div>
        <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 22, marginBottom: 10 }}>
          Accès refusé
        </h2>
        <p style={{ color: "#6b6b6b", fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
          {error || "Ce lien partenaire est invalide ou a expiré."}
        </p>
        <Link href="/" style={{
          display: "inline-block", background: "#E8380D", color: "#fff",
          padding: "11px 28px", borderRadius: 99,
          textDecoration: "none", fontWeight: 700, fontSize: 14,
        }}>
          Retour à l'accueil
        </Link>
      </div>
    </div>
  );

  // ── Portal ────────────────────────────────────────────────
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f7f4f2", fontFamily: "DM Sans, sans-serif" }}>

      {/* Sidebar */}
      <aside style={{
        width: 240, flexShrink: 0,
        background: "#fff",
        borderRight: "1px solid #f0ebe8",
        display: "flex", flexDirection: "column",
        position: "fixed", top: 0, left: 0, bottom: 0,
      }}>
        {/* Logo + Partner name */}
        <div style={{ padding: "24px 20px 20px", borderBottom: "1px solid #f0ebe8" }}>
          <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 20, color: "#1a1a1a", marginBottom: 10 }}>
            yite<span style={{ color: "#E8380D" }}>wo</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: "linear-gradient(135deg, #E8380D22, #E8380D44)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18, flexShrink: 0,
            }}>
              {partner.type === "Restaurant" ? "🍽️" : "🛒"}
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontWeight: 700, fontSize: 13, color: "#1a1a1a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {partner.name}
              </p>
              <p style={{ fontSize: 11, color: "#6b6b6b" }}>{partner.city}</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "16px 12px" }}>
          {NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "10px 12px", borderRadius: 10, marginBottom: 4,
                textDecoration: "none",
                background: active ? "#fff5f3" : "transparent",
                color: active ? "#E8380D" : "#6b6b6b",
                fontWeight: active ? 600 : 400, fontSize: 14,
                borderLeft: active ? "3px solid #E8380D" : "3px solid transparent",
                transition: "all 0.18s",
              }}>
                <span style={{ fontSize: 16, width: 20, textAlign: "center" }}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Partner link */}
        <div style={{ padding: "16px 20px", borderTop: "1px solid #f0ebe8" }}>
          <p style={{ fontSize: 11, color: "#aaa", marginBottom: 8, fontWeight: 500 }}>
            VOTRE LIEN DE COMMANDE
          </p>
          <div style={{
            background: "#f7f4f2", borderRadius: 8, padding: "8px 10px",
            fontSize: 11, color: "#6b6b6b", wordBreak: "break-all", lineHeight: 1.5,
          }}>
            {typeof window !== "undefined" ? window.location.origin : "https://yitewo-frontend.vercel.app"}
            /order?partner={partner.slug}
          </div>
          <button
            onClick={() => navigator.clipboard?.writeText(`${typeof window !== "undefined" ? window.location.origin : ""}/order?partner=${partner.slug}`)}
            style={{
              width: "100%", marginTop: 8, padding: "7px",
              borderRadius: 8, border: "1px solid #f0ebe8",
              background: "#fff", color: "#E8380D",
              fontSize: 12, fontWeight: 600, cursor: "pointer",
            }}
          >
            📋 Copier le lien
          </button>
        </div>
      </aside>

      {/* Main */}
      <div style={{ flex: 1, marginLeft: 240, display: "flex", flexDirection: "column" }}>
        {/* Topbar */}
        <header style={{
          height: 56, background: "#fff",
          borderBottom: "1px solid #f0ebe8",
          display: "flex", alignItems: "center",
          justifyContent: "space-between",
          padding: "0 28px", flexShrink: 0,
        }}>
          <p style={{ fontSize: 13, color: "#aaa" }}>
            Espace partenaire
            <span style={{ color: "#1a1a1a", fontWeight: 600 }}> · {partner.name}</span>
          </p>
          <a
            href={`/order?partner=${partner.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "6px 14px", borderRadius: 8,
              background: "#fff5f3", border: "1px solid #fdd0c5",
              color: "#E8380D", textDecoration: "none",
              fontSize: 12, fontWeight: 600,
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
              <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
            Voir ma boutique
          </a>
        </header>

        {/* Content */}
        <main style={{ flex: 1, padding: "28px", overflowY: "auto" }}>
          {/* Pass partner data to children via context would be ideal,
              but for simplicity we use a data attribute */}
          <div data-partner={JSON.stringify(partner)}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
