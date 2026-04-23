import Link from "next/link";

// ── Données ──────────────────────────────────────────────

const STATS = [
  { value: "14", unit: "régions", label: "couvertes au Sénégal" },
  { value: "3", unit: "piliers", label: "commerce · services · opportunités" },
  { value: "24h", unit: "activation", label: "après inscription partenaire" },
  { value: "0", unit: "commission", label: "au lancement" },
];

const OFFERS = [
  {
    icon: "🛒", label: "Boutiques & Marchands",
    desc: "Épiceries, supérettes, alimentation générale. Commandez directement auprès des marchands de votre quartier.",
    features: ["Catalogue produits en ligne", "Commande directe", "Livraison ou retrait"],
    href: "/boutiques", grad: "linear-gradient(135deg,#0c4a6e,#0369a1)",
    color: "#0369a1", bg: "#e0f2fe",
  },
  {
    icon: "🍽️", label: "Restaurants & Snacks",
    desc: "Thiéboudienne, yassa, maffé… Commandez vos plats préférés auprès des restaurants de votre ville.",
    features: ["Menus détaillés", "Commande en ligne", "Plats locaux authentiques"],
    href: "/shop", grad: "linear-gradient(135deg,#78350f,#b45309)",
    color: "#b45309", bg: "#fef3c7",
  },
  {
    icon: "🔧", label: "Services à domicile",
    desc: "Plombier, électricien, ménage, coiffeur. Trouvez un prestataire qualifié près de chez vous.",
    features: ["Prestataires vérifiés", "Devis en ligne", "Intervention rapide"],
    href: "/services", grad: "linear-gradient(135deg,#064e3b,#10b981)",
    color: "#065f46", bg: "#d1fae5",
  },
  {
    icon: "💼", label: "Opportunités",
    desc: "Emploi, immobilier, formation, commerce. Publiez ou trouvez des annonces partout au Sénégal.",
    features: ["Annonces immobilières", "Offres d'emploi", "Formation & commerce"],
    href: "/opportunities", grad: "linear-gradient(135deg,#4c1d95,#7c3aed)",
    color: "#6d28d9", bg: "#ede9fe",
  },
];

const HOW_CLIENT = [
  { n: "01", icon: "🔍", t: "Cherchez près de vous", d: "Saisissez ce dont vous avez besoin — une épicerie, un plombier, un appartement. La carte vous montre ce qui est disponible dans votre quartier." },
  { n: "02", icon: "📱", t: "Contactez ou commandez", d: "Passez votre commande directement en ligne ou contactez le prestataire via WhatsApp. Simple, sans application à installer." },
  { n: "03", icon: "✅", t: "Recevez ou soyez servi", d: "Votre commande est confirmée, votre prestataire intervient. Partout au Sénégal, de Dakar à Ziguinchor." },
];

const HOW_PARTNER = [
  { n: "01", icon: "📝", t: "Inscrivez votre activité", d: "Remplissez le formulaire en 5 minutes — nom, type, localisation, contact. Aucun document complexe requis au départ." },
  { n: "02", icon: "✔️", t: "Validation sous 24h", d: "Notre équipe examine votre dossier et vous envoie votre lien d'espace partenaire personnel par email dès validation." },
  { n: "03", icon: "🚀", t: "Soyez visible dès le premier jour", d: "Ajoutez vos produits, votre photo, votre description. Vous apparaissez immédiatement sur la carte et dans les résultats de recherche." },
];

const PARTNER_TYPES = [
  { icon: "🏪", label: "Marchand", desc: "Épicerie, supérette, alimentation, boutique de quartier", color: "#0369a1", bg: "#e0f2fe" },
  { icon: "🍴", label: "Restaurant", desc: "Cuisine locale, fast-food, snack, traiteur", color: "#b45309", bg: "#fef3c7" },
  { icon: "👷", label: "Prestataire", desc: "Artisan, technicien, service à domicile, beauté", color: "#065f46", bg: "#d1fae5" },
  { icon: "📢", label: "Annonceur", desc: "Immobilier, emploi, formation, commerce", color: "#6d28d9", bg: "#ede9fe" },
];

