"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

const WAVE_NUMBER = "221777259330";

const PLANS = [
  {
    key: "free",
    name: "Essentiel",
    price: 0,
    label: "Gratuit",
    color: "#6b7280",
    bg: "#f9fafb",
    border: "#e5e7eb",
    icon: "🌱",
    features: [
      { text: "Profil visible sur Yitewo", ok: true },
      { text: "Jusqu'à 5 produits/services", ok: true },
      { text: "Contact WhatsApp direct", ok: true },
      { text: "Badge Partenaire Yitewo", ok: true },
      { text: "Mise en avant dans les résultats", ok: false },
      { text: "Statistiques de visites", ok: false },
      { text: "Badge Pro Vérifié", ok: false },
      { text: "Agent WhatsApp IA", ok: false },
      { text: "Produits illimités", ok: false },
    ],
  },
  {
    key: "pro",
    name: "Pro",
    price: 4900,
    label: "4 900 FCFA/mois",
    annuel: "49 000 FCFA/an (2 mois offerts)",
    color: "#E8380D",
    bg: "#fff8f6",
    border: "#E8380D",
    icon: "🚀",
    badge: "LE PLUS POPULAIRE",
    features: [
      { text: "Produits/services illimités", ok: true },
      { text: "Badge Pro Vérifié ✓", ok: true },
      { text: "1ère page dans votre catégorie", ok: true },
      { text: "Statistiques", ok: true },
    ],
    cta: "Passer au Pro",
  },
  {
    key: "business",
    name: "Business",
    price: 14900,
    label: "14 900 FCFA/mois",
    annuel: "149 000 FCFA/an",
    color: "#1A9E5F",
    bg: "#f0fdf6",
    border: "#1A9E5F",
    icon: "⭐",
    badge: "TOUT INCLUS",
    features: [
      { text: "Tout du plan Pro", ok: true },
      { text: "Agent WhatsApp IA", ok: true },
      { text: "Support prioritaire", ok: true },
    ],
    cta: "Passer au Business",
  },
];

export default function AbonnementPage() {
  const params = useParams();
  const token = params?.token as string;

  const [billing, setBilling] = useState<"mensuel" | "annuel">("mensuel");
  const [origin, setOrigin] = useState("");

  // ✅ FIX SSR
  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  const waMessage = (plan: typeof PLANS[0]) => {
    const price = billing === "annuel" ? plan.annuel : plan.label;

    return encodeURIComponent(
      `Bonjour ! Je souhaite souscrire au plan Yitewo ${plan.name} — ${price}.
Mon compte : ${origin}/partner-portal/${token}
Je vais envoyer le paiement via Wave.`
    );
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 20 }}>
      <h1 style={{ fontSize: 24, fontWeight: 800 }}>Mon abonnement 💳</h1>

      {/* Toggle */}
      <div style={{ margin: "20px 0" }}>
        <button onClick={() => setBilling("mensuel")}>Mensuel</button>
        <button onClick={() => setBilling("annuel")}>Annuel</button>
      </div>

      {/* Plans */}
      <div style={{ display: "grid", gap: 16 }}>
        {PLANS.map((plan) => (
          <div
            key={plan.key}
            style={{
              border: `1px solid ${plan.border}`,
              borderRadius: 16,
              padding: 20,
            }}
          >
            <h2>{plan.icon} {plan.name}</h2>
            <p>{billing === "annuel" ? plan.annuel : plan.label}</p>

            <ul>
              {plan.features.map((f) => (
                <li key={f.text}>
                  {f.ok ? "✓" : "✗"} {f.text}
                </li>
              ))}
            </ul>

            {plan.cta && (
              <a
                href={`https://wa.me/${WAVE_NUMBER}?text=${waMessage(plan)}`}
                target="_blank"
                style={{
                  display: "inline-block",
                  marginTop: 10,
                  padding: "10px 16px",
                  background: plan.color,
                  color: "#fff",
                  borderRadius: 8,
                  textDecoration: "none",
                }}
              >
                {plan.cta}
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}