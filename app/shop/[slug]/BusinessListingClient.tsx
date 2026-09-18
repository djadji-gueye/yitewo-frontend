"use client";

import { useState } from "react";
import { claimBusinessListing } from "@/lib/api";

export default function BusinessListingClient({ business }: { business: any }) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleClaim = async () => {
    setLoading(true);
    try {
      await claimBusinessListing(business.id);
      setMessage("Demande envoyée. L’équipe Yitewo vous contactera pour validation.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Impossible d’envoyer la demande.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ minHeight: "100vh", background: "var(--surface)", padding: "48px 20px" }}>
      <div style={{ maxWidth: 760, margin: "0 auto", background: "#fff", borderRadius: 20, padding: 28, border: "1px solid var(--border)" }}>
        <span
          style={{
            display: "inline-block",
            padding: "5px 10px",
            borderRadius: 99,
            background: business.status === "VERIFIED" ? "#d1fae5" : "#fff7ed",
            color: business.status === "VERIFIED" ? "#047857" : "#c2410c",
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          {business.status === "VERIFIED" ? "✓ Commerce vérifié" : "Commerce référencé · non vérifié"}
        </span>

        <h1 style={{ fontFamily: "Syne, sans-serif", fontSize: 32, margin: "18px 0 8px" }}>{business.name}</h1>
        <p style={{ color: "var(--muted)", marginBottom: 20 }}>
          📍 {business.address || business.zone || business.city}
        </p>

        {business.category && <p style={{ marginBottom: 12 }}>🏷️ {business.category}</p>}
        {business.phone && <p style={{ marginBottom: 8 }}>☎️ {business.phone}</p>}
        {business.website && (
          <p style={{ marginBottom: 20 }}>
            <a href={business.website} target="_blank" rel="noreferrer">Voir le site web</a>
          </p>
        )}

        <p style={{ color: "var(--muted)", lineHeight: 1.6, marginBottom: 24 }}>
          Cette fiche est référencée sur Yitewo à partir de données OpenStreetMap. Le propriétaire peut demander sa validation.
        </p>

        <button
          onClick={handleClaim}
          disabled={loading || business.isClaimed}
          style={{
            border: 0,
            borderRadius: 10,
            padding: "12px 18px",
            background: "var(--brand)",
            color: "#fff",
            fontWeight: 700,
            cursor: loading ? "wait" : "pointer",
            opacity: business.isClaimed ? 0.7 : 1,
          }}
        >
          {business.isClaimed ? "Demande déjà envoyée" : loading ? "Envoi…" : "Revendiquer cette fiche"}
        </button>

        {message && <p style={{ marginTop: 14, color: "var(--muted)" }}>{message}</p>}
      </div>
    </main>
  );
}
