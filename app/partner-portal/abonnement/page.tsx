"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

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
    cta: null,
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
      { text: "Profil visible sur Yitewo", ok: true },
      { text: "Produits/services illimités", ok: true },
      { text: "Contact WhatsApp direct", ok: true },
      { text: "Badge Pro Vérifié ✓", ok: true },
      { text: "1ère page dans votre catégorie", ok: true },
      { text: "Statistiques de visites & clics", ok: true },
      { text: "Lien portail personnalisé", ok: true },
      { text: "Agent WhatsApp IA", ok: false },
      { text: "Rapport mensuel avancé", ok: false },
    ],
    cta: "Passer au Pro",
  },
  {
    key: "business",
    name: "Business",
    price: 14900,
    label: "14 900 FCFA/mois",
    annuel: "149 000 FCFA/an (2 mois offerts)",
    color: "#1A9E5F",
    bg: "#f0fdf6",
    border: "#1A9E5F",
    icon: "⭐",
    badge: "TOUT INCLUS",
    features: [
      { text: "Tout du plan Pro", ok: true },
      { text: "Épinglé EN TÊTE de catégorie", ok: true },
      { text: "Agent WhatsApp IA 24h/7j", ok: true },
      { text: "Notifications push clients", ok: true },
      { text: "Rapport mensuel complet", ok: true },
      { text: "Multi-sites (3 adresses)", ok: true },
      { text: "Support prioritaire sous 4h", ok: true },
      { text: "Badge Business Premium", ok: true },
      { text: "Catalogue sync WhatsApp", ok: true },
    ],
    cta: "Passer au Business",
  },
];

