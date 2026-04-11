"use client";

import { useState } from "react";
import PartnerForm from "@/components/PartnerForm";
import ServiceProviderForm from "@/components/ServiceProviderForm";

const PARTNER_TYPES = [
  {
    key: "marchand",
    icon: "🏪",
    label: "Marchand",
    desc: "Épicerie, supérette, grossiste, cosmétique, téléphonie, pharmacie, boulangerie, quincaillerie, mode, informatique, artisanat…",
    color: "#0369a1", bg: "#e0f2fe",
    benefits: ["Vitrine en ligne sur Yitewo", "Gestion de votre catalogue", "Commandes directes clients", "Dashboard dédié"],
    examples: ["🛒 Alimentation & épicerie", "💄 Cosmétique & beauté", "📱 Téléphonie & telecom", "💊 Pharmacie & parapharmacie", "🥖 Boulangerie & pâtisserie", "🔨 Quincaillerie & BTP", "👗 Mode & vêtements", "💻 Informatique & high-tech", "📦 Grossiste", "🎨 Artisanat & art", "💍 Bijouterie", "📚 Librairie & papeterie"],
  },
  {
    key: "restaurant",
    icon: "🍽️",
    label: "Restaurant",
    desc: "Restaurant, fast-food, traiteur, snack, cuisine à emporter, plats locaux",
    color: "#b45309", bg: "#fef3c7",
    benefits: ["Menu en ligne visible", "Commandes en temps réel", "Gestion des plats", "Dashboard dédié"],
    examples: ["🍛 Cuisine locale sénégalaise", "🍔 Fast-food & snacks", "🥘 Traiteur & plats à emporter", "🍱 Cuisine internationale"],
  },
  {
    key: "prestataire",
    icon: "🔧",
    label: "Prestataire de services",
    desc: "Plombier, électricien, ménage, coiffeur, jardinage, cours particuliers, informatique, déménagement…",
    color: "#065f46", bg: "#d1fae5",
    benefits: ["Profil visible sur /services", "Mises en relation directes", "Filtrage par spécialité", "Contactable sur WhatsApp"],
    examples: ["🧹 Ménage à domicile", "🚰 Plomberie", "💡 Électricité", "✂️ Coiffure à domicile", "📚 Cours particuliers", "💻 Dépannage informatique", "📦 Déménagement", "🌿 Jardinage"],
  },
];

const STATS = [
  { value: "100%", label: "Gratuit pour s'inscrire" },
  { value: "24h", label: "Délai d'activation" },
  { value: "🇸🇳", label: "Partout au Sénégal" },
  { value: "∞", label: "Clients potentiels" },
];

