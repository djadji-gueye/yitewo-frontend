import Link from "next/link";

// ── Photos Unsplash — contexte sénégalais, boutiques locales, personnages noirs ─────
// Toutes libres de droits (Unsplash License)
// Vérifier visuellement chaque URL avant usage en production

// Hero : rue commerçante animée, boutiques colorées Afrique de l'Ouest
const HERO_BG =
  "https://images.unsplash.com/photo-1687422808248-f807f4ea2a2e?w=1600&q=80&auto=format&fit=crop";

// ── PHOTO GRID — 3 univers boutiques sénégalaises ─────────────────────────────
const PHOTO_GRID = [
  {
    // Boutique cosmétiques / soins — produits beauté colorés
    url: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&q=80&auto=format&fit=crop",
    label: "Cosmétiques & Beauté",
    city: "Dakar · Médina",
    tag: "Soins · Parfums · Maquillage",
  },
  {
    // Boutique habillement / tissus wax africains colorés
    url: "https://images.unsplash.com/photo-1552710307-537199cd41c0?w=600&q=80&auto=format&fit=crop",
    label: "Mode & Habillement",
    city: "Dakar · Sandaga",
    tag: "Wax · Bazin · Prêt-à-porter",
  },
  {
    // Épicerie / alimentation locale — produits frais
    url: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80&auto=format&fit=crop",
    label: "Alimentation locale",
    city: "Dakar · Grand Yoff",
    tag: "Épicerie · Fruits · Céréales",
  },
];

// ── BOUTIQUES EN VEDETTE — mini cartes produits sénégalaises ─────────────────
const FEATURED_SHOPS = [
  {
    name: "Beauté Aminata",
    category: "Cosmétiques & Soins",
    location: "Médina, Dakar",
    icon: "💄",
    color: "#be185d",
    bg: "#fdf2f8",
    badge: "Top vendeur",
    photo: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500&q=80&auto=format&fit=crop",
    items: ["Crèmes hydratantes", "Parfums Arabes", "Maquillage", "Soins naturels"],
    rating: 4.9,
    orders: "230+ commandes",
  },
  {
    name: "Mode Dakar",
    category: "Habillement & Wax",
    location: "Sandaga, Dakar",
    icon: "👗",
    color: "#b45309",
    bg: "#fef3c7",
    badge: "Nouveau",
    photo: "https://images.unsplash.com/photo-1587047744199-afd4d2e3bbc0?w=500&q=80&auto=format&fit=crop",
    items: ["Boubous", "Robes wax", "Bazin brodé", "Accessoires"],
    rating: 4.7,
    orders: "184 commandes",
  },
  {
    name: "Épicerie Ndoye",
    category: "Alimentation & Épicerie",
    location: "Grand Yoff, Dakar",
    icon: "🛒",
    color: "#0369a1",
    bg: "#e0f2fe",
    badge: "Livraison rapide",
    photo: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&q=80&auto=format&fit=crop",
    items: ["Riz local", "Légumes frais", "Huile de palme", "Céréales"],
    rating: 4.8,
    orders: "412 commandes",
  },
  {
    name: "Salon Fatou Beauty",
    category: "Salon de coiffure",
    location: "Plateau, Dakar",
    icon: "✂️",
    color: "#065f46",
    bg: "#d1fae5",
    badge: "Sur rendez-vous",
    photo: "https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=500&q=80&auto=format&fit=crop",
    items: ["Tresses africaines", "Tissage", "Soins capillaires", "Coupe femme"],
    rating: 5.0,
    orders: "97 RDV ce mois",
  },
  {
    name: "Resto Chez Mama",
    category: "Restaurant local",
    location: "Ouakam, Dakar",
    icon: "🍽️",
    color: "#7c3aed",
    bg: "#ede9fe",
    badge: "Plat du jour",
    photo: "https://images.unsplash.com/photo-1567529692333-de9fd6772897?w=500&q=80&auto=format&fit=crop",
    items: ["Thiéboudienne", "Yassa poulet", "Maffé", "Soupe kandia"],
    rating: 4.9,
    orders: "Ouvert 8h–22h",
  },
  {
    name: "Pharma & Santé",
    category: "Pharmacie & Parapharmacie",
    location: "Rufisque, Dakar",
    icon: "💊",
    color: "#0891b2",
    bg: "#e0f7fa",
    badge: "Certifié",
    photo: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&q=80&auto=format&fit=crop",
    items: ["Médicaments OTC", "Vitamines", "Matériel médical", "Soins bébé"],
    rating: 4.6,
    orders: "Disponible 24h/7j",
  },
];

// ── Données générales ─────────────────────────────────────────────────────────
const STATS = [
  { value: "14", unit: "régions", label: "couvertes au Sénégal" },
  { value: "500+", unit: "boutiques", label: "partenaires actifs" },
  { value: "24h", unit: "activation", label: "après inscription partenaire" },
  { value: "0%", unit: "commission", label: "au lancement" },
];

