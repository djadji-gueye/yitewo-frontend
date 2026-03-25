"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

const NAV = [
  { href: "/dashboard",              icon: "⊞",  label: "Vue d'ensemble" },
  { href: "/dashboard/commandes",    icon: "🛒",  label: "Commandes" },
  { href: "/dashboard/services",     icon: "🔧",  label: "Services" },
  { href: "/dashboard/opportunites", icon: "📋",  label: "Opportunités" },
  { href: "/dashboard/partenaires",  icon: "🤝",  label: "Partenaires" },
  { href: "/dashboard/produits",     icon: "📦",  label: "Produits" },
  { href: "/dashboard/parametres",   icon: "⚙️",  label: "Paramètres" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [admin, setAdmin] = useState<any>(null);
  const [checking, setChecking] = useState(true);
  const [unread, setUnread] = useState(0);

  const isLoginPage = pathname === "/dashboard/login";

  // ── Auth check ──────────────────────────────────────────────
  useEffect(() => {
    // Ne pas vérifier sur la page login
    if (isLoginPage) {
      setChecking(false);
      return;
    }

    const token = localStorage.getItem("yitewo_token");
    if (!token) {
      router.replace("/dashboard/login");
      return;
    }

    const BASE = process.env.NEXT_PUBLIC_URL_PROD || "http://localhost:3003";
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      controller.abort();
      localStorage.removeItem("yitewo_token");
      router.replace("/dashboard/login");
    }, 8000);

    fetch(`${BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: controller.signal,
    })
      .then((r) => {
        if (!r.ok) throw new Error("unauthorized");
        return r.json();
      })
      .then((data) => {
        clearTimeout(timeout);
        setAdmin(data);
        setChecking(false);
      })
      .catch(() => {
        clearTimeout(timeout);
        localStorage.removeItem("yitewo_token");
        router.replace("/dashboard/login");
      });

    return () => { controller.abort(); clearTimeout(timeout); };
  }, [isLoginPage]);

  // ── Notification polling ────────────────────────────────────
  useEffect(() => {
    if (!admin) return;
    const BASE = process.env.NEXT_PUBLIC_URL_PROD || "http://localhost:3003";
    const token = localStorage.getItem("yitewo_token");
    if (!token) return;

    const fetchUnread = () => {
      fetch(`${BASE}/notifications/unread-count`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.json())
        .then((n) => setUnread(typeof n === "number" ? n : 0))
        .catch(() => {});
    };

    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [admin]);

  const handleLogout = () => {
    localStorage.removeItem("yitewo_token");
    router.replace("/dashboard/login");
  };

  // ── Page login : rendu sans sidebar ────────────────────────
  if (isLoginPage) {
    return <>{children}</>;
  }

  // ── Vérification en cours ────────────────────────────────────
  if (checking) {
    return (
      <div style={{
        height: "100vh", display: "flex", alignItems: "center",
        justifyContent: "center", background: "#0d0d14",
        flexDirection: "column", gap: 16,
      }}>
        <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 28, color: "#fff" }}>
          yite<span style={{ color: "#E8380D" }}>wo</span>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{
              width: 8, height: 8, borderRadius: "50%", background: "#E8380D",
              animation: "bounce 1.2s ease infinite",
              animationDelay: `${i * 0.2}s`,
            }} />
          ))}
        </div>
        <style>{`@keyframes bounce { 0%,80%,100%{transform:scale(0.6);opacity:0.4} 40%{transform:scale(1);opacity:1} }`}</style>
      </div>
    );
  }

  // ── Dashboard avec sidebar ──────────────────────────────────
  return (
    <div style={{
      display: "flex", height: "100vh", background: "#0d0d14",
      fontFamily: "DM Sans, sans-serif", overflow: "hidden",
    }}>

      {/* ── Sidebar ── */}
      <aside style={{
        width: 240, flexShrink: 0, background: "#13131f",
        borderRight: "1px solid rgba(255,255,255,0.06)",
        display: "flex", flexDirection: "column",
        position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 50,
      }}>
        {/* Logo */}
        <div style={{ padding: "24px 20px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <Link href="/dashboard" style={{ textDecoration: "none" }}>
            <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 22, color: "#fff" }}>
              yite<span style={{ color: "#E8380D" }}>wo</span>
            </span>
          </Link>
          <p style={{ fontSize: 11, color: "#444", marginTop: 4, fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase" }}>
            Dashboard Admin
          </p>
        </div>

        {/* Nav links */}
        <nav style={{ flex: 1, padding: "16px 12px", overflowY: "auto" }}>
          {NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "10px 12px", borderRadius: 10, marginBottom: 2,
                textDecoration: "none",
                background: active ? "rgba(232,56,13,0.15)" : "transparent",
                color: active ? "#E8380D" : "#888",
                fontWeight: active ? 600 : 400, fontSize: 14,
                transition: "all 0.18s",
                borderLeft: active ? "3px solid #E8380D" : "3px solid transparent",
              }}>
                <span style={{ fontSize: 16, width: 20, textAlign: "center" }}>{item.icon}</span>
                {item.label}
                {item.label === "Vue d'ensemble" && unread > 0 && (
                  <span style={{ marginLeft: "auto", background: "#E8380D", color: "#fff", borderRadius: 99, fontSize: 10, fontWeight: 800, padding: "1px 6px" }}>
                    {unread}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User block */}
        <div style={{ padding: "16px 20px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <div style={{
              width: 36, height: 36, borderRadius: "50%",
              background: "linear-gradient(135deg, #E8380D, #c22d09)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 14, fontWeight: 800, color: "#fff", flexShrink: 0,
            }}>
              {admin?.name?.[0]?.toUpperCase() || "A"}
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {admin?.name || "Admin"}
              </p>
              <p style={{ fontSize: 11, color: "#444" }}>
                {admin?.role === "SUPER_ADMIN" ? "Super Admin" : "Admin"}
              </p>
            </div>
          </div>
          <button onClick={handleLogout} style={{
            width: "100%", padding: "8px", borderRadius: 8,
            background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
            color: "#555", fontSize: 13, cursor: "pointer", transition: "color 0.18s",
          }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#E8380D"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#555"; }}
          >
            Se déconnecter
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", marginLeft: 240, minWidth: 0 }}>

        {/* Topbar */}
        <header style={{
          height: 60, background: "#13131f",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          display: "flex", alignItems: "center", justifyContent: "flex-end",
          padding: "0 24px", flexShrink: 0, gap: 10,
        }}>
          {unread > 0 && (
            <div style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "5px 12px", borderRadius: 99,
              background: "rgba(232,56,13,0.12)", border: "1px solid rgba(232,56,13,0.2)",
              fontSize: 12, color: "#E8380D", fontWeight: 600,
            }}>
              🔔 {unread} non lue{unread > 1 ? "s" : ""}
            </div>
          )}
          <Link href="/" target="_blank" style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "6px 14px", borderRadius: 8,
            background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
            color: "#666", textDecoration: "none", fontSize: 12, fontWeight: 500,
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
              <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
            Site public
          </Link>
        </header>

        {/* Content */}
        <main style={{ flex: 1, overflowY: "auto", background: "#0d0d14" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
