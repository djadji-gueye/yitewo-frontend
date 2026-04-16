import Link from "next/link";

const OFFERS = [
  { icon: "🛒", label: "Boutiques", desc: "Épiceries, marchands locaux", href: "/order", color: "#e0f2fe", grad: "linear-gradient(135deg,#0c4a6e,#0ea5e9)" },
  { icon: "🗺️", label: "Carte", desc: "Boutiques près de chez vous", href: "/boutiques", color: "#fce7f3", grad: "linear-gradient(135deg,#831843,#db2777)" },
  { icon: "🍽️", label: "Restaurants", desc: "Repas chauds, snacks, plats locaux", href: "/order", color: "#fef3c7", grad: "linear-gradient(135deg,#78350f,#f59e0b)" },
  { icon: "🔧", label: "Services", desc: "Plombier, ménage, électricien…", href: "/services", color: "#d1fae5", grad: "linear-gradient(135deg,#064e3b,#10b981)" },
  { icon: "💼", label: "Opportunités", desc: "Emploi, commerce, formation", href: "/opportunities", color: "#ede9fe", grad: "linear-gradient(135deg,#4c1d95,#8b5cf6)" },
];

const HOW = [
  { step: "01", icon: "🔍", title: "Trouvez ce qu'il vous faut", desc: "Parcourez boutiques, restaurants, services et opportunités autour de vous." },
  { step: "02", icon: "📝", title: "Faites votre demande", desc: "Commandez, réservez ou contactez directement le prestataire en quelques secondes." },
  { step: "03", icon: "✅", title: "Profitez du service", desc: "Recevez votre commande ou votre prestation, partout au Sénégal." },
];

const PARTNERS_TYPES = [
  { icon: "🏪", label: "Marchands", desc: "Épiceries, supérettes, boutiques de quartier" },
  { icon: "🍴", label: "Restaurants", desc: "Cuisine locale, fast-food, traiteurs" },
  { icon: "👷", label: "Prestataires", desc: "Artisans, techniciens, services à domicile" },
  { icon: "💡", label: "Annonceurs", desc: "Opportunités d'emploi, immobilier, formation" },
];