export default function AbonnementPage() {
  const params = useParams();
  const token = params?.token as string;
  const [billing, setBilling] = useState<"mensuel" | "annuel">("mensuel");
  const [currentPlan] = useState("free"); // À terme depuis la DB

  const waMessage = (plan: typeof PLANS[0]) => {
    const price = billing === "annuel"
      ? plan.annuel
      : plan.label;
    return encodeURIComponent(
      `Bonjour ! Je souhaite souscrire au plan Yitewo ${plan.name} — ${price}.\nMon compte : ${window.location.origin}/partner-portal/${token}\nJe vais envoyer le paiement via Wave.`
    );
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 24, color: "#1a1a1a", marginBottom: 8 }}>
          Mon abonnement 💳
        </h1>
        <p style={{ color: "#6b7280", fontSize: 14 }}>
          Choisissez le plan qui correspond à votre activité. Paiement simple via Wave ou Orange Money.
        </p>
      </div>

      {/* Plan actuel */}
      <div style={{ background: "#fff", border: "1px solid #f0ebe8", borderRadius: 14, padding: "16px 20px", marginBottom: 28, display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: "#fff5f3", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>💳</div>
        <div>
          <p style={{ fontFamily: "Syne", fontWeight: 700, fontSize: 14, color: "#1a1a1a" }}>
            Plan actuel : <span style={{ color: "#E8380D" }}>Gratuit (Essentiel)</span>
          </p>
          <p style={{ fontSize: 12, color: "#aaa" }}>Passez à Pro pour apparaître en 1ère position dans votre catégorie</p>
        </div>
        <div style={{ marginLeft: "auto", padding: "4px 12px", borderRadius: 99, background: "#f0ebe8", color: "#888", fontSize: 11, fontWeight: 700 }}>
          GRATUIT
        </div>
      </div>

      {/* Toggle mensuel/annuel */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 32 }}>
        <div style={{ display: "flex", background: "#f5f5f5", borderRadius: 99, padding: 4, gap: 4 }}>
          {(["mensuel", "annuel"] as const).map((b) => (
            <button key={b} onClick={() => setBilling(b)} style={{
              padding: "8px 22px", borderRadius: 99, border: "none", cursor: "pointer", fontSize: 13,
              background: billing === b ? "#fff" : "transparent",
              color: billing === b ? "#1a1a1a" : "#888",
              fontWeight: billing === b ? 700 : 400,
              boxShadow: billing === b ? "0 1px 6px rgba(0,0,0,0.1)" : "none",
              transition: "all 0.2s",
            }}>
              {b === "mensuel" ? "Mensuel" : "Annuel"}{b === "annuel" && <span style={{ fontSize: 10, color: "#10b981", marginLeft: 5, fontWeight: 700 }}>-17%</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Grille des plans */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16, marginBottom: 40 }}>
        {PLANS.map((plan) => {
          const isCurrent = plan.key === currentPlan;
          return (
            <div key={plan.key} style={{
              background: isCurrent ? plan.bg : plan.bg,
              border: `2px solid ${isCurrent ? plan.color : plan.border}`,
              borderRadius: 20,
              padding: "24px 22px",
              position: "relative",
              overflow: "hidden",
              display: "flex", flexDirection: "column",
            }}>
              {/* Badge populaire */}
              {plan.badge && (
                <div style={{ position: "absolute", top: 0, right: 0, padding: "5px 14px", background: plan.color, color: "#fff", fontSize: 9, fontWeight: 800, letterSpacing: "0.08em", borderRadius: "0 18px 0 12px" }}>
                  {plan.badge}
                </div>
              )}
              {isCurrent && (
                <div style={{ position: "absolute", top: 0, left: 0, padding: "4px 12px", background: plan.color, color: "#fff", fontSize: 10, fontWeight: 700, borderRadius: "18px 0 12px 0" }}>
                  PLAN ACTUEL
                </div>
              )}

              {/* Icon + nom */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, marginTop: isCurrent ? 16 : 0 }}>
                <span style={{ fontSize: 26 }}>{plan.icon}</span>
                <div>
                  <p style={{ fontFamily: "Syne", fontWeight: 800, fontSize: 16, color: "#1a1a1a" }}>{plan.name}</p>
                  <p style={{ fontSize: 11, color: plan.color, fontWeight: 700 }}>{plan.label}</p>
                </div>
              </div>

              {/* Prix */}
              {plan.price > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <p style={{ fontFamily: "Syne", fontWeight: 800, fontSize: 28, color: "#1a1a1a" }}>
                    {billing === "annuel"
                      ? Math.round(plan.price * 10 / 1000) * 1000
                      : plan.price
                    }
                    <span style={{ fontSize: 14, fontWeight: 600, color: "#aaa" }}> FCFA/mois</span>
                  </p>
                  {billing === "annuel" && (
                    <p style={{ fontSize: 11, color: "#10b981", fontWeight: 600 }}>
                      {plan.annuel}
                    </p>
                  )}
                </div>
              )}

              {/* Features */}
              <div style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 20, flex: 1 }}>
                {plan.features.map((f) => (
                  <div key={f.text} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: f.ok ? "#374151" : "#d1d5db" }}>
                    <span style={{ fontSize: 13, flexShrink: 0, color: f.ok ? plan.color : "#e5e7eb" }}>
                      {f.ok ? "✓" : "✗"}
                    </span>
                    {f.text}
                  </div>
                ))}
              </div>

              {/* CTA */}
              {plan.cta && !isCurrent ? (
                <a
                  href={`https://wa.me/${WAVE_NUMBER}?text=${waMessage(plan)}`}
                  target="_blank" rel="noreferrer"
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    padding: "12px 16px", borderRadius: 12, textDecoration: "none",
                    background: plan.color, color: "#fff",
                    fontFamily: "Syne", fontWeight: 700, fontSize: 14,
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  {plan.cta} via Wave
                </a>
              ) : isCurrent ? (
                <div style={{ padding: "11px 16px", borderRadius: 12, background: "#f5f5f5", textAlign: "center", fontSize: 13, fontWeight: 600, color: "#aaa" }}>
                  Plan actuel
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      {/* Section paiement */}
      <div style={{ background: "#fff", border: "1px solid #f0ebe8", borderRadius: 18, padding: "24px 26px", marginBottom: 24 }}>
        <h2 style={{ fontFamily: "Syne", fontWeight: 700, fontSize: 16, color: "#1a1a1a", marginBottom: 18 }}>
          💳 Comment payer ?
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
          {[
            { icon: "📱", name: "Wave", color: "#1A9E5F", desc: "Envoyez le montant au +221 77 725 93 30 avec la note 'Yitewo Pro' ou 'Yitewo Business'", recommended: true },
            { icon: "🟠", name: "Orange Money", color: "#FF6600", desc: "Même numéro — +221 77 725 93 30. Mentionnez votre plan dans le message.", recommended: false },
            { icon: "💬", name: "WhatsApp", color: "#25D366", desc: "Cliquez sur 'Payer via Wave' ci-dessus — un message pré-rempli s'ouvre automatiquement.", recommended: false },
          ].map((m) => (
            <div key={m.name} style={{ background: "#fafaf9", border: `1px solid ${m.recommended ? m.color + "40" : "#f0ebe8"}`, borderRadius: 12, padding: "16px 14px", position: "relative" }}>
              {m.recommended && (
                <span style={{ position: "absolute", top: -8, left: 12, fontSize: 9, fontWeight: 800, padding: "2px 8px", borderRadius: 99, background: m.color, color: "#fff" }}>RECOMMANDÉ</span>
              )}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 22 }}>{m.icon}</span>
                <span style={{ fontFamily: "Syne", fontWeight: 700, fontSize: 14, color: "#1a1a1a" }}>{m.name}</span>
              </div>
              <p style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.6 }}>{m.desc}</p>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 18, background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 10, padding: "12px 16px", display: "flex", gap: 10, alignItems: "flex-start" }}>
          <span style={{ fontSize: 18, flexShrink: 0 }}>⚡</span>
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#92400e", marginBottom: 3 }}>Activation sous 24h</p>
            <p style={{ fontSize: 12, color: "#b45309", lineHeight: 1.5 }}>
              Après votre paiement, notre équipe active votre plan manuellement et vous envoie une confirmation WhatsApp. L'activation automatique sera disponible prochainement.
            </p>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div style={{ background: "#fff", border: "1px solid #f0ebe8", borderRadius: 18, padding: "24px 26px" }}>
        <h2 style={{ fontFamily: "Syne", fontWeight: 700, fontSize: 16, color: "#1a1a1a", marginBottom: 18 }}>
          ❓ Questions fréquentes
        </h2>
        {[
          { q: "Puis-je changer de plan à tout moment ?", r: "Oui. Envoyez un message WhatsApp à notre équipe pour upgrader ou downgrader. Le changement est effectif sous 24h." },
          { q: "Que se passe-t-il si j'arrête de payer ?", r: "Votre profil reste visible gratuitement mais vous repassez au plan Essentiel — sans mise en avant ni fonctionnalités premium." },
          { q: "Y a-t-il un engagement minimum ?", r: "Aucun engagement. Le plan mensuel se renouvelle chaque mois. Vous pouvez arrêter quand vous voulez." },
          { q: "Le paiement annuel est-il remboursable ?", r: "En cas de problème, contactez notre équipe. Nous trouverons une solution adaptée à votre situation." },
        ].map((faq, i) => (
          <div key={i} style={{ paddingBottom: 14, marginBottom: 14, borderBottom: i < 3 ? "1px solid #f5f5f5" : "none" }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#1a1a1a", marginBottom: 5 }}>❓ {faq.q}</p>
            <p style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.6 }}>{faq.r}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
