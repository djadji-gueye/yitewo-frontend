import Link from "next/link";

const WAVE_NUMBER = "221777259330";

const PLANS = [
  {
    key: "free",
    name: "Essentiel",
    price: 0,
    priceAnnuel: 0,
    icon: "🌱",
    color: "#6b7280",
    bg: "#f9fafb",
    border: "#e5e7eb",
    target: "Pour démarrer et tester la plateforme",
    features: [
      { text: "Profil visible sur Yitewo", ok: true },
      { text: "Jusqu'à 5 produits ou services", ok: true },
      { text: "1 photo par produit", ok: true },
      { text: "Contact client via WhatsApp", ok: true },
      { text: "Badge Partenaire Yitewo", ok: true },
      { text: "Mise en avant dans les résultats", ok: false },
      { text: "Statistiques de visites", ok: false },
      { text: "Badge Pro Vérifié", ok: false },
      { text: "Agent WhatsApp IA", ok: false },
      { text: "Produits illimités", ok: false },
    ],
    cta: "S'inscrire gratuitement",
    ctaHref: "/partners",
    ctaStyle: "outline",
  },
  {
    key: "pro",
    name: "Pro",
    price: 4900,
    priceAnnuel: 49000,
    icon: "🚀",
    color: "#E8380D",
    bg: "#fff8f6",
    border: "#E8380D",
    badge: "LE PLUS POPULAIRE",
    target: "Pour le marchand ou prestataire actif",
    features: [
      { text: "Profil visible sur Yitewo", ok: true },
      { text: "Produits et services illimités", ok: true },
      { text: "Jusqu'à 5 photos par produit", ok: true },
      { text: "Contact client via WhatsApp", ok: true },
      { text: "Badge Pro Vérifié ✓", ok: true },
      { text: "1ère page dans votre catégorie", ok: true },
      { text: "Statistiques de visites et clics", ok: true },
      { text: "Lien portail personnalisé", ok: true },
      { text: "Agent WhatsApp IA", ok: false },
      { text: "Rapport mensuel avancé", ok: false },
    ],
    cta: "Passer au Pro",
    ctaStyle: "solid",
  },
  {
    key: "business",
    name: "Business",
    price: 14900,
    priceAnnuel: 149000,
    icon: "⭐",
    color: "#1A9E5F",
    bg: "#f0fdf6",
    border: "#1A9E5F",
    badge: "TOUT INCLUS",
    target: "Pour restaurant, boutique multi-sites ou prestataire full-time",
    features: [
      { text: "Tout du plan Pro", ok: true },
      { text: "Épinglé EN TÊTE de catégorie", ok: true },
      { text: "Agent WhatsApp IA 24h/7j", ok: true },
      { text: "Catalogue synchronisé WhatsApp", ok: true },
      { text: "Notifications push aux clients", ok: true },
      { text: "Rapport mensuel complet", ok: true },
      { text: "Multi-sites jusqu'à 3 adresses", ok: true },
      { text: "Support prioritaire sous 4h", ok: true },
      { text: "Badge Business Premium", ok: true },
    ],
    cta: "Passer au Business",
    ctaStyle: "solid",
  },
  {
    key: "enterprise",
    name: "Enterprise",
    price: null,
    priceAnnuel: null,
    icon: "🏢",
    color: "#6366f1",
    bg: "#f5f3ff",
    border: "#6366f1",
    target: "Pour chaînes, franchises et grandes enseignes",
    features: [
      { text: "Tout du plan Business", ok: true },
      { text: "Adresses illimitées", ok: true },
      { text: "API Yitewo personnalisée", ok: true },
      { text: "Account manager dédié", ok: true },
      { text: "Publicité sur la homepage", ok: true },
      { text: "Co-branding possible", ok: true },
      { text: "Formation équipe incluse", ok: true },
      { text: "Contrat et facturation mensuelle", ok: true },
      { text: "SLA garanti", ok: true },
    ],
    cta: "Nous contacter",
    ctaHref: `https://wa.me/${WAVE_NUMBER}?text=${encodeURIComponent("Bonjour ! Je souhaite en savoir plus sur le plan Enterprise Yitewo pour mon enseigne.")}`,
    ctaStyle: "outline-colored",
  },
];

