"use client";

import Link from "next/link";

const CATEGORIES = [
  { icon: "🥩", label: "Viande & Poisson", href: "/order?cat=viande" },
  { icon: "🥦", label: "Légumes frais", href: "/order?cat=legumes" },
  { icon: "🧃", label: "Boissons", href: "/order?cat=boissons" },
  { icon: "🌾", label: "Épicerie", href: "/order?cat=epicerie" },
  { icon: "🧼", label: "Hygiène", href: "/order?cat=hygiene" },
  { icon: "🍞", label: "Boulangerie", href: "/order?cat=boulangerie" },
];

export default function CategoryGrid() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 14 }}>
      {CATEGORIES.map((cat, i) => (
        <Link
          key={cat.label}
          href={cat.href}
          className={`fade-up delay-${Math.min(i + 1, 6)}`}
          style={{
            background: "#fff",
            border: "1px solid var(--border)",
            borderRadius: 16,
            padding: "24px 16px",
            textAlign: "center",
            textDecoration: "none",
            color: "var(--text)",
            transition: "border-color 0.2s, box-shadow 0.2s, transform 0.2s",
            display: "block",
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLAnchorElement;
            el.style.borderColor = "var(--brand)";
            el.style.boxShadow = "var(--shadow-hover)";
            el.style.transform = "translateY(-3px)";
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLAnchorElement;
            el.style.borderColor = "var(--border)";
            el.style.boxShadow = "none";
            el.style.transform = "translateY(0)";
          }}
        >
          <div style={{ fontSize: 32, marginBottom: 10 }}>{cat.icon}</div>
          <p style={{ fontWeight: 600, fontSize: 13 }}>{cat.label}</p>
        </Link>
      ))}
    </div>
  );
}