const OFFERS = [
  {
    icon: "💄",
    label: "Cosmétiques & Beauté",
    desc: "Crèmes, parfums, maquillage, soins capillaires. Les meilleures boutiques beauté de votre quartier, disponibles en ligne.",
    features: ["Produits authentiques", "Marques locales & importées", "Livraison à domicile"],
    href: "/boutiques?cat=cosmetique",
    grad: "linear-gradient(135deg,#831843,#be185d)",
    color: "#be185d",
    bg: "#fdf2f8",
    photo: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&q=80&auto=format&fit=crop",
  },
  {
    icon: "👗",
    label: "Mode & Habillement",
    desc: "Boubous, robes wax, bazin brodé, prêt-à-porter africain. La mode sénégalaise à portée de clic.",
    features: ["Wax & Bazin authentiques", "Tailles sur mesure", "Artisans locaux"],
    href: "/boutiques?cat=mode",
    grad: "linear-gradient(135deg,#78350f,#b45309)",
    color: "#b45309",
    bg: "#fef3c7",
    photo: "https://images.unsplash.com/photo-1552710307-537199cd41c0?w=600&q=80&auto=format&fit=crop",
  },
  {
    icon: "🛒",
    label: "Alimentation & Épicerie",
    desc: "Riz, légumes frais, céréales, huiles. Commandez directement chez les épiciers et supérettes de votre quartier.",
    features: ["Produits locaux frais", "Commande directe", "Livraison ou retrait"],
    href: "/boutiques?cat=alimentation",
    grad: "linear-gradient(135deg,#0c4a6e,#0369a1)",
    color: "#0369a1",
    bg: "#e0f2fe",
    photo: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&q=80&auto=format&fit=crop",
  },
  {
    icon: "🔧",
    label: "Services à domicile",
    desc: "Plombier, électricien, coiffeur à domicile, ménage. Trouvez un prestataire qualifié près de chez vous.",
    features: ["Prestataires vérifiés", "Devis en ligne", "Intervention rapide"],
    href: "/services",
    grad: "linear-gradient(135deg,#064e3b,#10b981)",
    color: "#065f46",
    bg: "#d1fae5",
    photo: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&q=80&auto=format&fit=crop",
  },
];

const CATEGORIES = [
  { icon: "💄", label: "Cosmétiques", count: "87 boutiques", color: "#be185d", bg: "#fdf2f8", href: "/boutiques?cat=cosmetique" },
  { icon: "👗", label: "Mode & Wax", count: "124 boutiques", color: "#b45309", bg: "#fef3c7", href: "/boutiques?cat=mode" },
  { icon: "🛒", label: "Alimentation", count: "203 boutiques", color: "#0369a1", bg: "#e0f2fe", href: "/boutiques?cat=alimentation" },
  { icon: "✂️", label: "Coiffure & Beauté", count: "65 salons", color: "#065f46", bg: "#d1fae5", href: "/services?cat=coiffure" },
  { icon: "🍽️", label: "Restaurants", count: "98 restos", color: "#7c3aed", bg: "#ede9fe", href: "/boutiques?cat=restaurant" },
  { icon: "💊", label: "Pharmacie", count: "42 pharmacies", color: "#0891b2", bg: "#e0f7fa", href: "/boutiques?cat=pharmacie" },
  { icon: "📱", label: "Électronique", count: "56 boutiques", color: "#374151", bg: "#f3f4f6", href: "/boutiques?cat=electronique" },
  { icon: "🏠", label: "Maison & Déco", count: "38 boutiques", color: "#b91c1c", bg: "#fee2e2", href: "/boutiques?cat=maison" },
];

const HOW_CLIENT = [
  { n: "01", icon: "🔍", t: "Cherchez près de vous", d: "Saisissez ce dont vous avez besoin — une cosmétique, un boubou, un plombier. La carte vous montre ce qui est disponible dans votre quartier." },
  { n: "02", icon: "📱", t: "Contactez ou commandez", d: "Passez votre commande directement en ligne ou contactez la boutique via WhatsApp. Simple, sans application à installer." },
  { n: "03", icon: "✅", t: "Recevez ou venez retirer", d: "Votre commande est confirmée, la boutique prépare votre colis. Partout au Sénégal, de Dakar à Ziguinchor." },
];

const HOW_PARTNER = [
  { n: "01", icon: "📝", t: "Inscrivez votre boutique", d: "Remplissez le formulaire en 5 minutes — nom, type d'activité, localisation, contact. Aucun document complexe requis au départ." },
  { n: "02", icon: "✔️", t: "Validation sous 24h", d: "Notre équipe examine votre dossier et vous envoie votre lien d'espace partenaire personnel par email dès validation." },
  { n: "03", icon: "🚀", t: "Soyez visible dès le premier jour", d: "Ajoutez vos produits, votre photo, votre description. Vous apparaissez immédiatement sur la carte et dans les résultats de recherche." },
];

