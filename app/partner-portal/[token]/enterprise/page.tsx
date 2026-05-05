"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { usePlan } from "@/hooks/usePlan";
import Link from "next/link";

const BASE = process.env.NEXT_PUBLIC_URL_PROD || "http://localhost:3003";
const ACCOUNT_MANAGER_WA = "221777259330";

export default function EnterprisePage() {
  const params = useParams();
  const token = params?.token as string;
  const [partner, setPartner] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    fetch(`${BASE}/partners/portal/${token}`)
      .then(r => r.json())
      .then(setPartner)
      .finally(() => setLoading(false));
  }, [token]);

  const planInfo = usePlan(partner?.plan || "free");

  if (loading) return <div style={{ padding: 40, textAlign: "center", color: "#aaa" }}>Chargement…</div>;

  // Gate Enterprise uniquement
  if (!planInfo.isEnterprise) return (
    <div style={{ maxWidth: 520, margin: "0 auto", padding: 28 }}>
      <div style={{ background: "linear-gradient(135deg, #1e1b4b, #312e81)", borderRadius: 20, padding: "40px 32px", textAlign: "center" }}>
        <div style={{ fontSize: 52, marginBottom: 16 }}>🏢</div>
        <h2 style={{ fontFamily: "Syne", fontWeight: 800, fontSize: 20, color: "#fff", marginBottom: 10 }}>
          Plan Enterprise
        </h2>
        <p style={{ color: "#a5b4fc", fontSize: 14, lineHeight: 1.7, marginBottom: 24 }}>
          Pour chaînes, franchises et grandes enseignes. Tarif sur devis personnalisé.
        </p>
        <a
          href={`https://wa.me/${ACCOUNT_MANAGER_WA}?text=${encodeURIComponent("Bonjour ! Je souhaite passer au plan Enterprise Yitewo. Pouvez-vous me faire un devis ?")}`}
          target="_blank" rel="noreferrer"
          style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 28px", borderRadius: 99, background: "#6366f1", color: "#fff", textDecoration: "none", fontFamily: "Syne", fontWeight: 700, fontSize: 14 }}
        >
          💬 Contacter l'équipe commerciale
        </a>
      </div>
    </div>
  );

  const apiKey = token; // Le token est la clé API du partenaire

  return (
    <div style={{ maxWidth: 700, fontFamily: "DM Sans, sans-serif" }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "Syne", fontWeight: 800, fontSize: 22, color: "#1a1a1a", marginBottom: 4 }}>
          🏢 Espace Enterprise
        </h1>
        <p style={{ fontSize: 13, color: "#aaa" }}>Vos services dédiés grands comptes</p>
      </div>

      {/* 1. API Yitewo personnalisée */}
      <Section title="🔌 API Yitewo personnalisée" color="#6366f1">
        <p style={{ fontSize: 13, color: "#6b6b6b", marginBottom: 16, lineHeight: 1.6 }}>
          Intégrez Yitewo directement dans vos outils (ERP, site web, caisse). Votre clé API unique ci-dessous.
        </p>
        <div style={{ background: "#f5f3ff", border: "1px solid #c7d2fe", borderRadius: 10, padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
          <code style={{ fontSize: 12, color: "#4338ca", wordBreak: "break-all", flex: 1 }}>
            {apiKey}
          </code>
          <CopyButton value={apiKey} />
        </div>
        <p style={{ fontSize: 11, color: "#aaa", marginTop: 8 }}>
          Documentation API disponible sur demande. Contactez votre account manager.
        </p>
        <a
          href={`https://wa.me/${ACCOUNT_MANAGER_WA}?text=${encodeURIComponent(`Bonjour ! Je suis ${partner?.name} (Enterprise). Je veux accéder à la documentation API Yitewo.`)}`}
          target="_blank" rel="noreferrer"
          style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 12, padding: "9px 18px", borderRadius: 99, background: "#6366f1", color: "#fff", textDecoration: "none", fontSize: 12, fontWeight: 700 }}
        >
          📖 Demander la documentation
        </a>
      </Section>

      {/* 2. Publicité homepage */}
      <Section title="📢 Publicité sur la homepage" color="#E8380D">
        <p style={{ fontSize: 13, color: "#6b6b6b", marginBottom: 12, lineHeight: 1.6 }}>
          Votre enseigne est mise en avant dans la section Enterprise de la page boutiques Yitewo, visible par tous les visiteurs.
        </p>
        <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "10px 14px", marginBottom: 12 }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: "#dc2626" }}>✅ Actif — votre bannière Enterprise est visible sur /shop</p>
        </div>
        <p style={{ fontSize: 12, color: "#6b6b6b", lineHeight: 1.6 }}>
          Pour modifier le visuel ou le texte de votre bannière, contactez votre account manager.
        </p>
        <a
          href={`https://wa.me/${ACCOUNT_MANAGER_WA}?text=${encodeURIComponent(`Bonjour ! Je suis ${partner?.name} (Enterprise). Je veux modifier ma bannière homepage.`)}`}
          target="_blank" rel="noreferrer"
          style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 10, padding: "9px 18px", borderRadius: 99, background: "#E8380D", color: "#fff", textDecoration: "none", fontSize: 12, fontWeight: 700 }}
        >
          🎨 Personnaliser ma bannière
        </a>
      </Section>

      {/* 3. Co-branding */}
      <Section title="🤝 Co-branding Yitewo" color="#0ea5e9">
        <p style={{ fontSize: 13, color: "#6b6b6b", marginBottom: 12, lineHeight: 1.6 }}>
          Affichez le logo Yitewo sur vos supports marketing et bénéficiez d'une mise en avant commune sur nos réseaux sociaux.
        </p>
        <a
          href={`https://wa.me/${ACCOUNT_MANAGER_WA}?text=${encodeURIComponent(`Bonjour ! Je suis ${partner?.name} (Enterprise). Je souhaite activer le co-branding Yitewo.`)}`}
          target="_blank" rel="noreferrer"
          style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 18px", borderRadius: 99, background: "#0ea5e9", color: "#fff", textDecoration: "none", fontSize: 12, fontWeight: 700 }}
        >
          💬 Discuter du co-branding
        </a>
      </Section>

      {/* 4. Adresses illimitées */}
      <Section title="📍 Adresses illimitées" color="#f59e0b">
        <p style={{ fontSize: 13, color: "#6b6b6b", marginBottom: 12, lineHeight: 1.6 }}>
          Gérez toutes vos enseignes et points de vente sous un seul compte Yitewo, sans limitation.
        </p>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#fef3c7", border: "1px solid #fcd34d", borderRadius: 10, padding: "8px 14px", marginBottom: 12 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: "#92400e" }}>🚧 Configuration manuelle disponible — contactez votre account manager</span>
        </div>
        <br />
        <a
          href={`https://wa.me/${ACCOUNT_MANAGER_WA}?text=${encodeURIComponent(`Bonjour ! Je suis ${partner?.name} (Enterprise). Je veux configurer mes adresses multiples.`)}`}
          target="_blank" rel="noreferrer"
          style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 10, padding: "9px 18px", borderRadius: 99, background: "#f59e0b", color: "#fff", textDecoration: "none", fontSize: 12, fontWeight: 700 }}
        >
          📍 Ajouter mes adresses
        </a>
      </Section>

      {/* 5. Account manager + Formation + Contrat + SLA */}
      <Section title="🎯 Votre account manager dédié" color="#10b981">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
          {[
            { icon: "👤", label: "Account Manager", desc: "Interlocuteur dédié joignable directement" },
            { icon: "🎓", label: "Formation équipe", desc: "Session de formation incluse à l'onboarding" },
            { icon: "📄", label: "Contrat & facturation", desc: "Contrat mensuel + facture officielle" },
            { icon: "⚡", label: "SLA garanti", desc: "Temps de réponse garanti contractuellement" },
          ].map(({ icon, label, desc }) => (
            <div key={label} style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: "12px 14px" }}>
              <p style={{ fontSize: 18, marginBottom: 4 }}>{icon}</p>
              <p style={{ fontSize: 12, fontWeight: 700, color: "#065f46" }}>{label}</p>
              <p style={{ fontSize: 11, color: "#6b7280", lineHeight: 1.5 }}>{desc}</p>
            </div>
          ))}
        </div>
        <a
          href={`https://wa.me/${ACCOUNT_MANAGER_WA}?text=${encodeURIComponent(`Bonjour ! Je suis ${partner?.name} (Enterprise). Je veux contacter mon account manager.`)}`}
          target="_blank" rel="noreferrer"
          style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 22px", borderRadius: 99, background: "#10b981", color: "#fff", textDecoration: "none", fontFamily: "Syne", fontWeight: 700, fontSize: 13 }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
          Contacter mon account manager
        </a>
      </Section>
    </div>
  );
}

function Section({ title, color, children }: { title: string; color: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #f0ebe8", borderRadius: 16, padding: "22px 24px", marginBottom: 16, borderLeft: `4px solid ${color}` }}>
      <h2 style={{ fontFamily: "Syne", fontWeight: 700, fontSize: 15, color: "#1a1a1a", marginBottom: 14 }}>{title}</h2>
      {children}
    </div>
  );
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      style={{ padding: "6px 14px", borderRadius: 8, border: "none", background: copied ? "#10b981" : "#6366f1", color: "#fff", fontSize: 11, fontWeight: 700, cursor: "pointer", flexShrink: 0, transition: "background 0.2s" }}
    >
      {copied ? "✓ Copié" : "Copier"}
    </button>
  );
}