const TESTIMONIALS = [
  { name: "Keur Arame", type: "Marchand · Médina", text: "Depuis que je suis sur Yitewo, des clients que je ne connaissais pas me trouvent. J'ai reçu mes premières commandes en dehors de mon quartier.", avatar: "K" },
  { name: "Chez Mama", type: "Restaurant · Ouest-Foire", text: "Mon menu est maintenant visible en ligne. Les clients peuvent commander directement sans appeler. C'est beaucoup plus simple pour moi.", avatar: "C" },
  { name: "Micou Services", type: "Prestataire · Yoff", text: "Je reçois des demandes de services de quartiers que je n'aurais jamais connus avant. Yitewo m'a ouvert de nouveaux marchés.", avatar: "M" },
];

const CITIES = ["Dakar", "Thiès", "Saint-Louis", "Ziguinchor", "Kaolack", "Touba", "Mbour", "Rufisque", "Louga", "Diourbel", "Tambacounda", "Kolda", "Matam", "Kaffrine", "Kédougou"];

const SECURITY = [
  { icon: "🪪", t: "Identité vérifiée", d: "Chaque prestataire doit fournir une photo réelle et une preuve de son activité avant d'être activé." },
  { icon: "⭐", t: "Avis clients", d: "Après chaque service, les clients notent et laissent un avis. Seuls les prestataires fiables restent visibles." },
  { icon: "📍", t: "Localisation précise", d: "Chaque partenaire est géolocalisé. Vous voyez exactement où il se trouve sur la carte." },
  { icon: "📞", t: "Contact direct", d: "Pas d'intermédiaire. Vous contactez directement le marchand ou prestataire via WhatsApp." },
];

