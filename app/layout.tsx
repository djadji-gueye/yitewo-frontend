import type { Metadata } from "next";
import "./globals.css";
import CartProvider from "@/components/CartProvider";
import ConditionalShell from "@/components/ConditionalShell";


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
    google: "UEVzAWO3HM2pmDyvvd1V26HKNLCpBnO2iQqwMrQJmZA",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <CartProvider>
          <ConditionalShell>
            {children}
          </ConditionalShell>
        </CartProvider>
      </body>
    </html>
  );
}


