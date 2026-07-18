"use client";

import { useEffect, useState } from "react";
import { useParams, usePathname } from "next/navigation";
import Link from "next/link";
import PushNotificationButton from "@/components/PushNotificationButton";
import { syncBadgeCount } from "@/lib/push";

const BASE = process.env.NEXT_PUBLIC_URL_PROD || "http://localhost:3003";

export default function PrestatairePotalLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const pathname = usePathname();
  const token = params?.token as string;

  const [prestataire, setPrestataire] = useState<any>(null);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!token) { setError("Token manquant"); setChecking(false); return; }
    fetch(`${BASE}/partners/portal/${token}`)
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((data) => {
        if (data.type !== "Prestataire") throw new Error("Type invalide");
        setPrestataire(data);
        setChecking(false);
        try { localStorage.setItem("yitewo_last_prestataire_token", token); } catch {}
        syncBadgeCount("partner", token);
      })
      .catch(() => { setError("Lien invalide ou expiré"); setChecking(false); });
  }, [token]);

  useEffect(() => { setMenuOpen(false); }, [pathname]);

  const NAV = [
    { href: `/prestataire-portal/${token}`, icon: "⊞", label: "Tableau de bord" },
    { href: `/prestataire-portal/${token}/missions`, icon: "📋", label: "Mes missions" },
    { href: `/prestataire-portal/${token}/disponibilites`, icon: "🗓️", label: "Disponibilités" },
    { href: `/prestataire-portal/${token}/reputation`, icon: "⭐", label: "Ma réputation" },
    { href: `/prestataire-portal/${token}/profil`, icon: "⚙️", label: "Mon profil" },
  ];

  if (checking) return (
    <div style={{ minHeight: "100vh", background: "#fafaf8", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16, fontFamily: "DM Sans, sans-serif" }}>
      <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 28, color: "#1a1a1a" }}>yite<span style={{ color: "#E8380D" }}>wo</span></div>
      <div style={{ display: "flex", gap: 6 }}>
        {[0, 1, 2].map((i) => <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: "#E8380D", animation: "bounce 1.2s ease infinite", animationDelay: `${i * 0.2}s` }} />)}
      </div>
      <style>{`@keyframes bounce{0%,80%,100%{transform:scale(0.6);opacity:0.4}40%{transform:scale(1);opacity:1}}`}</style>
    </div>
  );

  if (error || !prestataire) return (
    <div style={{ minHeight: "100vh", background: "#fafaf8", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "DM Sans, sans-serif", padding: 20 }}>
      <div style={{ background: "#fff", borderRadius: 20, border: "1px solid #f0ebe8", padding: "48px 36px", textAlign: "center", maxWidth: 400 }}>
        <div style={{ fontSize: 52, marginBottom: 16 }}>🔒</div>
        <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 22, marginBottom: 10 }}>Accès refusé</h2>
        <p style={{ color: "#6b6b6b", fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>{error || "Ce lien est invalide ou a expiré."}</p>
        <Link href="/" style={{ display: "inline-block", background: "#E8380D", color: "#fff", padding: "11px 28px", borderRadius: 99, textDecoration: "none", fontWeight: 700, fontSize: 14 }}>Retour</Link>
      </div>
    </div>
  );

  const initials = prestataire.name?.split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase() || "?";
  const hue = [...(prestataire.name || "")].reduce((acc: number, c: string) => acc + c.charCodeAt(0), 0) % 360;

  return (
    <>
      <style>{`
        .portal-overlay { display: none }
        .portal-hamburger { display: none !important }
        .portal-close-btn { display: none !important }
        @media (max-width: 768px) {
          .p-sidebar { transform: translateX(-100%); transition: transform 0.3s ease; z-index: 40; }
          .p-sidebar.open { transform: translateX(0); box-shadow: 4px 0 24px rgba(0,0,0,0.15); }
          .p-main { margin-left: 0 !important; }
          .portal-overlay { display: block; position: fixed; inset: 0; background: rgba(0,0,0,0.45); z-index: 39; backdrop-filter: blur(2px); }
          .portal-hamburger { display: flex !important }
          .portal-close-btn { display: flex !important }
          .p-content { padding: 16px !important; }
        }
      `}</style>

      <div style={{ display: "flex", minHeight: "100vh", background: "#f7f4f2", fontFamily: "DM Sans, sans-serif" }}>

        {menuOpen && <div className="portal-overlay" onClick={() => setMenuOpen(false)} />}

        {/* Sidebar */}
        <aside className={`p-sidebar${menuOpen ? " open" : ""}`}
          style={{ width: 240, flexShrink: 0, background: "#fff", borderRight: "1px solid #f0ebe8", display: "flex", flexDirection: "column", position: "fixed", top: 0, left: 0, bottom: 0 }}>

          <button className="portal-close-btn" onClick={() => setMenuOpen(false)}
            style={{ position: "absolute", top: 12, right: 12, width: 30, height: 30, borderRadius: 8, border: "1px solid #f0ebe8", background: "#fff", cursor: "pointer", fontSize: 14, alignItems: "center", justifyContent: "center", display: "flex" }}>
            ✕
          </button>

          {/* Logo + identité */}
          <div style={{ padding: "24px 20px 20px", borderBottom: "1px solid #f0ebe8" }}>
            <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 20, color: "#1a1a1a", marginBottom: 14 }}>
              yite<span style={{ color: "#E8380D" }}>wo</span>
              <span style={{ fontSize: 10, fontWeight: 600, marginLeft: 8, padding: "2px 8px", borderRadius: 99, background: "#d1fae5", color: "#065f46" }}>Prestataire</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 42, height: 42, borderRadius: "50%", overflow: "hidden", flexShrink: 0, background: `linear-gradient(135deg,hsl(${hue},55%,28%),hsl(${(hue + 60) % 360},65%,42%))` }}>
                {prestataire.profileImageUrl
                  ? <img src={prestataire.profileImageUrl} alt={prestataire.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : <span style={{ fontFamily: "Syne", fontWeight: 800, fontSize: 15, color: "#fff" }}>{initials}</span>}
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontWeight: 700, fontSize: 13, color: "#1a1a1a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{prestataire.name}</p>
                <p style={{ fontSize: 11, color: "#6b6b6b" }}>📍 {prestataire.zone ? `${prestataire.zone}, ` : ""}{prestataire.city}</p>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav style={{ flex: 1, padding: "16px 12px", overflowY: "auto" }}>
            {NAV.map((item) => {
              const active = pathname === item.href;
              return (
                <Link key={item.href} href={item.href}
                  style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, marginBottom: 4, textDecoration: "none", background: active ? "#fff5f3" : "transparent", color: active ? "#E8380D" : "#888", fontWeight: active ? 600 : 400, fontSize: 14, transition: "all 0.18s", borderLeft: active ? "3px solid #E8380D" : "3px solid transparent" }}>
                  <span style={{ fontSize: 16, width: 20, textAlign: "center" }}>{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Numéro WhatsApp */}
          <div style={{ padding: "16px 20px", borderTop: "1px solid #f0ebe8" }}>
            <p style={{ fontSize: 11, color: "#aaa", marginBottom: 8, fontWeight: 500 }}>VOTRE CONTACT CLIENT</p>
            <a href={`https://wa.me/${prestataire.contact?.replace(/[\s+]/g, "")}`} target="_blank" rel="noreferrer"
              style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 10, background: "#f0fdf4", border: "1px solid #bbf7d0", textDecoration: "none" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.149-1.255-.491-2.39-1.477-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.075-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004c-1.025 0-2.031.256-2.91.745L7.04 3.65 3.92 8.765c-.437 1.122-.655 2.315-.655 3.516 0 5.202 4.247 9.45 9.449 9.45 2.529 0 4.881-.997 6.641-2.641 1.76-1.645 2.73-3.891 2.73-6.241-.001-5.202-4.248-9.45-9.449-9.45" /></svg>
              <span style={{ fontSize: 12, color: "#065f46", fontWeight: 600 }}>{prestataire.contact}</span>
            </a>
          </div>
        </aside>

        {/* Main */}
        <div className="p-main" style={{ flex: 1, marginLeft: 240, display: "flex", flexDirection: "column", minWidth: 0 }}>
          <header style={{ height: 56, background: "#fff", borderBottom: "1px solid #f0ebe8", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 28px", flexShrink: 0, position: "sticky", top: 0, zIndex: 30 }}>
            <button className="portal-hamburger" onClick={() => setMenuOpen(true)}
              style={{ width: 36, height: 36, borderRadius: 8, border: "1px solid #f0ebe8", background: "#fff", cursor: "pointer", flexDirection: "column", gap: 4, alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ width: 16, height: 2, background: "#1a1a1a", borderRadius: 2, display: "block" }} />
              <span style={{ width: 16, height: 2, background: "#1a1a1a", borderRadius: 2, display: "block" }} />
              <span style={{ width: 16, height: 2, background: "#1a1a1a", borderRadius: 2, display: "block" }} />
            </button>
            <p style={{ fontSize: 13, color: "#aaa", flex: 1, margin: "0 8px" }}>
              Espace prestataire<span style={{ color: "#1a1a1a", fontWeight: 600 }}> · {prestataire.name}</span>
            </p>
            <PushNotificationButton kind="partner" token={token} label={prestataire.name} />
          </header>
          <main className="p-content" style={{ flex: 1, padding: "28px", overflowY: "auto", minWidth: 0 }}>
            {children}
          </main>
        </div>
      </div>
    </>
  );
}