const TESTIMONIALS = [
  {
    name: "Aminata Diallo",
    type: "Boutique cosmétiques · Médina, Dakar",
    photo: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=200&q=80&auto=format&fit=crop&crop=face",
    color: "#be185d",
    bg: "#fdf2f8",
    stats: "230 commandes ce mois",
    text: "Depuis Yitewo, mes produits cosmétiques touchent des clientes au-delà de la Médina. J'ai doublé mes ventes en 2 mois sans changer mon stock.",
  },
  {
    name: "Moussa Ndoye",
    type: "Restaurateur thiéboudienne · Plateau, Dakar",
    photo: "https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?w=200&q=80&auto=format&fit=crop&crop=face",
    color: "#7c3aed",
    bg: "#ede9fe",
    stats: "Plat du jour vendu chaque matin",
    text: "J'affiche mon thiéboudienne du jour et je reçois des commandes avant même d'ouvrir. Les clients arrivent de quartiers que je ne connaissais pas.",
  },
  {
    name: "Fatou Seck",
    type: "Boutique mode wax · Sandaga, Dakar",
    photo: "https://images.unsplash.com/photo-1580894894513-541e068a3e2b?w=200&q=80&auto=format&fit=crop&crop=face",
    color: "#b45309",
    bg: "#fef3c7",
    stats: "184 commandes · 4.9★",
    text: "Mes boubous et tissus wax sont maintenant commandés en ligne. Des clientes de Thiès et Saint-Louis me trouvent via Yitewo. C'est incroyable.",
  },
  {
    name: "Ibrahima Baldé",
    type: "Épicerie générale · Touba",
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80&auto=format&fit=crop&crop=face",
    color: "#0369a1",
    bg: "#e0f2fe",
    stats: "412 commandes · Touba",
    text: "Avant Yitewo, mes clients c'était uniquement le voisinage. Maintenant toute la ville commande chez moi. Zéro commission, c'est ce qui m'a convaincu.",
  },
];

const CITIES = ["Dakar", "Thiès", "Saint-Louis", "Ziguinchor", "Kaolack", "Touba", "Mbour", "Rufisque", "Louga", "Diourbel", "Tambacounda", "Kolda", "Matam", "Kaffrine", "Kédougou"];

const SECURITY = [
  { icon: "🪪", t: "Identité vérifiée", d: "Chaque boutique doit fournir une photo réelle et une preuve de son activité avant d'être activée." },
  { icon: "⭐", t: "Avis clients", d: "Après chaque commande, les clients notent et laissent un avis. Seules les boutiques fiables restent visibles." },
  { icon: "📍", t: "Localisation précise", d: "Chaque boutique est géolocalisée. Vous voyez exactement où elle se trouve sur la carte." },
  { icon: "📞", t: "Contact direct WhatsApp", d: "Pas d'intermédiaire. Vous contactez directement la boutique ou le prestataire." },
];

// Bande partenaires : tissus wax colorés / mode sénégalaise
const IMMERSIVE_BG =
  "https://images.unsplash.com/photo-1552710307-8d1c604d6319?w=1600&q=80&auto=format&fit=crop";
// CTA final : cosmétiques / produits beauté
const CTA_BG =
  "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1400&q=80&auto=format&fit=crop";

