export type OpportunityCategory = "immobilier" | "emploi" | "service" | "commerce" | "formation";

export type Opportunity = {
  slug: string;
  title: string;
  category: OpportunityCategory;
  location: string;
  description: string;
  details?: string[];
  price?: string;
  contact: string;
  image?: string;
  badge?: string;
  postedAt: string;
};

export const CATEGORY_META: Record<OpportunityCategory, { label: string; icon: string; color: string; bg: string }> = {
  immobilier: { label: "Immobilier", icon: "🏠", color: "#b45309", bg: "#fef3c7" },
  emploi: { label: "Emploi", icon: "💼", color: "#1d4ed8", bg: "#dbeafe" },
  service: { label: "Service", icon: "🔧", color: "#6d28d9", bg: "#ede9fe" },
  commerce: { label: "Commerce", icon: "🛒", color: "#047857", bg: "#d1fae5" },
  formation: { label: "Formation", icon: "📚", color: "#be185d", bg: "#fce7f3" },
};

export const OPPORTUNITIES: Opportunity[] = [
  {
    slug: "terrain-villeneuve-300m2",
    title: "Terrain à vendre – Villeneuve 1",
    category: "immobilier",
    location: "Villeneuve 1, Saint-Louis",
    description: "Terrain bien situé dans le quartier résidentiel de Villeneuve, proche toutes commodités. Papier cadastral disponible. Idéal pour construction de villa.",
    details: ["300 m² (15 m x 20 m)", "Eau & Électricité disponibles", "Papier cadastral", "Prix négociable"],
    price: "Prix à négocier",
    contact: "22177XXXXXXX",
    image: "/images/terrain-1.png",
    badge: "Nouveau",
    postedAt: "2026-03-10",
  },
  {
    slug: "terrain-hydrobase-500m2",
    title: "Terrain à vendre – Hydrobase",
    category: "immobilier",
    location: "Hydrobase, Saint-Louis",
    description: "Grand terrain de 500 m² avec titre foncier en zone résidentielle calme. Accès direct à la voie principale.",
    details: ["500 m²", "Titre foncier", "Eau & Électricité", "Zone résidentielle"],
    price: "Prix à négocier",
    contact: "22177XXXXXXX",
    image: "/images/terrain-1.png",
    postedAt: "2026-03-05",
  },
  {
    slug: "livreur-dakar",
    title: "Recherche livreurs à moto – Dakar",
    category: "emploi",
    location: "Dakar (Plateau, Almadies, Mermoz)",
    description: "Yitewo recrute des livreurs à moto sérieux et disponibles pour assurer les livraisons à domicile partout au Sénégal. Travail flexible, paiement hebdomadaire.",
    details: ["Moto personnelle requise", "Smartphone Android ou iOS", "Disponible matin ou soir", "Paiement chaque semaine"],
    contact: "22177XXXXXXX",
    badge: "Urgent",
    postedAt: "2026-03-15",
  },
  {
    slug: "livreur-saint-louis",
    title: "Recherche livreurs – Saint-Louis",
    category: "emploi",
    location: "Saint-Louis (Sor, Île, Hydro…)",
    description: "Nous recherchons des livreurs à vélo ou moto pour couvrir Saint-Louis et ses environs. Débutants acceptés si sérieux.",
    details: ["Vélo ou moto", "Connaissance de la ville", "Disponibilité partielle acceptée", "Formation assurée"],
    contact: "22177XXXXXXX",
    badge: "Urgent",
    postedAt: "2026-03-14",
  },
  {
    slug: "boutique-partenaire-epicerie",
    title: "Épiceries & boutiques – Rejoignez notre réseau",
    category: "commerce",
    location: "Sénégal",
    description: "Vous êtes épicier, boutiquier ou commerçant ? Référencez votre boutique sur Yitewo et recevez des commandes directement sur WhatsApp, sans commission.",
    details: ["Zéro commission sur les ventes", "Visibilité auprès de milliers de clients", "Inscription en 5 min", "Support dédié"],
    contact: "22177XXXXXXX",
    postedAt: "2026-03-01",
  },
  {
    slug: "formation-digital-saintlouis",
    title: "Formation Marketing Digital – Saint-Louis",
    category: "formation",
    location: "Saint-Louis (présentiel + en ligne)",
    description: "Formation pratique au marketing digital pour entrepreneurs, vendeurs et porteurs de projet. Réseaux sociaux, WhatsApp Business, publicité en ligne.",
    details: ["4 semaines", "Présentiel + en ligne", "Attestation de formation", "Places limitées à 15 participants"],
    price: "25 000 FCFA",
    contact: "22177XXXXXXX",
    badge: "Nouveau",
    postedAt: "2026-03-12",
  },
];
