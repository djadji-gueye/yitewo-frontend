"use client";

import Link from "next/link";

interface PaginationProps {
  page: number;
  totalPages: number;
}

export default function ShopPagination({ page, totalPages }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages: (number | "…")[] = [];
  for (let i = 1; i <= totalPages; i += 1) {
    if (i === 1 || i === totalPages || Math.abs(i - page) <= 2) pages.push(i);
    else if (pages[pages.length - 1] !== "…") pages.push("…");
  }

  const href = (target: number) => target === 1 ? "/shop" : `/shop?page=${target}`;
  const buttonStyle = (active = false, disabled = false): React.CSSProperties => ({
    padding: "7px 14px",
    borderRadius: 8,
    border: `1px solid ${active ? "#E8380D" : "#f0ebe8"}`,
    background: active ? "#E8380D" : "#fff",
    color: active ? "#fff" : disabled ? "#cfcfcf" : "#1a1a1a",
    fontSize: 13,
    fontWeight: active ? 700 : 400,
    textDecoration: "none",
    pointerEvents: disabled ? "none" : "auto",
  });

  return (
    <nav aria-label="Pagination des boutiques" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 32, flexWrap: "wrap" }}>
      <Link href={href(Math.max(1, page - 1))} style={buttonStyle(false, page <= 1)}>← Précédent</Link>
      {pages.map((item, index) => item === "…"
        ? <span key={`ellipsis-${index}`} style={{ color: "#999", padding: "0 4px" }}>…</span>
        : <Link key={item} href={href(item)} aria-current={item === page ? "page" : undefined} style={buttonStyle(item === page)}>{item}</Link>)}
      <Link href={href(Math.min(totalPages, page + 1))} style={buttonStyle(false, page >= totalPages)}>Suivant →</Link>
    </nav>
  );
}
