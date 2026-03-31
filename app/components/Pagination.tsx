"use client";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  dark?: boolean;
}

export default function Pagination({ page, totalPages, onPageChange, dark = false }: PaginationProps) {
  if (totalPages <= 1) return null;

  const bg      = dark ? "#1a1a2e" : "#fff";
  const border  = dark ? "rgba(255,255,255,0.1)" : "#f0ebe8";
  const color   = dark ? "#fff" : "#1a1a1a";
  const muted   = dark ? "#444" : "#ccc";

  const pages: (number | "…")[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || Math.abs(i - page) <= 2) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "…") {
      pages.push("…");
    }
  }

  const btn = (active: boolean, disabled: boolean): React.CSSProperties => ({
    padding: "7px 14px", borderRadius: 8, fontSize: 13,
    cursor: disabled ? "not-allowed" : "pointer",
    border: `1px solid ${active ? "#E8380D" : border}`,
    background: active ? "#E8380D" : bg,
    color: active ? "#fff" : disabled ? muted : color,
    fontWeight: active ? 700 : 400,
    opacity: disabled ? 0.5 : 1,
    transition: "all 0.18s",
    fontFamily: "DM Sans, sans-serif",
  });

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 32, flexWrap: "wrap" }}>
      <button onClick={() => onPageChange(page - 1)} disabled={page <= 1} style={btn(false, page <= 1)}>
        ← Précédent
      </button>

      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`e-${i}`} style={{ color: muted, padding: "0 4px", fontSize: 13 }}>…</span>
        ) : (
          <button key={p} onClick={() => onPageChange(p as number)} style={btn(p === page, false)}>
            {p}
          </button>
        )
      )}

      <button onClick={() => onPageChange(page + 1)} disabled={page >= totalPages} style={btn(false, page >= totalPages)}>
        Suivant →
      </button>
    </div>
  );
}