export default function PartnersPage() {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const selected = PARTNER_TYPES.find((p) => p.key === selectedType);

  return (
    <div style={{ background: "var(--surface)", minHeight: "100vh", fontFamily: "DM Sans, sans-serif" }}>

      {/* ── HERO ── */}
      <div style={{ background: "linear-gradient(135deg, #0a0a1a 0%, #1a1a3e 50%, #2d1a5e 100%)", padding: "56px 20px 64px", position: "relative", overflow: "hidden", textAlign: "center" }}>
        <div style={{ position: "absolute", top: -80, right: -60, width: 320, height: 320, borderRadius: "50%", background: "radial-gradient(circle, rgba(232,56,13,0.15) 0%, transparent 70%)" }} />
        <div style={{ position: "absolute", bottom: -60, left: -40, width: 260, height: 260, borderRadius: "50%", background: "radial-gradient(circle, rgba(26,158,95,0.12) 0%, transparent 70%)" }} />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 680, margin: "0 auto" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 99, padding: "6px 18px", marginBottom: 24 }}>
            <span>🤝</span>
            <span style={{ color: "#c8d8ff", fontSize: 13, fontWeight: 500 }}>Devenez partenaire Yitewo — Gratuit</span>
          </div>
          <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "clamp(26px,5vw,44px)", color: "#fff", marginBottom: 16, lineHeight: 1.2 }}>
            Développez votre activité<br /><span style={{ color: "var(--brand)" }}>avec Yitewo</span>
          </h1>
          <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 15, lineHeight: 1.7, maxWidth: 520, margin: "0 auto 40px" }}>
            Rejoignez des commerçants, restaurateurs et prestataires qui utilisent Yitewo pour toucher plus de clients partout au Sénégal.
          </p>
          <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
            {STATS.map((s) => (
              <div key={s.label} style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, padding: "12px 20px", textAlign: "center" }}>
                <p style={{ fontFamily: "Syne", fontWeight: 800, fontSize: 20, color: "#fff", marginBottom: 3 }}>{s.value}</p>
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 940, margin: "0 auto", padding: "48px 20px 80px" }}>

        {/* ── SÉLECTION TYPE ── */}
        {!showForm && (
          <>
            <p style={{ fontFamily: "Syne", fontWeight: 700, fontSize: 20, color: "var(--text)", marginBottom: 6, textAlign: "center" }}>
              Quel type de partenaire êtes-vous ?
            </p>
            <p style={{ color: "var(--muted)", fontSize: 14, textAlign: "center", marginBottom: 32 }}>
              Sélectionnez votre profil pour accéder au formulaire adapté.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16, marginBottom: 40 }}>
              {PARTNER_TYPES.map((pt) => {
                const isSelected = selectedType === pt.key;
                return (
                  <button key={pt.key} onClick={() => setSelectedType(isSelected ? null : pt.key)} style={{
                    background: isSelected ? pt.bg : "#fff",
                    borderRadius: 20, border: `2px solid ${isSelected ? pt.color : "var(--border)"}`,
                    padding: "24px 20px", cursor: "pointer", textAlign: "left", transition: "all 0.2s",
                  }}>
                    {/* Header carte */}
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
                      <div style={{ width: 50, height: 50, borderRadius: 14, background: pt.bg, border: `1.5px solid ${pt.color}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>
                        {pt.icon}
                      </div>
                      <div style={{ width: 22, height: 22, borderRadius: "50%", border: `2px solid ${isSelected ? pt.color : "var(--border)"}`, background: isSelected ? pt.color : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {isSelected && <span style={{ color: "#fff", fontSize: 12 }}>✓</span>}
                      </div>
                    </div>

                    <p style={{ fontFamily: "Syne", fontWeight: 700, fontSize: 15, color: "var(--text)", marginBottom: 5 }}>{pt.label}</p>
                    <p style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.5, marginBottom: 16 }}>{pt.desc}</p>

                    {/* Catégories — grille 2 colonnes propre */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5px 8px", marginBottom: 16 }}>
                      {pt.examples.map((ex) => {
                        const emoji = ex.split(" ")[0];
                        const text = ex.split(" ").slice(1).join(" ");
                        return (
                          <div key={ex} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: isSelected ? pt.color : "var(--muted)", fontWeight: isSelected ? 600 : 400 }}>
                            <span style={{ fontSize: 12, flexShrink: 0 }}>{emoji}</span>
                            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{text}</span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Bénéfices */}
                    <div style={{ borderTop: `1px solid ${isSelected ? pt.color + "20" : "var(--border)"}`, paddingTop: 12, display: "flex", flexDirection: "column", gap: 5 }}>
                      {pt.benefits.map((b) => (
                        <div key={b} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: isSelected ? pt.color : "var(--muted)" }}>
                          <span style={{ color: isSelected ? pt.color : "#ccc" }}>✓</span> {b}
                        </div>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>

            <div style={{ textAlign: "center" }}>
              <button
                onClick={() => { if (selectedType) setShowForm(true); }}
                disabled={!selectedType}
                style={{
                  padding: "15px 48px", borderRadius: 99, border: "none",
                  background: selectedType ? "var(--brand)" : "#ccc",
                  color: "#fff", fontFamily: "Syne", fontWeight: 700, fontSize: 15,
                  cursor: selectedType ? "pointer" : "not-allowed", transition: "all 0.2s",
                  boxShadow: selectedType ? "0 8px 28px rgba(232,56,13,0.3)" : "none",
                }}
              >
                {selectedType ? `S'inscrire comme ${selected?.label} →` : "Sélectionnez un type ci-dessus"}
              </button>
            </div>
          </>
        )}

        {/* ── FORMULAIRE ── */}
        {showForm && selected && (
          <div>
            <button onClick={() => setShowForm(false)} style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "none", border: "none", cursor: "pointer", color: "var(--muted)", fontSize: 13, fontWeight: 600, marginBottom: 28, padding: 0 }}>
              ← Changer de profil
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 32 }}>
              <div style={{ width: 54, height: 54, borderRadius: 16, background: selected.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>{selected.icon}</div>
              <div>
                <p style={{ fontFamily: "Syne", fontWeight: 700, fontSize: 19, color: "var(--text)" }}>Inscription — {selected.label}</p>
                <p style={{ fontSize: 13, color: "var(--muted)" }}>Notre équipe vous contacte sous 24h après validation.</p>
              </div>
            </div>
            <div style={{ background: "#fff", borderRadius: 20, border: "1px solid var(--border)", padding: "32px 28px" }}>
              {selected.key === "prestataire"
                ? <ServiceProviderForm />
                : <PartnerForm forcedType={selected.key === "marchand" ? "Marchand" : "Restaurant"} />
              }
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