export default function HomePage() {
  return (
    <div style={{ background: "var(--surface)", minHeight: "100vh", fontFamily: "DM Sans, sans-serif" }}>

      {/* JSON-LD SEO */}
      <script id="yitewo-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "WebSite", name: "Yitewo", url: "https://yitewo.com", description: "La marketplace de proximité sénégalaise", publisher: { "@type": "Organization", name: "Yitewo", url: "https://yitewo.com", logo: { "@type": "ImageObject", url: "https://yitewo.com/logo.jpg" }, address: { "@type": "PostalAddress", addressCountry: "SN", addressLocality: "Dakar" }, sameAs: ["https://www.facebook.com/yitewo", "https://www.tiktok.com/@yitewo_com"] } }) }} />

      {/* ══════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════ */}
      <section style={{ background: "linear-gradient(135deg, #0a0a0a 0%, #1a0800 50%, #2d0f00 100%)", padding: "80px 20px 96px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -100, right: -80, width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(232,56,13,0.15) 0%, transparent 70%)" }} />
        <div style={{ position: "absolute", bottom: -60, left: -60, width: 320, height: 320, borderRadius: "50%", background: "radial-gradient(circle, rgba(16,185,129,0.10) 0%, transparent 70%)" }} />

        <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 99, padding: "6px 18px", marginBottom: 28 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#10b981", display: "inline-block", boxShadow: "0 0 8px #10b981" }} />
            <span style={{ color: "#a8ffd4", fontSize: 13, fontWeight: 600 }}>Plateforme disponible partout au Sénégal 🇸🇳</span>
          </div>

          <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "clamp(36px, 6vw, 66px)", color: "#fff", lineHeight: 1.08, marginBottom: 22, letterSpacing: "-1px" }}>
            <span style={{ color: "#E8380D" }}>Yitewo</span><br />
            <span style={{ color: "rgba(255,255,255,0.9)", fontSize: "clamp(22px, 4vw, 42px)", fontWeight: 700 }}>
              La marketplace de votre quartier
            </span>
          </h1>

          <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 18, lineHeight: 1.7, marginBottom: 14, maxWidth: 600, margin: "0 auto 14px" }}>
            Boutiques, restaurants, prestataires de services et opportunités — tout ce dont vous avez besoin, près de chez vous, en un seul endroit.
          </p>
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 14, marginBottom: 48 }}>
            Dakar · Thiès · Saint-Louis · Ziguinchor · et partout au Sénégal
          </p>

          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", marginBottom: 56 }}>
            <Link href="/boutiques" style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "#E8380D", color: "#fff", padding: "16px 38px", borderRadius: 99, textDecoration: "none", fontFamily: "Syne", fontWeight: 700, fontSize: 15, boxShadow: "0 8px 32px rgba(232,56,13,0.35)" }}>
              🛒 Trouver une boutique
            </Link>
            <Link href="/partners/apply" style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", padding: "16px 38px", borderRadius: 99, textDecoration: "none", fontFamily: "Syne", fontWeight: 700, fontSize: 15 }}>
              🤝 Devenir partenaire
            </Link>
          </div>

          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 1, background: "rgba(255,255,255,0.06)", borderRadius: 16, overflow: "hidden", maxWidth: 700, margin: "0 auto" }}>
            {STATS.map((s) => (
              <div key={s.unit} style={{ padding: "20px 16px", textAlign: "center", background: "rgba(255,255,255,0.03)" }}>
                <div style={{ fontFamily: "Syne", fontWeight: 800, fontSize: 28, color: "#E8380D", lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#fff", marginTop: 2 }}>{s.unit}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 2, lineHeight: 1.4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          4 PILIERS — CE QUE PROPOSE YITEWO
      ══════════════════════════════════════════════════ */}
      <section style={{ maxWidth: 1140, margin: "0 auto", padding: "80px 20px 0" }}>
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <span style={{ display: "inline-block", padding: "4px 16px", borderRadius: 99, background: "#fff5f3", color: "#E8380D", fontSize: 12, fontWeight: 700, marginBottom: 14 }}>CE QU'ON PROPOSE</span>
          <h2 style={{ fontFamily: "Syne", fontWeight: 800, fontSize: "clamp(24px,3.5vw,36px)", color: "var(--text)", marginBottom: 12, lineHeight: 1.2 }}>
            Tout ce dont vous avez besoin,<br />en un seul endroit
          </h2>
          <p style={{ color: "var(--muted)", fontSize: 16, maxWidth: 520, margin: "0 auto" }}>
            Yitewo connecte les habitants du Sénégal aux commerces et services locaux. Quatre univers, une seule plateforme.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
          {OFFERS.map((o) => (
            <Link key={o.label} href={o.href} style={{ textDecoration: "none" }}>
              <div className="product-card" style={{ background: "#fff", borderRadius: 20, border: "1px solid var(--border)", overflow: "hidden", height: "100%", display: "flex", flexDirection: "column" }}>
                {/* Cover */}
                <div style={{ height: 110, background: o.grad, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 28px", position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", top: -30, right: -30, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.07)" }} />
                  <span style={{ fontSize: 42 }}>{o.icon}</span>
                  <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 99, padding: "5px 14px", fontSize: 11, color: "#fff", fontWeight: 700 }}>Explorer →</div>
                </div>
                {/* Body */}
                <div style={{ padding: "20px 22px 24px", flex: 1, display: "flex", flexDirection: "column" }}>
                  <h3 style={{ fontFamily: "Syne", fontWeight: 800, fontSize: 16, color: "var(--text)", marginBottom: 8 }}>{o.label}</h3>
                  <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6, marginBottom: 16, flex: 1 }}>{o.desc}</p>
                  {/* Features */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {o.features.map((f) => (
                      <div key={f} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 18, height: 18, borderRadius: "50%", background: o.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 10 }}>✓</div>
                        <span style={{ fontSize: 12, color: o.color, fontWeight: 600 }}>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          COMMENT ÇA MARCHE — CLIENT
      ══════════════════════════════════════════════════ */}
      <section style={{ maxWidth: 1140, margin: "0 auto", padding: "80px 20px 0" }}>
        <div style={{ background: "#fff", borderRadius: 24, border: "1px solid var(--border)", overflow: "hidden" }}>
          {/* Header */}
          <div style={{ background: "linear-gradient(135deg, #0a0a1a, #16213e)", padding: "36px 40px" }}>
            <span style={{ display: "inline-block", padding: "4px 14px", borderRadius: 99, background: "rgba(255,255,255,0.1)", color: "#c8d8ff", fontSize: 12, fontWeight: 600, marginBottom: 12 }}>POUR LES HABITANTS</span>
            <h2 style={{ fontFamily: "Syne", fontWeight: 800, fontSize: "clamp(20px,3vw,28px)", color: "#fff", marginBottom: 8 }}>
              Trouvez ce qu'il vous faut en 3 étapes
            </h2>
            <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14 }}>Sans inscription, sans application à télécharger.</p>
          </div>
          {/* Steps */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 0 }}>
            {HOW_CLIENT.map((h, i) => (
              <div key={h.n} style={{ padding: "32px 28px", borderRight: i < HOW_CLIENT.length - 1 ? "1px solid var(--border)" : "none", position: "relative" }}>
                <div style={{ fontFamily: "Syne", fontWeight: 900, fontSize: 48, color: "rgba(0,0,0,0.04)", position: "absolute", top: 16, right: 20, lineHeight: 1 }}>{h.n}</div>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: i === 0 ? "#fff5f3" : i === 1 ? "#fef3c7" : "#d1fae5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, marginBottom: 16 }}>{h.icon}</div>
                <h3 style={{ fontFamily: "Syne", fontWeight: 700, fontSize: 15, color: "var(--text)", marginBottom: 8 }}>{h.t}</h3>
                <p style={{ color: "var(--muted)", fontSize: 13, lineHeight: 1.6 }}>{h.d}</p>
              </div>
            ))}
          </div>
          {/* CTA */}
          <div style={{ padding: "24px 40px", borderTop: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <p style={{ fontSize: 14, color: "var(--muted)" }}>Prêt à trouver ce qu'il vous faut ?</p>
            <div style={{ display: "flex", gap: 10 }}>
              <Link href="/boutiques" style={{ padding: "10px 22px", borderRadius: 99, background: "#E8380D", color: "#fff", textDecoration: "none", fontFamily: "Syne", fontWeight: 700, fontSize: 13 }}>Voir les boutiques</Link>
              <Link href="/services" style={{ padding: "10px 22px", borderRadius: 99, border: "1px solid var(--border)", color: "var(--text)", textDecoration: "none", fontFamily: "Syne", fontWeight: 600, fontSize: 13 }}>Trouver un service</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          COMMENT ÇA MARCHE — PARTENAIRE
      ══════════════════════════════════════════════════ */}
      <section style={{ maxWidth: 1140, margin: "0 auto", padding: "40px 20px 0" }}>
        <div style={{ background: "#fff", borderRadius: 24, border: "1px solid var(--border)", overflow: "hidden" }}>
          <div style={{ background: "linear-gradient(135deg, #0d1f0a, #1A9E5F)", padding: "36px 40px" }}>
            <span style={{ display: "inline-block", padding: "4px 14px", borderRadius: 99, background: "rgba(255,255,255,0.12)", color: "#d1fae5", fontSize: 12, fontWeight: 600, marginBottom: 12 }}>POUR LES PARTENAIRES</span>
            <h2 style={{ fontFamily: "Syne", fontWeight: 800, fontSize: "clamp(20px,3vw,28px)", color: "#fff", marginBottom: 8 }}>
              Rejoindre Yitewo en 3 étapes simples
            </h2>
            <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14 }}>Gratuit au lancement · 0 commission · Activé sous 24h.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 0 }}>
            {HOW_PARTNER.map((h, i) => (
              <div key={h.n} style={{ padding: "32px 28px", borderRight: i < HOW_PARTNER.length - 1 ? "1px solid var(--border)" : "none", position: "relative" }}>
                <div style={{ fontFamily: "Syne", fontWeight: 900, fontSize: 48, color: "rgba(0,0,0,0.04)", position: "absolute", top: 16, right: 20, lineHeight: 1 }}>{h.n}</div>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: "#d1fae5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, marginBottom: 16 }}>{h.icon}</div>
                <h3 style={{ fontFamily: "Syne", fontWeight: 700, fontSize: 15, color: "var(--text)", marginBottom: 8 }}>{h.t}</h3>
                <p style={{ color: "var(--muted)", fontSize: 13, lineHeight: 1.6 }}>{h.d}</p>
              </div>
            ))}
          </div>
          <div style={{ padding: "24px 40px", borderTop: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <p style={{ fontSize: 14, color: "var(--muted)" }}>Votre activité mérite d'être visible.</p>
            <Link href="/partners/apply" style={{ padding: "10px 22px", borderRadius: 99, background: "#1A9E5F", color: "#fff", textDecoration: "none", fontFamily: "Syne", fontWeight: 700, fontSize: 13 }}>
              S'inscrire gratuitement →
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          TYPES DE PARTENAIRES
      ══════════════════════════════════════════════════ */}
      <section style={{ maxWidth: 1140, margin: "0 auto", padding: "80px 20px 0" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <span style={{ display: "inline-block", padding: "4px 16px", borderRadius: 99, background: "#d1fae5", color: "#065f46", fontSize: 12, fontWeight: 700, marginBottom: 14 }}>VOUS AVEZ UNE ACTIVITÉ ?</span>
          <h2 style={{ fontFamily: "Syne", fontWeight: 800, fontSize: "clamp(22px,3vw,32px)", color: "var(--text)", marginBottom: 12 }}>
            Yitewo est fait pour vous
          </h2>
          <p style={{ color: "var(--muted)", fontSize: 15, maxWidth: 480, margin: "0 auto" }}>
            Quel que soit votre type d'activité, Yitewo vous offre une vitrine digitale pour attirer de nouveaux clients.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
          {PARTNER_TYPES.map((p) => (
            <div key={p.label} style={{ background: "#fff", borderRadius: 20, border: "1px solid var(--border)", overflow: "hidden" }}>
              <div style={{ height: 8, background: p.color }} />
              <div style={{ padding: "24px 22px 28px" }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: p.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, marginBottom: 14 }}>{p.icon}</div>
                <h3 style={{ fontFamily: "Syne", fontWeight: 700, fontSize: 16, color: "var(--text)", marginBottom: 6 }}>{p.label}</h3>
                <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6, marginBottom: 16 }}>{p.desc}</p>
                <Link href="/partners/apply" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, color: p.color, textDecoration: "none" }}>
                  Rejoindre le réseau →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          SÉCURITÉ & CONFIANCE
      ══════════════════════════════════════════════════ */}
      <section style={{ maxWidth: 1140, margin: "0 auto", padding: "80px 20px 0" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, alignItems: "center" }}>
          <div>
            <span style={{ display: "inline-block", padding: "4px 14px", borderRadius: 99, background: "#fff3f0", color: "#E8380D", fontSize: 12, fontWeight: 700, marginBottom: 16 }}>SÉCURITÉ & CONFIANCE</span>
            <h2 style={{ fontFamily: "Syne", fontWeight: 800, fontSize: "clamp(22px,3vw,32px)", color: "var(--text)", marginBottom: 14, lineHeight: 1.2 }}>
              Des prestataires vérifiés,<br />des clients protégés
            </h2>
            <p style={{ color: "var(--muted)", fontSize: 15, lineHeight: 1.7, marginBottom: 28 }}>
              La sécurité de nos utilisateurs est notre priorité. Chaque prestataire est vérifié avant d'apparaître sur la plateforme. Vous pouvez faire confiance aux partenaires Yitewo.
            </p>
            <Link href="/services" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 24px", borderRadius: 99, background: "#E8380D", color: "#fff", textDecoration: "none", fontFamily: "Syne", fontWeight: 700, fontSize: 13 }}>
              Voir les prestataires →
            </Link>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {SECURITY.map((s) => (
              <div key={s.t} style={{ background: "#fff", borderRadius: 16, border: "1px solid var(--border)", padding: "20px 18px" }}>
                <div style={{ fontSize: 26, marginBottom: 10 }}>{s.icon}</div>
                <h4 style={{ fontFamily: "Syne", fontWeight: 700, fontSize: 13, color: "var(--text)", marginBottom: 6 }}>{s.t}</h4>
                <p style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.5 }}>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          TÉMOIGNAGES
      ══════════════════════════════════════════════════ */}
      <section style={{ maxWidth: 1140, margin: "0 auto", padding: "80px 20px 0" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <span style={{ display: "inline-block", padding: "4px 14px", borderRadius: 99, background: "#fef3c7", color: "#b45309", fontSize: 12, fontWeight: 700, marginBottom: 14 }}>ILS FONT CONFIANCE À YITEWO</span>
          <h2 style={{ fontFamily: "Syne", fontWeight: 800, fontSize: "clamp(22px,3vw,30px)", color: "var(--text)" }}>
            Nos premiers partenaires témoignent
          </h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
          {TESTIMONIALS.map((t) => (
            <div key={t.name} style={{ background: "#fff", borderRadius: 20, border: "1px solid var(--border)", padding: "28px 24px" }}>
              <div style={{ fontSize: 20, color: "#E8380D", marginBottom: 14, letterSpacing: 2 }}>★★★★★</div>
              <p style={{ fontSize: 14, color: "var(--text)", lineHeight: 1.7, marginBottom: 20, fontStyle: "italic" }}>"{t.text}"</p>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg, #E8380D, #ff6b3d)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Syne", fontWeight: 800, fontSize: 16, color: "#fff" }}>{t.avatar}</div>
                <div>
                  <p style={{ fontFamily: "Syne", fontWeight: 700, fontSize: 14, color: "var(--text)", margin: 0 }}>{t.name}</p>
                  <p style={{ fontSize: 12, color: "var(--muted)", margin: 0 }}>{t.type}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          COUVERTURE NATIONALE
      ══════════════════════════════════════════════════ */}
      <section style={{ maxWidth: 1140, margin: "0 auto", padding: "80px 20px 0" }}>
        <div style={{ background: "linear-gradient(135deg, #0a0a1a 0%, #16213e 100%)", borderRadius: 24, padding: "52px 48px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", right: -60, top: -60, width: 280, height: 280, borderRadius: "50%", background: "rgba(232,56,13,0.08)" }} />
          <div style={{ position: "absolute", left: -40, bottom: -40, width: 200, height: 200, borderRadius: "50%", background: "rgba(16,185,129,0.06)" }} />
          <div style={{ position: "relative", zIndex: 1, maxWidth: 600, marginBottom: 36 }}>
            <span style={{ display: "inline-block", padding: "4px 14px", borderRadius: 99, background: "rgba(255,255,255,0.08)", color: "#c8d8ff", fontSize: 12, fontWeight: 600, marginBottom: 16 }}>🇸🇳 COUVERTURE NATIONALE</span>
            <h2 style={{ fontFamily: "Syne", fontWeight: 800, fontSize: "clamp(22px,3vw,32px)", color: "#fff", marginBottom: 12, lineHeight: 1.2 }}>
              Partout au Sénégal,<br />dans chaque quartier
            </h2>
            <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 15, lineHeight: 1.7 }}>
              Yitewo est disponible dans les 14 régions du Sénégal. Vous habitez une ville non encore couverte ? Inscrivez votre activité et soyez pionnier dans votre région.
            </p>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", position: "relative", zIndex: 1 }}>
            {CITIES.map((city) => (
              <span key={city} style={{ padding: "7px 16px", borderRadius: 99, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#bbb", fontSize: 13, fontWeight: 500 }}>
                📍 {city}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          CTA FINAL
      ══════════════════════════════════════════════════ */}
      <section style={{ maxWidth: 1140, margin: "0 auto", padding: "80px 20px" }}>
        <div style={{ background: "#E8380D", borderRadius: 24, padding: "56px 48px", textAlign: "center", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -60, right: -60, width: 240, height: 240, borderRadius: "50%", background: "rgba(255,255,255,0.07)" }} />
          <div style={{ position: "relative", zIndex: 1 }}>
            <h2 style={{ fontFamily: "Syne", fontWeight: 800, fontSize: "clamp(24px,4vw,40px)", color: "#fff", marginBottom: 14, lineHeight: 1.2 }}>
              Rejoignez le mouvement Yitewo
            </h2>
            <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 16, lineHeight: 1.7, maxWidth: 500, margin: "0 auto 36px" }}>
              Ensemble, digitalisons l'économie locale sénégalaise. Que vous soyez client ou commerçant, votre place est sur Yitewo.
            </p>
            <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/boutiques" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#fff", color: "#E8380D", padding: "15px 36px", borderRadius: 99, textDecoration: "none", fontFamily: "Syne", fontWeight: 800, fontSize: 15 }}>
                🛒 Trouver une boutique
              </Link>
              <Link href="/partners/apply" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", color: "#fff", padding: "15px 36px", borderRadius: 99, textDecoration: "none", fontFamily: "Syne", fontWeight: 700, fontSize: 15 }}>
                🤝 Inscrire mon activité
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}