export default function HomePage() {
  return (
    <div style={{ background: "var(--surface)", minHeight: "100vh", fontFamily: "DM Sans, sans-serif" }}>

      {/* ✅ JSON-LD SEO */}
      <script
        id="yitewo-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "Yitewo",
            url: "https://yitewo.com",
            description: "La marketplace de proximité sénégalaise",
            potentialAction: {
              "@type": "SearchAction",
              target: {
                "@type": "EntryPoint",
                urlTemplate:
                  "https://yitewo.com/boutiques?q={search_term_string}",
              },
              "query-input": "required name=search_term_string",
            },
            publisher: {
              "@type": "Organization",
              name: "Yitewo",
              url: "https://yitewo.com",
              logo: {
                "@type": "ImageObject",
                url: "https://yitewo.com/logo.png",
              },
              contactPoint: {
                "@type": "ContactPoint",
                telephone: "+221-77-725-93-30",
                contactType: "customer service",
                areaServed: "SN",
                availableLanguage: ["French", "Wolof"],
              },
              address: {
                "@type": "PostalAddress",
                addressCountry: "SN",
                addressLocality: "Dakar",
              },
              sameAs: [
                "https://www.facebook.com/yitewo",
                "https://www.tiktok.com/@yitewo_com",
                "https://www.instagram.com/yitewo_com",
              ],
            },
          }),
        }}
      />

      {/* ── HERO ── */}
      <section style={{
        background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 40%, #16213e 70%, #0f3460 100%)",
        padding: "72px 20px 88px",
        position: "relative", overflow: "hidden",
      }}>
        {/* Orbes décoratifs */}
        <div style={{ position: "absolute", top: -100, right: -80, width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(232,56,13,0.18) 0%, transparent 70%)" }} />
        <div style={{ position: "absolute", bottom: -80, left: -60, width: 320, height: 320, borderRadius: "50%", background: "radial-gradient(circle, rgba(26,158,95,0.15) 0%, transparent 70%)" }} />
        <div style={{ position: "absolute", top: "30%", left: "50%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(100,100,255,0.06) 0%, transparent 70%)", transform: "translateX(-50%)" }} />

        <div style={{ maxWidth: 760, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1 }}>
          {/* Badge */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 99, padding: "6px 18px", marginBottom: 28 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#1A9E5F", display: "inline-block", boxShadow: "0 0 8px #1A9E5F" }} />
            <span style={{ color: "#a8ffd4", fontSize: 13, fontWeight: 600 }}>Plateforme disponible partout au Sénégal</span>
          </div>

          <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "clamp(34px, 6vw, 62px)", color: "#fff", lineHeight: 1.1, marginBottom: 20 }}>
            <span style={{ color: "var(--brand)" }}>Yitewo</span> —{" "}
            <span style={{ background: "linear-gradient(90deg, #fff 0%, #c8d8ff 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              j'ai besoin
            </span>
          </h1>

          <p style={{ color: "rgba(255,255,255,0.68)", fontSize: 18, lineHeight: 1.7, marginBottom: 16, maxWidth: 580, margin: "0 auto 16px" }}>
            La plateforme sénégalaise qui connecte les habitants avec les boutiques, restaurants et prestataires de services de leur quartier.
          </p>
          <p style={{ color: "rgba(255,255,255,0.42)", fontSize: 14, marginBottom: 44 }}>
            Dakar · Thiès · Saint-Louis · Ziguinchor · et partout au Sénégal 🇸🇳
          </p>

          {/* CTAs */}
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/order" style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "var(--brand)", color: "#fff", padding: "15px 36px", borderRadius: 99, textDecoration: "none", fontFamily: "Syne", fontWeight: 700, fontSize: 15, boxShadow: "0 8px 32px rgba(232,56,13,0.4)", transition: "transform 0.2s" }}>
              🛒 Voir les boutiques
            </Link>
            <Link href="/services" style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", padding: "15px 36px", borderRadius: 99, textDecoration: "none", fontFamily: "Syne", fontWeight: 700, fontSize: 15, backdropFilter: "blur(10px)" }}>
              🔧 Services à domicile
            </Link>
          </div>
        </div>
      </section>

      {/* ── CE QU'ON PROPOSE ── */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "64px 20px 0" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <p style={{ fontFamily: "Syne", fontWeight: 800, fontSize: "clamp(22px,3vw,32px)", color: "var(--text)", marginBottom: 10 }}>
            Tout ce dont vous avez besoin
          </p>
          <p style={{ color: "var(--muted)", fontSize: 15, maxWidth: 480, margin: "0 auto" }}>
            En un seul endroit, trouvez produits, repas, services et opportunités.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: 16 }}>
          {OFFERS.map((o) => (
            <Link key={o.label} href={o.href} style={{ textDecoration: "none" }}>
              <div className="product-card" style={{ background: "#fff", borderRadius: 20, border: "1px solid var(--border)", overflow: "hidden", height: "100%" }}>
                <div style={{ height: 90, background: o.grad, display: "flex", alignItems: "center", padding: "0 24px", position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", top: -20, right: -20, width: 80, height: 80, borderRadius: "50%", background: "rgba(255,255,255,0.1)" }} />
                  <span style={{ fontSize: 38 }}>{o.icon}</span>
                </div>
                <div style={{ padding: "18px 20px 20px" }}>
                  <p style={{ fontFamily: "Syne", fontWeight: 700, fontSize: 15, color: "var(--text)", marginBottom: 5 }}>{o.label}</p>
                  <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.5, marginBottom: 14 }}>{o.desc}</p>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "var(--brand)" }}>Explorer →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── COMMENT ÇA MARCHE ── */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "72px 20px 0" }} id="how">
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <p style={{ fontFamily: "Syne", fontWeight: 800, fontSize: "clamp(20px,3vw,30px)", color: "var(--text)", marginBottom: 8 }}>Comment ça marche ?</p>
          <p style={{ color: "var(--muted)", fontSize: 14 }}>Simple, rapide, efficace.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 20 }}>
          {HOW.map((h, i) => (
            <div key={h.step} style={{ background: "#fff", borderRadius: 20, border: "1px solid var(--border)", padding: "28px 24px", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 16, right: 16, fontFamily: "Syne", fontWeight: 900, fontSize: 42, color: "rgba(0,0,0,0.04)" }}>{h.step}</div>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: i === 0 ? "var(--brand-light)" : i === 1 ? "#fef3c7" : "#d1fae5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, marginBottom: 16 }}>{h.icon}</div>
              <p style={{ fontFamily: "Syne", fontWeight: 700, fontSize: 16, color: "var(--text)", marginBottom: 8 }}>{h.title}</p>
              <p style={{ color: "var(--muted)", fontSize: 13, lineHeight: 1.6 }}>{h.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── ZONE DE COUVERTURE ── */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "72px 20px 0" }}>
        <div style={{
          background: "linear-gradient(135deg, #0a0a1a 0%, #16213e 100%)",
          borderRadius: 24, padding: "48px 40px",
          display: "flex", alignItems: "center", gap: 40, flexWrap: "wrap",
          position: "relative", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", right: -40, top: -40, width: 220, height: 220, borderRadius: "50%", background: "rgba(232,56,13,0.1)" }} />
          <div style={{ flex: "1 1 300px", position: "relative", zIndex: 1 }}>
            <span style={{ display: "inline-block", padding: "4px 14px", borderRadius: 99, background: "rgba(255,255,255,0.08)", color: "#c8d8ff", fontSize: 12, fontWeight: 600, marginBottom: 16 }}>🇸🇳 Couverture nationale</span>
            <h2 style={{ fontFamily: "Syne", fontWeight: 800, fontSize: "clamp(20px,3vw,30px)", color: "#fff", marginBottom: 12, lineHeight: 1.3 }}>
              Partout au Sénégal,<br />dans votre quartier
            </h2>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, lineHeight: 1.7, marginBottom: 24 }}>
              Yitewo n'est plus limité à deux villes. Notre réseau de partenaires couvre progressivement tout le territoire. Vous habitez une ville non encore couverte ? Rejoignez le réseau et soyez pionnier !
            </p>
            <Link href="/partners/apply" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "var(--brand)", color: "#fff", padding: "12px 24px", borderRadius: 99, textDecoration: "none", fontFamily: "Syne", fontWeight: 700, fontSize: 13 }}>
              Devenir partenaire →
            </Link>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", flex: "0 0 auto", position: "relative", zIndex: 1 }}>
            {["📍 Dakar", "📍 Thiès", "📍 Saint-Louis", "📍 Ziguinchor", "📍 Kaolack", "📍 Touba", "📍 Mbour", "📍 Et plus…"].map((city) => (
              <span key={city} style={{ padding: "7px 16px", borderRadius: 99, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", color: "#ccc", fontSize: 13, fontWeight: 500 }}>
                {city}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── REJOINDRE LE RÉSEAU ── */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "72px 20px" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <p style={{ fontFamily: "Syne", fontWeight: 800, fontSize: "clamp(20px,3vw,30px)", color: "var(--text)", marginBottom: 8 }}>Vous avez une activité ?</p>
          <p style={{ color: "var(--muted)", fontSize: 15, maxWidth: 500, margin: "0 auto" }}>Rejoignez Yitewo et donnez de la visibilité à votre activité auprès de milliers de sénégalais.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14, marginBottom: 36 }}>
          {PARTNERS_TYPES.map((p) => (
            <div key={p.label} style={{ background: "#fff", borderRadius: 16, border: "1px solid var(--border)", padding: "22px 18px", textAlign: "center" }}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>{p.icon}</div>
              <p style={{ fontFamily: "Syne", fontWeight: 700, fontSize: 14, color: "var(--text)", marginBottom: 5 }}>{p.label}</p>
              <p style={{ color: "var(--muted)", fontSize: 12, lineHeight: 1.5 }}>{p.desc}</p>
            </div>
          ))}
        </div>
        <div style={{ textAlign: "center" }}>
          <Link href="/partners/apply" style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "var(--brand)", color: "#fff", padding: "14px 36px", borderRadius: 99, textDecoration: "none", fontFamily: "Syne", fontWeight: 700, fontSize: 15, boxShadow: "0 8px 28px rgba(232,56,13,0.3)" }}>
            🤝 Rejoindre le réseau Yitewo
          </Link>
        </div>
      </section>

    </div>
  );
}
