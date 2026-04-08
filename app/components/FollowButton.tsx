"use client";

import { useState, useEffect } from "react";

const BASE = process.env.NEXT_PUBLIC_URL_PROD || "http://localhost:3003";

interface Props {
  slug: string;
  partnerName: string;
  compact?: boolean;
}

export default function FollowButton({ slug, partnerName, compact = false }: Props) {
  const [following, setFollowing] = useState(false);
  const [count, setCount]         = useState(0);
  const [loading, setLoading]     = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [phone, setPhone]         = useState("");
  const [inputVal, setInputVal]   = useState("");

  useEffect(() => {
    const saved = localStorage.getItem(`follow_${slug}`);
    const ph = saved ? JSON.parse(saved).phone : null;
    if (ph) setPhone(ph);

    fetch(`${BASE}/social/follow/${slug}?phone=${ph || "_none_"}`)
      .then((r) => r.json())
      .then((d) => { setFollowing(d.following); setCount(d.followers); })
      .catch(() => {});
  }, [slug]);

  const doToggle = async (ph: string) => {
    setLoading(true);
    try {
      if (following) {
        const r = await fetch(`${BASE}/social/follow/${slug}`, {
          method: "DELETE", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: ph }),
        });
        const d = await r.json();
        setFollowing(false); setCount(d.followers);
        localStorage.removeItem(`follow_${slug}`);
      } else {
        const r = await fetch(`${BASE}/social/follow/${slug}`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: ph }),
        });
        const d = await r.json();
        setFollowing(true); setCount(d.followers);
        localStorage.setItem(`follow_${slug}`, JSON.stringify({ phone: ph }));
        setPhone(ph);
      }
    } finally { setLoading(false); setShowInput(false); }
  };

  const handleClick = () => {
    if (phone) { doToggle(phone); return; }
    setShowInput(true);
  };

  if (showInput) return (
    <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
      <input
        autoFocus type="tel" value={inputVal}
        onChange={(e) => setInputVal(e.target.value)}
        placeholder="Votre numéro 221 7X…"
        onKeyDown={(e) => { if (e.key === "Enter" && inputVal.length >= 8) doToggle(inputVal); }}
        style={{
          padding: "7px 12px", borderRadius: 10, border: "1px solid #f0ebe8",
          fontSize: 13, outline: "none", width: 160,
        }}
      />
      <button
        onClick={() => { if (inputVal.length >= 8) doToggle(inputVal); }}
        disabled={inputVal.length < 8}
        style={{
          padding: "7px 14px", borderRadius: 10, border: "none",
          background: inputVal.length >= 8 ? "#E8380D" : "#f0ebe8",
          color: inputVal.length >= 8 ? "#fff" : "#aaa",
          fontSize: 13, fontWeight: 700, cursor: "pointer",
        }}
      >
        ♥ Suivre
      </button>
      <button onClick={() => setShowInput(false)}
        style={{ padding: "7px 10px", borderRadius: 10, border: "1px solid #f0ebe8", background: "#fff", cursor: "pointer", fontSize: 13, color: "#aaa" }}>
        ✕
      </button>
    </div>
  );

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        padding: compact ? "5px 12px" : "8px 18px",
        borderRadius: 99,
        border: `1.5px solid ${following ? "#ef4444" : "#E8380D"}`,
        background: following ? "#fee2e2" : "#fff5f3",
        color: following ? "#ef4444" : "#E8380D",
        fontSize: compact ? 11 : 13, fontWeight: 700,
        cursor: "pointer", transition: "all 0.18s",
      }}
    >
      {following ? "♥ Suivi" : "♡ Suivre"}
      {count > 0 && (
        <span style={{ opacity: 0.65, fontWeight: 400, fontSize: compact ? 10 : 12 }}>
          · {count}
        </span>
      )}
    </button>
  );
}
