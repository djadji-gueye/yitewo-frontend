"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import LocationPicker, { LocationValue } from "@/components/LocationPicker";
import { createServiceRequest } from "@/lib/api";

const BASE = process.env.NEXT_PUBLIC_URL_PROD || "http://localhost:3003";

interface Provider {
  id: string;
  name: string;
  city: string;
  zone?: string;
  contact: string;
  serviceCategories?: string[];
  message?: string;
  profileImageUrl?: string;
  plan: "pro" | "business" | string;
}

function ProviderCard({ provider }: { provider: Provider }) {
  const initials = provider.name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 16,
        border: "1px solid #eee",
        overflow: "hidden",
      }}
    >
      {/* HEADER */}
      <div
        style={{
          height: 80,
          background: "linear-gradient(135deg,#0d3320,#1A9E5F)",
          position: "relative",
        }}
      >
        {/* badge plan */}
        {provider.plan === "business" && (
          <span style={badgeBusiness}>⭐ Business</span>
        )}
        {provider.plan === "pro" && <span style={badgePro}>✓ Pro</span>}

        {/* vérifié */}
        <span style={badgeVerified}>✓ Vérifié</span>
      </div>

      {/* avatar */}
      <div
        style={{
          width: 60,
          height: 60,
          borderRadius: "50%",
          marginTop: -30,
          marginLeft: 16,
          border: "3px solid #fff",
          overflow: "hidden",
          background: "#eee",
        }}
      >
        <img
          src={
            provider.profileImageUrl ||
            `https://api.dicebear.com/7.x/personas/svg?seed=${provider.name}`
          }
          style={{ width: "100%", height: "100%" }}
        />
      </div>

      {/* content */}
      <div style={{ padding: 16 }}>
        <p style={{ fontWeight: 700 }}>{provider.name}</p>
        <p style={{ fontSize: 12, color: "#777" }}>
          📍 {provider.zone ? provider.zone + ", " : ""}
          {provider.city}
        </p>

        <a
          href={`https://wa.me/${provider.contact?.replace(/[\s+]/g, "")}`}
          target="_blank"
          style={{
            display: "block",
            marginTop: 12,
            padding: 10,
            textAlign: "center",
            borderRadius: 8,
            background: "#25D366",
            color: "#fff",
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          Contacter
        </a>
      </div>
    </div>
  );
}

export default function ServicesPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`${BASE}/partners/public/active`)
      .then((r) => r.json())
      .then((data) => {
        // tri business > pro > normal
        const sorted = data.sort((a: Provider, b: Provider) => {
          const order: any = { business: 2, pro: 1 };
          return (order[b.plan] || 0) - (order[a.plan] || 0);
        });
        setProviders(sorted);
      })
      .catch(() => setProviders([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 20 }}>
        👷 Prestataires
      </h1>

      {loading ? (
        <p>Chargement...</p>
      ) : providers.length === 0 ? (
        <p>Aucun prestataire</p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))",
            gap: 16,
          }}
        >
          {providers.map((p) => (
            <ProviderCard key={p.id} provider={p} />
          ))}
        </div>
      )}
    </div>
  );
}

/* styles */
const badgeBusiness: React.CSSProperties = {
  position: "absolute",
  top: 10,
  left: 10,
  background: "#1A9E5F",
  color: "#fff",
  fontSize: 10,
  fontWeight: 800,
  padding: "4px 8px",
  borderRadius: 20,
};

const badgePro: React.CSSProperties = {
  position: "absolute",
  top: 10,
  left: 10,
  background: "#E8380D",
  color: "#fff",
  fontSize: 10,
  fontWeight: 800,
  padding: "4px 8px",
  borderRadius: 20,
};

const badgeVerified: React.CSSProperties = {
  position: "absolute",
  top: 10,
  right: 10,
  background: "rgba(255,255,255,0.2)",
  color: "#fff",
  fontSize: 10,
  padding: "4px 8px",
  borderRadius: 20,
};