export default function HomePage() {
  return (
    <div style={{ background: "var(--surface)", minHeight: "100vh", fontFamily: "DM Sans, sans-serif" }}>

      {/* JSON-LD SEO */}
      <script
        id="yitewo-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "Yitewo",
            url: "https://yitewo.com",
            description: "La marketplace de proximité sénégalaise — cosmétiques, mode, alimentation, services",
            publisher: {
              "@type": "Organization",
              name: "Yitewo",
              url: "https://yitewo.com",
              logo: { "@type": "ImageObject", url: "https://yitewo.com/logo.jpg" },
              address: { "@type": "PostalAddress", addressCountry: "SN", addressLocality: "Dakar" },
              sameAs: ["https://www.facebook.com/yitewo", "https://www.tiktok.com/@yitewo_com"],
            },
          }),
        }}
      />

      {/* ══════════════════════════════════════════════════
          HERO — Photo full-bleed, boutiques sénégalaises
      ══════════════════════════════════════════════════ */}
      <section style={{ position: "relative", minHeight: "92vh", display: "flex", alignItems: "center", overflow: "hidden" }}>
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: `url(${HERO_BG})`,
          backgroundSize: "cover",
          backgroundPosition: "center 40%",
          filter: "brightness(0.42)",
        }} />
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(135deg, rgba(10,4,0,0.90) 0%, rgba(26,8,0,0.68) 55%, rgba(232,56,13,0.20) 100%)",
        }} />

        <div style={{ maxWidth: 1140, margin: "0 auto", padding: "120px 24px 100px", position: "relative", zIndex: 1, width: "100%" }}>
          {/* Badge live */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.14)", borderRadius: 99, padding: "6px 18px", marginBottom: 32 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#10b981", display: "inline-block", boxShadow: "0 0 10px #10b981" }} />
            <span style={{ color: "#a8ffd4", fontSize: 13, fontWeight: 600, letterSpacing: "0.02em" }}>Boutiques, restaurants, services — disponibles partout 🇸🇳</span>
          </div>

          <h1 style={{
            fontFamily: "Syne, sans-serif", fontWeight: 800,
            fontSize: "clamp(38px, 7vw, 76px)",
            color: "#fff", lineHeight: 1.0,
            marginBottom: 28, letterSpacing: "-2px", maxWidth: 820,
          }}>
            Cosmétiques, mode,<br />
            <span style={{ color: "#E8380D" }}>épicerie… tout Dakar</span><br />
            <span style={{ color: "rgba(255,255,255,0.70)", fontWeight: 700, fontSize: "0.68em" }}>dans votre téléphone.</span>
          </h1>

          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 18, lineHeight: 1.75, marginBottom: 40, maxWidth: 540 }}>
            Boutiques de quartier, salons de coiffure, restaurants locaux —
            commandez depuis notre application installable, sans passer par un store, payez à la livraison, partout au Sénégal.
          </p>

          {/* Catégories rapides hero */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 40 }}>
            {["💄 Cosmétiques", "👗 Mode & Wax", "🛒 Épicerie", "✂️ Coiffure", "🍽️ Restaurants"].map((cat) => (
              <Link
                key={cat}
                href="/boutiques"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.18)",
                  color: "#fff", padding: "8px 18px", borderRadius: 99,
                  textDecoration: "none", fontSize: 13, fontWeight: 600,
                }}
              >
                {cat}
              </Link>
            ))}
          </div>

          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 72 }}>
            <Link href="/boutiques" style={{
              display: "inline-flex", alignItems: "center", gap: 10,
              background: "#E8380D", color: "#fff",
              padding: "16px 38px", borderRadius: 99,
              textDecoration: "none", fontFamily: "Syne", fontWeight: 700, fontSize: 15,
              boxShadow: "0 8px 32px rgba(232,56,13,0.42)",
            }}>
              🛒 Explorer les boutiques
            </Link>
            <Link href="/partners/apply" style={{
              display: "inline-flex", alignItems: "center", gap: 10,
              background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.22)",
              color: "#fff", padding: "16px 38px", borderRadius: 99,
              textDecoration: "none", fontFamily: "Syne", fontWeight: 700, fontSize: 15,
            }}>
              🤝 Devenir partenaire
            </Link>
          </div>

          {/* Stats */}
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
            gap: 1, background: "rgba(255,255,255,0.06)",
            borderRadius: 16, overflow: "hidden", maxWidth: 680,
            border: "1px solid rgba(255,255,255,0.08)",
          }}>
            {STATS.map((s) => (
              <div key={s.unit} style={{ padding: "22px 16px", textAlign: "center", background: "rgba(255,255,255,0.025)" }}>
                <div style={{ fontFamily: "Syne", fontWeight: 800, fontSize: 28, color: "#E8380D", lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#fff", marginTop: 3 }}>{s.unit}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 2, lineHeight: 1.4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ position: "absolute", bottom: 32, left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, opacity: 0.35 }}>
          <span style={{ fontSize: 10, color: "#fff", letterSpacing: "0.18em", textTransform: "uppercase" }}>Découvrir</span>
          <div style={{ width: 1, height: 36, background: "rgba(255,255,255,0.4)" }} />
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          CATÉGORIES — Grille de navigation rapide
      ══════════════════════════════════════════════════ */}
      <section style={{ maxWidth: 1140, margin: "0 auto", padding: "72px 20px 0" }}>
        <div style={{ textAlign: "center", marginBottom: 44 }}>
          <span style={{ display: "inline-block", padding: "4px 16px", borderRadius: 99, background: "#fff5f3", color: "#E8380D", fontSize: 12, fontWeight: 700, marginBottom: 14, letterSpacing: "0.08em" }}>PARCOURIR PAR CATÉGORIE</span>
          <h2 style={{ fontFamily: "Syne", fontWeight: 800, fontSize: "clamp(22px,3vw,34px)", color: "var(--text)", marginBottom: 10, lineHeight: 1.15 }}>
            Toutes les boutiques de votre quartier
          </h2>
          <p style={{ color: "var(--muted)", fontSize: 15, maxWidth: 460, margin: "0 auto" }}>
            De la cosmétique au wax, de l'épicerie à la pharmacie — Yitewo regroupe tout le commerce local sénégalais.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
          {CATEGORIES.map((c) => (
            <Link key={c.label} href={c.href} style={{ textDecoration: "none" }}>
              <div style={{
                background: "#fff", borderRadius: 16,
                border: `1.5px solid ${c.color}22`,
                padding: "20px 18px",
                display: "flex", alignItems: "center", gap: 14,
              }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: c.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>{c.icon}</div>
                <div>
                  <div style={{ fontFamily: "Syne", fontWeight: 700, fontSize: 14, color: "var(--text)", marginBottom: 2 }}>{c.label}</div>
                  <div style={{ fontSize: 12, color: c.color, fontWeight: 600 }}>{c.count}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          PHOTO GRID — 3 univers boutiques sénégalaises
      ══════════════════════════════════════════════════ */}
      <section style={{ maxWidth: 1140, margin: "0 auto", padding: "72px 20px 0" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <span style={{ display: "inline-block", padding: "4px 16px", borderRadius: 99, background: "#fff5f3", color: "#E8380D", fontSize: 12, fontWeight: 700, marginBottom: 14, letterSpacing: "0.08em" }}>LE SÉNÉGAL QUI BOUGE</span>
          <h2 style={{ fontFamily: "Syne", fontWeight: 800, fontSize: "clamp(24px,3.5vw,38px)", color: "var(--text)", lineHeight: 1.15, marginBottom: 12 }}>
            Des boutiques réelles,<br />près de chez vous
          </h2>
          <p style={{ color: "var(--muted)", fontSize: 16, maxWidth: 480, margin: "0 auto" }}>
            Cosmétiques, mode wax, alimentation — Yitewo connecte les Sénégalais aux vrais commerces de leur quartier.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {PHOTO_GRID.map((p, i) => (
            <Link key={i} href="/boutiques" style={{ textDecoration: "none" }}>
              <div style={{ position: "relative", borderRadius: 20, overflow: "hidden", aspectRatio: "3/4", boxShadow: "0 8px 32px rgba(0,0,0,0.12)" }}>
                <img src={p.url} alt={p.label} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0) 52%)" }} />
                <div style={{ position: "absolute", bottom: 20, left: 20, right: 20 }}>
                  <div style={{ display: "inline-block", background: "#E8380D", color: "#fff", fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 99, marginBottom: 8 }}>{p.tag}</div>
                  <p style={{ fontFamily: "Syne", fontWeight: 800, color: "#fff", fontSize: 17, marginBottom: 4 }}>{p.label}</p>
                  <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 12 }}>📍 {p.city}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          BOUTIQUES EN VEDETTE — Cartes produits
      ══════════════════════════════════════════════════ */}
      <section style={{ maxWidth: 1140, margin: "0 auto", padding: "72px 20px 0" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 44, flexWrap: "wrap", gap: 16 }}>
          <div>
            <span style={{ display: "inline-block", padding: "4px 16px", borderRadius: 99, background: "#fff5f3", color: "#E8380D", fontSize: 12, fontWeight: 700, marginBottom: 14 }}>BOUTIQUES EN VEDETTE</span>
            <h2 style={{ fontFamily: "Syne", fontWeight: 800, fontSize: "clamp(22px,3vw,34px)", color: "var(--text)", marginBottom: 8, lineHeight: 1.2 }}>
              Découvrez les meilleures<br />boutiques du moment
            </h2>
            <p style={{ color: "var(--muted)", fontSize: 15, maxWidth: 440 }}>Sélectionnées par notre équipe pour leur qualité et fiabilité.</p>
          </div>
          <Link href="/boutiques" style={{ padding: "10px 24px", borderRadius: 99, border: "1px solid var(--border)", color: "var(--text)", textDecoration: "none", fontFamily: "Syne", fontWeight: 600, fontSize: 13, whiteSpace: "nowrap" }}>
            Voir toutes les boutiques →
          </Link>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
          {FEATURED_SHOPS.map((shop) => (
            <div key={shop.name} style={{ background: "#fff", borderRadius: 20, border: "1px solid var(--border)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
              {/* Photo boutique */}
              <div style={{ height: 180, position: "relative", overflow: "hidden" }}>
                <img src={shop.photo} alt={shop.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 60%)" }} />
                <div style={{ position: "absolute", top: 14, right: 14, background: shop.color, color: "#fff", fontSize: 10, fontWeight: 800, padding: "4px 12px", borderRadius: 99 }}>{shop.badge}</div>
                <div style={{ position: "absolute", bottom: 14, left: 14, fontSize: 28 }}>{shop.icon}</div>
                <div style={{ position: "absolute", bottom: 14, right: 14, background: "rgba(0,0,0,0.6)", color: "#f59e0b", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 99 }}>
                  ★ {shop.rating}
                </div>
              </div>

              {/* Infos boutique */}
              <div style={{ padding: "18px 20px 20px", flex: 1, display: "flex", flexDirection: "column" }}>
                <div style={{ marginBottom: 12 }}>
                  <h3 style={{ fontFamily: "Syne", fontWeight: 800, fontSize: 16, color: "var(--text)", marginBottom: 3 }}>{shop.name}</h3>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: shop.color, background: shop.bg, padding: "2px 10px", borderRadius: 99 }}>{shop.category}</span>
                    <span style={{ fontSize: 11, color: "var(--muted)" }}>📍 {shop.location}</span>
                  </div>
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14, flex: 1 }}>
                  {shop.items.map((item) => (
                    <span key={item} style={{ fontSize: 11, color: "var(--text)", background: "var(--surface)", border: "1px solid var(--border)", padding: "3px 10px", borderRadius: 99 }}>{item}</span>
                  ))}
                </div>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 14, borderTop: "1px solid var(--border)" }}>
                  <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600 }}>📊 {shop.orders}</span>
                  <Link href="/boutiques" style={{
                    padding: "8px 18px", borderRadius: 99,
                    background: shop.color, color: "#fff",
                    textDecoration: "none", fontSize: 12, fontWeight: 700,
                    fontFamily: "Syne",
                  }}>
                    Voir la boutique →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          4 UNIVERS — CE QUE PROPOSE YITEWO
      ══════════════════════════════════════════════════ */}
      <section style={{ maxWidth: 1140, margin: "0 auto", padding: "72px 20px 0" }}>
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <span style={{ display: "inline-block", padding: "4px 16px", borderRadius: 99, background: "#fff5f3", color: "#E8380D", fontSize: 12, fontWeight: 700, marginBottom: 14 }}>NOS UNIVERS</span>
          <h2 style={{ fontFamily: "Syne", fontWeight: 800, fontSize: "clamp(24px,3.5vw,36px)", color: "var(--text)", marginBottom: 12, lineHeight: 1.2 }}>
            Tout ce dont vous avez besoin,<br />en un seul endroit
          </h2>
          <p style={{ color: "var(--muted)", fontSize: 16, maxWidth: 520, margin: "0 auto" }}>
            Yitewo connecte les Sénégalais aux commerces locaux. Quatre univers, une seule plateforme.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
          {OFFERS.map((o) => (
            <Link key={o.label} href={o.href} style={{ textDecoration: "none" }}>
              <div style={{ background: "#fff", borderRadius: 20, border: "1px solid var(--border)", overflow: "hidden", height: "100%", display: "flex", flexDirection: "column" }}>
                <div style={{ height: 160, position: "relative", overflow: "hidden" }}>
                  <img src={o.photo} alt={o.label} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  <div style={{ position: "absolute", inset: 0, background: o.grad, opacity: 0.78 }} />
                  <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px" }}>
                    <span style={{ fontSize: 44 }}>{o.icon}</span>
                    <div style={{ background: "rgba(255,255,255,0.18)", borderRadius: 99, padding: "5px 14px", fontSize: 11, color: "#fff", fontWeight: 700 }}>Explorer →</div>
                  </div>
                </div>
                <div style={{ padding: "20px 22px 24px", flex: 1, display: "flex", flexDirection: "column" }}>
                  <h3 style={{ fontFamily: "Syne", fontWeight: 800, fontSize: 16, color: "var(--text)", marginBottom: 8 }}>{o.label}</h3>
                  <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6, marginBottom: 16, flex: 1 }}>{o.desc}</p>
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
      <section style={{ maxWidth: 1140, margin: "0 auto", padding: "72px 20px 0" }}>
        <div style={{ background: "#fff", borderRadius: 24, border: "1px solid var(--border)", overflow: "hidden" }}>
          <div style={{ background: "linear-gradient(135deg, #0a0a1a, #16213e)", padding: "36px 40px" }}>
            <span style={{ display: "inline-block", padding: "4px 14px", borderRadius: 99, background: "rgba(255,255,255,0.1)", color: "#c8d8ff", fontSize: 12, fontWeight: 600, marginBottom: 12 }}>POUR LES HABITANTS</span>
            <h2 style={{ fontFamily: "Syne", fontWeight: 800, fontSize: "clamp(20px,3vw,28px)", color: "#fff", marginBottom: 8 }}>
              Trouvez et commandez en 3 étapes
            </h2>
            <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14 }}>Sans inscription, sans application à télécharger.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 0 }}>
            {HOW_CLIENT.map((h, i) => (
              <div key={h.n} style={{ padding: "32px 28px", borderRight: i < HOW_CLIENT.length - 1 ? "1px solid var(--border)" : "none", position: "relative" }}>
                <div style={{ fontFamily: "Syne", fontWeight: 900, fontSize: 48, color: "rgba(0,0,0,0.04)", position: "absolute", top: 16, right: 20, lineHeight: 1 }}>{h.n}</div>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: i === 0 ? "#fdf2f8" : i === 1 ? "#fef3c7" : "#d1fae5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, marginBottom: 16 }}>{h.icon}</div>
                <h3 style={{ fontFamily: "Syne", fontWeight: 700, fontSize: 15, color: "var(--text)", marginBottom: 8 }}>{h.t}</h3>
                <p style={{ color: "var(--muted)", fontSize: 13, lineHeight: 1.6 }}>{h.d}</p>
              </div>
            ))}
          </div>
          <div style={{ padding: "24px 40px", borderTop: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <p style={{ fontSize: 14, color: "var(--muted)" }}>Prêt à découvrir les boutiques près de vous ?</p>
            <div style={{ display: "flex", gap: 10 }}>
              <Link href="/boutiques" style={{ padding: "10px 22px", borderRadius: 99, background: "#E8380D", color: "#fff", textDecoration: "none", fontFamily: "Syne", fontWeight: 700, fontSize: 13 }}>Voir les boutiques</Link>
              <Link href="/services" style={{ padding: "10px 22px", borderRadius: 99, border: "1px solid var(--border)", color: "var(--text)", textDecoration: "none", fontFamily: "Syne", fontWeight: 600, fontSize: 13 }}>Trouver un service</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          BANDE PHOTO IMMERSIVE — Mode wax / boutiques
      ══════════════════════════════════════════════════ */}
      <section style={{ margin: "72px 0 0", position: "relative", overflow: "hidden" }}>
        <div style={{
          position: "relative", height: 460,
          backgroundImage: `url(${IMMERSIVE_BG})`,
          backgroundSize: "cover", backgroundPosition: "center 30%",
        }}>
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(10,4,0,0.88) 0%, rgba(232,56,13,0.52) 100%)" }} />
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", textAlign: "center", padding: "0 24px" }}>
            <span style={{ display: "inline-block", padding: "4px 16px", borderRadius: 99, background: "rgba(255,255,255,0.12)", color: "#ffd4c8", fontSize: 12, fontWeight: 700, marginBottom: 20, letterSpacing: "0.1em" }}>POUR LES COMMERÇANTS</span>
            <h2 style={{ fontFamily: "Syne", fontWeight: 800, fontSize: "clamp(28px,5vw,56px)", color: "#fff", lineHeight: 1.05, marginBottom: 20, letterSpacing: "-1px" }}>
              Votre boutique mérite<br />d'être visible en ligne.
            </h2>
            <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 17, maxWidth: 520, lineHeight: 1.7, marginBottom: 36 }}>
              Cosmétiques, mode, épicerie, restaurant — rejoignez Yitewo gratuitement. 0% de commission au lancement. Activé sous 24h.
            </p>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center" }}>
              <Link href="/partners/apply" style={{ padding: "15px 36px", borderRadius: 99, background: "#E8380D", color: "#fff", textDecoration: "none", fontFamily: "Syne", fontWeight: 800, fontSize: 15, boxShadow: "0 8px 32px rgba(232,56,13,0.4)" }}>
                Inscrire ma boutique →
              </Link>
              <Link href="/pricing" style={{ padding: "15px 36px", borderRadius: 99, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.25)", color: "#fff", textDecoration: "none", fontFamily: "Syne", fontWeight: 700, fontSize: 15 }}>
                Voir les tarifs
              </Link>
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
            <p style={{ fontSize: 14, color: "var(--muted)" }}>Votre boutique mérite d'être visible.</p>
            <Link href="/partners/apply" style={{ padding: "10px 22px", borderRadius: 99, background: "#1A9E5F", color: "#fff", textDecoration: "none", fontFamily: "Syne", fontWeight: 700, fontSize: 13 }}>
              S'inscrire gratuitement →
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          SÉCURITÉ & CONFIANCE
      ══════════════════════════════════════════════════ */}
      <section style={{ maxWidth: 1140, margin: "0 auto", padding: "72px 20px 0" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, alignItems: "center" }}>
          <div>
            <span style={{ display: "inline-block", padding: "4px 14px", borderRadius: 99, background: "#fff3f0", color: "#E8380D", fontSize: 12, fontWeight: 700, marginBottom: 16 }}>SÉCURITÉ & CONFIANCE</span>
            <h2 style={{ fontFamily: "Syne", fontWeight: 800, fontSize: "clamp(22px,3vw,32px)", color: "var(--text)", marginBottom: 14, lineHeight: 1.2 }}>
              Des boutiques vérifiées,<br />des clients protégés
            </h2>
            <p style={{ color: "var(--muted)", fontSize: 15, lineHeight: 1.7, marginBottom: 28 }}>
              La sécurité de nos utilisateurs est notre priorité. Chaque boutique est vérifiée avant d'apparaître sur la plateforme. Vous pouvez faire confiance aux partenaires Yitewo.
            </p>
            <Link href="/boutiques" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 24px", borderRadius: 99, background: "#E8380D", color: "#fff", textDecoration: "none", fontFamily: "Syne", fontWeight: 700, fontSize: 13 }}>
              Explorer les boutiques →
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
          TÉMOIGNAGES — Personnages noirs africains
      ══════════════════════════════════════════════════ */}
      <section style={{ maxWidth: 1140, margin: "0 auto", padding: "72px 20px 0" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <span style={{ display: "inline-block", padding: "4px 14px", borderRadius: 99, background: "#fef3c7", color: "#b45309", fontSize: 12, fontWeight: 700, marginBottom: 14 }}>ILS FONT CONFIANCE À YITEWO</span>
          <h2 style={{ fontFamily: "Syne", fontWeight: 800, fontSize: "clamp(22px,3vw,30px)", color: "var(--text)", marginBottom: 10 }}>
            Commerçants et clients parlent de Yitewo
          </h2>
          <p style={{ fontSize: 15, color: "var(--muted)", maxWidth: 540, margin: "0 auto" }}>
            De la boutique cosmétiques à l'épicerie générale — partout au Sénégal.
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 20 }}>
          {TESTIMONIALS.map((t) => (
            <div key={t.name} style={{ background: "#fff", borderRadius: 20, border: `1px solid ${t.color}22`, padding: "24px 22px", display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 52, height: 52, borderRadius: "50%", overflow: "hidden", flexShrink: 0, border: `2.5px solid ${t.color}44` }}>
                  <img src={t.photo} alt={t.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <div>
                  <p style={{ fontFamily: "Syne", fontWeight: 800, fontSize: 14, color: "var(--text)", margin: 0 }}>{t.name}</p>
                  <p style={{ fontSize: 11, color: t.color, margin: 0, fontWeight: 600 }}>{t.type}</p>
                </div>
              </div>
              <div style={{ background: t.bg, color: t.color, fontSize: 11, fontWeight: 700, padding: "5px 12px", borderRadius: 99, display: "inline-block", alignSelf: "flex-start" }}>
                📊 {t.stats}
              </div>
              <p style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.7, fontStyle: "italic", margin: 0 }}>"{t.text}"</p>
              <div style={{ fontSize: 14, color: "#f59e0b", marginTop: "auto" }}>★★★★★</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          COUVERTURE NATIONALE
      ══════════════════════════════════════════════════ */}
      <section style={{ maxWidth: 1140, margin: "0 auto", padding: "72px 20px 0" }}>
        <div style={{ background: "linear-gradient(135deg, #0a0a1a 0%, #16213e 100%)", borderRadius: 24, padding: "52px 48px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", right: -60, top: -60, width: 280, height: 280, borderRadius: "50%", background: "rgba(232,56,13,0.08)" }} />
          <div style={{ position: "absolute", left: -40, bottom: -40, width: 200, height: 200, borderRadius: "50%", background: "rgba(16,185,129,0.06)" }} />
          <div style={{ position: "relative", zIndex: 1, maxWidth: 600, marginBottom: 36 }}>
            <span style={{ display: "inline-block", padding: "4px 14px", borderRadius: 99, background: "rgba(255,255,255,0.08)", color: "#c8d8ff", fontSize: 12, fontWeight: 600, marginBottom: 16 }}>🇸🇳 COUVERTURE NATIONALE</span>
            <h2 style={{ fontFamily: "Syne", fontWeight: 800, fontSize: "clamp(22px,3vw,32px)", color: "#fff", marginBottom: 12, lineHeight: 1.2 }}>
              Partout au Sénégal,<br />dans chaque quartier
            </h2>
            <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 15, lineHeight: 1.7 }}>
              Yitewo est disponible dans les 14 régions du Sénégal. Vous habitez une ville non encore couverte ? Inscrivez votre boutique et soyez pionnier dans votre région.
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
          CTA FINAL — Cosmétiques / boutique sénégalaise
      ══════════════════════════════════════════════════ */}
      <section style={{ maxWidth: 1140, margin: "0 auto", padding: "72px 20px 80px" }}>
        <div style={{ borderRadius: 24, overflow: "hidden", position: "relative" }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: `url(${CTA_BG})`, backgroundSize: "cover", backgroundPosition: "center" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(232,56,13,0.94) 0%, rgba(160,25,0,0.92) 100%)" }} />
          <div style={{ position: "relative", zIndex: 1, padding: "64px 48px", textAlign: "center" }}>
            <h2 style={{ fontFamily: "Syne", fontWeight: 800, fontSize: "clamp(24px,4vw,44px)", color: "#fff", marginBottom: 14, lineHeight: 1.15 }}>
              Rejoignez le mouvement Yitewo
            </h2>
            <p style={{ color: "rgba(255,255,255,0.80)", fontSize: 16, lineHeight: 1.7, maxWidth: 520, margin: "0 auto 40px" }}>
              Ensemble, digitalisons l'économie locale sénégalaise. Cosmétiques, mode, alimentation, services — votre place est sur Yitewo.
            </p>
            <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/boutiques" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#fff", color: "#E8380D", padding: "15px 36px", borderRadius: 99, textDecoration: "none", fontFamily: "Syne", fontWeight: 800, fontSize: 15, boxShadow: "0 8px 24px rgba(0,0,0,0.2)" }}>
                🛒 Explorer les boutiques
              </Link>
              <Link href="/partners/apply" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.35)", color: "#fff", padding: "15px 36px", borderRadius: 99, textDecoration: "none", fontFamily: "Syne", fontWeight: 700, fontSize: 15 }}>
                🤝 Inscrire ma boutique
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}