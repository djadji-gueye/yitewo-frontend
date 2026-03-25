"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useCart } from "./CartProvider";
import CartDrawer from "./CartDrawer";

export default function Navbar() {
  const pathname = usePathname();
  const { totalItems, setIsOpen } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { name: "Accueil", href: "/" },
    { name: "Boutiques", href: "/order" },
    { name: "Services", href: "/services" },
    { name: "Opportunités", href: "/opportunities" },
    { name: "Partenaires", href: "/partners" },
  ];

  return (
    <>
      <CartDrawer />
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: "rgba(255,250,248,0.92)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "0 20px",
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 32,
          }}
        >
          {/* Logo */}
          <Link href="/" style={{ textDecoration: "none", flexShrink: 0 }}>
            <span
              style={{
                fontFamily: "Syne, sans-serif",
                fontWeight: 800,
                fontSize: 22,
                color: "var(--brand)",
                letterSpacing: "-0.5px",
              }}
            >
              yite<span style={{ color: "var(--brand)" }}>wo</span>
            </span>
          </Link>

          {/* Desktop links */}
          <div
            className="hidden md:flex"
            style={{ gap: 32, alignItems: "center", flex: 1, justifyContent: "center" }}
          >
            {links.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  style={{
                    textDecoration: "none",
                    fontFamily: "DM Sans, sans-serif",
                    fontWeight: active ? 600 : 400,
                    fontSize: 14,
                    color: active ? "var(--brand)" : "var(--muted)",
                    borderBottom: active ? "2px solid var(--brand)" : "2px solid transparent",
                    paddingBottom: 2,
                    transition: "color 0.2s, border-color 0.2s",
                  }}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* Right actions */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
            {/* Cart button */}
            <button
              onClick={() => setIsOpen(true)}
              style={{
                position: "relative",
                background: "var(--brand)",
                color: "#fff",
                border: "none",
                borderRadius: 99,
                padding: "8px 18px 8px 14px",
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontFamily: "DM Sans, sans-serif",
                fontWeight: 600,
                fontSize: 14,
                cursor: "pointer",
                transition: "background 0.2s, transform 0.15s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "var(--brand-dark)";
                (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.03)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "var(--brand)";
                (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
              Panier
              {totalItems > 0 && (
                <span
                  className="cart-badge"
                  style={{
                    background: "#fff",
                    color: "var(--brand)",
                    borderRadius: "99px",
                    fontSize: 11,
                    fontWeight: 800,
                    minWidth: 20,
                    height: 20,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "0 5px",
                  }}
                >
                  {totalItems}
                </span>
              )}
            </button>

            {/* Mobile burger */}
            <button
              className="md:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 4,
                color: "var(--text)",
              }}
            >
              {mobileOpen ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div
            style={{
              background: "#fff",
              borderTop: "1px solid var(--border)",
              padding: "12px 20px 20px",
            }}
          >
            {links.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  style={{
                    display: "block",
                    padding: "12px 0",
                    textDecoration: "none",
                    fontWeight: active ? 600 : 400,
                    color: active ? "var(--brand)" : "var(--text)",
                    borderBottom: "1px solid var(--border)",
                    fontSize: 15,
                  }}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>
        )}
      </nav>
    </>
  );
}