const COMPARE_ROWS = [
  { label: "Produits listés", free: "5 max", pro: "Illimités", biz: "Illimités", ent: "Illimités" },
  { label: "Photos par produit", free: "1", pro: "5", biz: "10", ent: "Illimitées" },
  { label: "Position dans les résultats", free: "Standard", pro: "1ère page", biz: "Tête de liste", ent: "Sponsorisé" },
  { label: "Badge visible", free: "Partenaire", pro: "Pro Vérifié ✓", biz: "Business ⭐", ent: "Enterprise 🏢" },
  { label: "Statistiques", free: "—", pro: "Basiques", biz: "Avancées", ent: "Complètes + IA" },
  { label: "Agent WhatsApp IA", free: "—", pro: "—", biz: "✓", ent: "✓ Dédié" },
  { label: "Rapport mensuel", free: "—", pro: "—", biz: "✓", ent: "✓ Personnalisé" },
  { label: "Support", free: "Communauté", pro: "Email", biz: "Prioritaire 4h", ent: "Manager dédié" },
  { label: "Sites / adresses", free: "1", pro: "1", biz: "3", ent: "Illimités" },
];

export default function PricingPage() {
  return (
    <div style={{ background: "var(--surface)", minHeight: "100vh", fontFamily: "DM Sans, sans-serif" }}>

      {/* ── HERO ── */}
      <div style={{
        background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #0d3320 100%)",
        padding: "64px 20px 72px", textAlign: "center",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: -80, right: -60, width: 300, height: 300, borderRadius: "50%", background: "rgba(232,56,13,0.1)" }} />
        <div style={{ position: "absolute", bottom: -60, left: -40, width: 250, height: 250, borderRadius: "50%", background: "rgba(26,158,95,0.08)" }} />

        <div style={{ position: "relative", zIndex: 1, maxWidth: 680, margin: "0 auto" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 99, padding: "5px 16px", marginBottom: 24 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#1A9E5F", display: "inline-block" }} />
            <span style={{ color: "#a8ffd4", fontSize: 12, fontWeight: 600 }}>Inscrivez-vous gratuitement — aucune carte requise</span>
          </div>

          <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "clamp(28px,5vw,48px)", color: "#fff", lineHeight: 1.15, marginBottom: 16 }}>
            Des tarifs simples,<br />
            <span style={{ color: "#E8380D" }}>adaptés au Sénégal</span>
          </h1>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 16, lineHeight: 1.7, marginBottom: 12 }}>
            Commencez gratuitement. Passez au plan supérieur quand vous êtes prêt.
            <br />Payez facilement par <strong style={{ color: "#fff" }}>Wave</strong> ou <strong style={{ color: "#fff" }}>Orange Money</strong>.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "48px 16px 80px" }}>

        {/* ── GRILLE DES PLANS ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px,1fr))", gap: 16, marginBottom: 64 }}>
          {PLANS.map((plan) => (
            <div key={plan.key} style={{
              background: "#fff",
              border: `2px solid ${plan.border}`,
              borderRadius: 22, padding: "28px 22px",
              position: "relative", overflow: "hidden",
              display: "flex", flexDirection: "column",
              boxShadow: plan.key === "pro" ? "0 12px 40px rgba(232,56,13,0.12)" : "0 2px 12px rgba(0,0,0,0.04)",
            }}>
              {plan.badge && (
                <div style={{ position: "absolute", top: 0, right: 0, padding: "5px 14px", background: plan.color, color: "#fff", fontSize: 9, fontWeight: 800, letterSpacing: "0.08em", borderRadius: "0 20px 0 12px" }}>
                  {plan.badge}
                </div>
              )}

              {/* Icon + nom */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <span style={{ fontSize: 28 }}>{plan.icon}</span>
                <span style={{ fontFamily: "Syne", fontWeight: 800, fontSize: 18, color: "#1a1a1a" }}>{plan.name}</span>
              </div>

              <p style={{ fontSize: 12, color: "#888", marginBottom: 18, lineHeight: 1.5 }}>{plan.target}</p>

              {/* Prix */}
              <div style={{ marginBottom: 22 }}>
                {plan.price === null ? (
                  <p style={{ fontFamily: "Syne", fontWeight: 800, fontSize: 26, color: "#1a1a1a" }}>Sur devis</p>
                ) : plan.price === 0 ? (
                  <p style={{ fontFamily: "Syne", fontWeight: 800, fontSize: 26, color: "#1a1a1a" }}>Gratuit</p>
                ) : (
                  <>
                    <p style={{ fontFamily: "Syne", fontWeight: 800, fontSize: 28, color: "#1a1a1a" }}>
                      {plan.price.toLocaleString("fr-FR")}
                      <span style={{ fontSize: 14, fontWeight: 600, color: "#aaa" }}> FCFA/mois</span>
                    </p>
                    <p style={{ fontSize: 11, color: "#10b981", fontWeight: 600, marginTop: 3 }}>
                      ou {plan.priceAnnuel?.toLocaleString("fr-FR")} FCFA/an <span style={{ color: "#aaa", fontWeight: 400 }}>(2 mois offerts)</span>
                    </p>
                  </>
                )}
              </div>

              {/* Features */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1, marginBottom: 22 }}>
                {plan.features.map((f) => (
                  <div key={f.text} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 12, color: f.ok ? "#374151" : "#d1d5db" }}>
                    <span style={{ flexShrink: 0, color: f.ok ? plan.color : "#e5e7eb", fontSize: 13, marginTop: 1 }}>{f.ok ? "✓" : "✗"}</span>
                    {f.text}
                  </div>
                ))}
              </div>

              {/* CTA */}
              {plan.ctaHref ? (
                <a href={plan.ctaHref} target={plan.ctaHref.startsWith("http") ? "_blank" : undefined} rel="noreferrer"
                  style={{
                    display: "block", textAlign: "center", padding: "12px 16px", borderRadius: 12,
                    textDecoration: "none", fontFamily: "Syne", fontWeight: 700, fontSize: 14,
                    background: plan.ctaStyle === "solid" ? plan.color : "transparent",
                    color: plan.ctaStyle === "solid" ? "#fff" : plan.color,
                    border: plan.ctaStyle === "outline" ? `2px solid ${plan.border}` : plan.ctaStyle === "outline-colored" ? `2px solid ${plan.color}` : "none",
                  }}
                >
                  {plan.cta}
                </a>
              ) : (
                <a
                  href={`https://wa.me/${WAVE_NUMBER}?text=${encodeURIComponent(`Bonjour ! Je souhaite souscrire au plan Yitewo ${plan.name} — ${plan.price?.toLocaleString("fr-FR")} FCFA/mois. Je vais envoyer le paiement via Wave.`)}`}
                  target="_blank" rel="noreferrer"
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    padding: "12px 16px", borderRadius: 12, textDecoration: "none",
                    fontFamily: "Syne", fontWeight: 700, fontSize: 14,
                    background: plan.color, color: "#fff",
                  }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="white">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  {plan.cta} via Wave
                </a>
              )}
            </div>
          ))}
        </div>

        {/* ── TABLEAU COMPARATIF ── */}
        <div style={{ background: "#fff", borderRadius: 20, border: "1px solid #f0ebe8", overflow: "hidden", marginBottom: 64 }}>
          <div style={{ padding: "24px 28px", borderBottom: "1px solid #f5f5f5" }}>
            <h2 style={{ fontFamily: "Syne", fontWeight: 800, fontSize: 20, color: "#1a1a1a" }}>
              Comparaison détaillée
            </h2>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 560 }}>
              <thead>
                <tr style={{ background: "#fafaf9" }}>
                  <th style={{ padding: "14px 20px", textAlign: "left", fontSize: 12, color: "#888", fontWeight: 600, borderBottom: "1px solid #f0ebe8" }}>Fonctionnalité</th>
                  {["Essentiel", "Pro", "Business", "Enterprise"].map((h, i) => (
                    <th key={h} style={{ padding: "14px 16px", textAlign: "center", fontSize: 12, fontWeight: 800, color: ["#6b7280", "#E8380D", "#1A9E5F", "#6366f1"][i], borderBottom: "1px solid #f0ebe8" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARE_ROWS.map((row, i) => (
                  <tr key={row.label} style={{ background: i % 2 === 0 ? "#fff" : "#fafaf9" }}>
                    <td style={{ padding: "12px 20px", fontSize: 13, color: "#374151", borderBottom: "1px solid #f5f5f5" }}>{row.label}</td>
                    {[row.free, row.pro, row.biz, row.ent].map((val, j) => (
                      <td key={j} style={{ padding: "12px 16px", textAlign: "center", fontSize: 12, color: val === "—" ? "#ddd" : ["#6b7280", "#E8380D", "#1A9E5F", "#6366f1"][j], fontWeight: val !== "—" ? 600 : 400, borderBottom: "1px solid #f5f5f5" }}>
                        {val}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── PAIEMENT ── */}
        <div style={{ background: "linear-gradient(135deg, #0d3320, #1A9E5F)", borderRadius: 22, padding: "40px 36px", marginBottom: 48, color: "#fff" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 24, flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 300px" }}>
              <h2 style={{ fontFamily: "Syne", fontWeight: 800, fontSize: 22, marginBottom: 12 }}>
                💳 Paiement simple et local
              </h2>
              <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 14, lineHeight: 1.7, marginBottom: 20 }}>
                Pas de carte bancaire requise. Payez directement par Wave ou Orange Money, les moyens de paiement les plus utilisés au Sénégal.
              </p>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <div style={{ padding: "8px 18px", borderRadius: 10, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", fontSize: 13, fontWeight: 600 }}>📱 Wave</div>
                <div style={{ padding: "8px 18px", borderRadius: 10, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", fontSize: 13, fontWeight: 600 }}>🟠 Orange Money</div>
                <div style={{ padding: "8px 18px", borderRadius: 10, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", fontSize: 13, fontWeight: 600 }}>💬 WhatsApp</div>
              </div>
            </div>
            <div style={{ flex: "0 0 auto", display: "flex", flexDirection: "column", gap: 10, alignItems: "center" }}>
              <div style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 14, padding: "20px 28px", textAlign: "center" }}>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", marginBottom: 6 }}>Numéro Wave / OM Yitewo</p>
                <p style={{ fontFamily: "Syne", fontWeight: 800, fontSize: 22 }}>+221 77 069 80 80</p>
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 6 }}>Activation sous 24h garantie</p>
              </div>
              <a
                href={`https://wa.me/${WAVE_NUMBER}?text=${encodeURIComponent("Bonjour ! Je veux m'abonner à Yitewo. Pouvez-vous m'aider à choisir le bon plan ?")}`}
                target="_blank" rel="noreferrer"
                style={{ display: "flex", alignItems: "center", gap: 8, padding: "11px 22px", borderRadius: 10, background: "#25D366", textDecoration: "none", color: "#fff", fontFamily: "Syne", fontWeight: 700, fontSize: 13 }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                Nous contacter sur WhatsApp
              </a>
            </div>
          </div>
        </div>

        {/* ── FAQ ── */}
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <h2 style={{ fontFamily: "Syne", fontWeight: 800, fontSize: 22, color: "var(--text)", textAlign: "center", marginBottom: 32 }}>
            Questions fréquentes
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {[
              { q: "Est-ce vraiment gratuit pour commencer ?", r: "Oui, 100%. Vous créez votre profil, listez jusqu'à 5 produits ou services et recevez des contacts clients sans débourser un franc. Aucune carte bancaire requise." },
              { q: "Comment se passe l'activation après paiement ?", r: "Vous envoyez le montant via Wave ou Orange Money au +221 77 069 80 80, puis vous nous envoyez un message WhatsApp avec votre nom et votre plan. Notre équipe active votre compte sous 24 heures et vous envoie une confirmation." },
              { q: "Puis-je passer du Gratuit au Pro à tout moment ?", r: "Oui, à n'importe quel moment. Envoyez un message à notre équipe WhatsApp, effectuez le paiement du premier mois et votre plan est upgradé sous 24 heures." },
              { q: "Que se passe-t-il si je ne renouvelle pas ?", r: "Votre profil reste visible gratuitement sur Yitewo, mais vous repassez automatiquement au plan Essentiel — sans mise en avant premium ni fonctionnalités avancées." },
              { q: "Proposez-vous des réductions pour les associations ou ONG ?", r: "Oui. Contactez-nous directement sur WhatsApp avec votre situation — nous étudions chaque demande au cas par cas." },
            ].map((faq, i) => (
              <div key={i} style={{ background: "#fff", borderRadius: 14, padding: "20px 22px", marginBottom: 10, border: "1px solid #f0ebe8" }}>
                <p style={{ fontFamily: "Syne", fontWeight: 700, fontSize: 14, color: "#1a1a1a", marginBottom: 8 }}>❓ {faq.q}</p>
                <p style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.7 }}>{faq.r}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── CTA FINAL ── */}
        <div style={{ textAlign: "center", marginTop: 56 }}>
          <p style={{ fontFamily: "Syne", fontWeight: 800, fontSize: 24, color: "var(--text)", marginBottom: 10 }}>
            Prêt à développer votre activité ?
          </p>
          <p style={{ color: "var(--muted)", fontSize: 15, marginBottom: 28 }}>
            Rejoignez des centaines de partenaires qui font confiance à Yitewo.
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/partners" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 32px", borderRadius: 99, background: "#E8380D", color: "#fff", textDecoration: "none", fontFamily: "Syne", fontWeight: 700, fontSize: 15, boxShadow: "0 8px 28px rgba(232,56,13,0.3)" }}>
              🚀 Commencer gratuitement
            </Link>
            <a href={`https://wa.me/${WAVE_NUMBER}?text=${encodeURIComponent("Bonjour ! Je voudrais en savoir plus sur Yitewo et les abonnements disponibles.")}`} target="_blank" rel="noreferrer"
              style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 32px", borderRadius: 99, background: "#fff", color: "#1a1a1a", textDecoration: "none", fontFamily: "Syne", fontWeight: 700, fontSize: 15, border: "1.5px solid #e5e7eb" }}>
              💬 Parler à l'équipe
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
