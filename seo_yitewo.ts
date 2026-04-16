// ═══════════════════════════════════════════════════════
// FICHIER 1 : app/layout.tsx — Metadata globale SEO
// ═══════════════════════════════════════════════════════

import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://yitewo.com"),

  title: {
    default: "Yitewo — Boutiques, Restaurants & Services au Sénégal",
    template: "%s | Yitewo Sénégal",
  },

  description:
    "Yitewo connecte les habitants du Sénégal aux boutiques, restaurants et prestataires de leur quartier. Commandez en ligne à Dakar, Thiès, Saint-Louis, Ziguinchor et partout au Sénégal.",

  keywords: [
    "boutique en ligne Sénégal",
    "commande en ligne Dakar",
    "épicerie Dakar livraison",
    "restaurant Dakar commande",
    "marketplace Sénégal",
    "commerce local Dakar",
    "Yitewo",
    "service à domicile Dakar",
    "plombier Dakar",
    "electricien Dakar",
    "emploi Sénégal",
    "immobilier Sénégal",
  ],

  authors: [{ name: "Papa Djadji Gueye", url: "https://yitewo.com" }],
  creator: "Papa Djadji Gueye",
  publisher: "Yitewo",

  // Open Graph (Facebook, WhatsApp preview)
  openGraph: {
    type: "website",
    locale: "fr_SN",
    url: "https://yitewo.com",
    siteName: "Yitewo",
    title: "Yitewo — Boutiques, Restaurants & Services au Sénégal",
    description:
      "La marketplace de proximité sénégalaise. Trouvez et commandez auprès des boutiques, restaurants et prestataires de votre quartier.",
    images: [
      {
        url: "/og-image.png", // à créer : 1200x630px
        width: 1200,
        height: 630,
        alt: "Yitewo — La marketplace du Sénégal",
      },
    ],
  },

  // Twitter / X
  twitter: {
    card: "summary_large_image",
    title: "Yitewo — Boutiques & Services au Sénégal",
    description: "Commandez auprès des boutiques et restaurants de votre quartier.",
    images: ["/og-image.png"],
    creator: "@yitewo",
  },

  // Indexation
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // Canonical
  alternates: {
    canonical: "https://yitewo.com",
    languages: {
      "fr-SN": "https://yitewo.com",
    },
  },

  // Icônes
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },

  // Vérification Google Search Console
  verification: {
    google: "COLLER_ICI_LE_CODE_GOOGLE_SEARCH_CONSOLE",
  },
};


// ═══════════════════════════════════════════════════════
// FICHIER 2 : app/sitemap.ts — Sitemap dynamique
// ═══════════════════════════════════════════════════════

import { MetadataRoute } from "next";

const BASE = "https://yitewo.com";
const API  = process.env.NEXT_PUBLIC_URL_PROD || "http://localhost:3003";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Pages statiques
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE,                         lastModified: new Date(), changeFrequency: "daily",   priority: 1.0 },
    { url: `${BASE}/boutiques`,          lastModified: new Date(), changeFrequency: "daily",   priority: 0.9 },
    { url: `${BASE}/services`,           lastModified: new Date(), changeFrequency: "daily",   priority: 0.9 },
    { url: `${BASE}/opportunities`,      lastModified: new Date(), changeFrequency: "daily",   priority: 0.8 },
    { url: `${BASE}/opportunities/poster`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE}/partners`,           lastModified: new Date(), changeFrequency: "weekly",  priority: 0.8 },
    { url: `${BASE}/faq`,                lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/cgu`,                lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE}/privacy`,            lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
  ];

  // Pages dynamiques — partenaires
  let partnerPages: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch(`${API}/partners/public/active`, { next: { revalidate: 3600 } });
    if (res.ok) {
      const partners: { slug: string; updatedAt?: string }[] = await res.json();
      partnerPages = partners.map((p) => ({
        url: `${BASE}/order?partner=${p.slug}`,
        lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.7,
      }));
    }
  } catch { /* silencieux si API indisponible */ }

  // Pages dynamiques — opportunités
  let opportunityPages: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch(`${API}/opportunities?limit=200`, { next: { revalidate: 3600 } });
    if (res.ok) {
      const data: any = await res.json();
      const opps: { slug?: string; id: string; updatedAt?: string }[] =
        Array.isArray(data) ? data : data?.data ?? [];
      opportunityPages = opps.map((o) => ({
        url: `${BASE}/opportunities/${o.slug || o.id}`,
        lastModified: o.updatedAt ? new Date(o.updatedAt) : new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.6,
      }));
    }
  } catch { /* silencieux */ }

  return [...staticPages, ...partnerPages, ...opportunityPages];
}


// ═══════════════════════════════════════════════════════
// FICHIER 3 : app/robots.ts — Robots.txt
// ═══════════════════════════════════════════════════════

import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/partner-portal/",
          "/dashboard/",
          "/api/",
          "/_next/",
        ],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/partner-portal/", "/dashboard/"],
      },
    ],
    sitemap: "https://yitewo.com/sitemap.xml",
    host: "https://yitewo.com",
  };
}


// ═══════════════════════════════════════════════════════
// FICHIER 4 : app/page.tsx — Structured Data (JSON-LD)
// Ajouter dans le <head> de la page d'accueil
// ═══════════════════════════════════════════════════════

// Coller ce composant dans app/page.tsx, dans le return :
/*
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "Yitewo",
      "url": "https://yitewo.com",
      "description": "La marketplace de proximité sénégalaise",
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": "https://yitewo.com/boutiques?q={search_term_string}"
        },
        "query-input": "required name=search_term_string"
      },
      "publisher": {
        "@type": "Organization",
        "name": "Yitewo",
        "url": "https://yitewo.com",
        "logo": {
          "@type": "ImageObject",
          "url": "https://yitewo.com/logo.png"
        },
        "contactPoint": {
          "@type": "ContactPoint",
          "telephone": "+221-77-725-93-30",
          "contactType": "customer service",
          "areaServed": "SN",
          "availableLanguage": ["French", "Wolof"]
        },
        "address": {
          "@type": "PostalAddress",
          "addressCountry": "SN",
          "addressLocality": "Dakar"
        },
        "sameAs": [
          "https://www.facebook.com/yitewo",
          "https://www.tiktok.com/@yitewo.sn",
          "https://www.instagram.com/yitewo"
        ]
      }
    })
  }}
/>
*/


// ═══════════════════════════════════════════════════════
// FICHIER 5 : Metadata dynamique pour les pages partenaires
// app/order/page.tsx — ajouter generateMetadata
// ═══════════════════════════════════════════════════════

/*
export async function generateMetadata({ searchParams }: { searchParams: { partner?: string } }): Promise<Metadata> {
  const slug = searchParams?.partner;
  if (!slug) return { title: "Commander" };

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_URL_PROD}/partners/by-slug/${slug}`);
    if (!res.ok) return { title: "Boutique Yitewo" };
    const partner = await res.json();

    return {
      title: `${partner.name} — Commander en ligne`,
      description: `Commandez directement auprès de ${partner.name} à ${partner.zone || partner.city}, Sénégal. Livraison rapide via Yitewo.`,
      openGraph: {
        title: `${partner.name} sur Yitewo`,
        description: `Découvrez ${partner.name} à ${partner.zone || partner.city} et commandez en ligne.`,
        images: partner.profileImageUrl ? [{ url: partner.profileImageUrl }] : [],
        type: "website",
        locale: "fr_SN",
        siteName: "Yitewo",
      },
      alternates: {
        canonical: `https://yitewo.com/order?partner=${slug}`,
      },
    };
  } catch {
    return { title: "Boutique Yitewo" };
  }
}
*/
