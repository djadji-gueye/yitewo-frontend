import type { Metadata } from "next";
import "./globals.css";
import CartProvider from "@/components/CartProvider";
import ConditionalShell from "@/components/ConditionalShell";

export const metadata: Metadata = {
  title: "Yitewo — Boutiques, Services & Opportunités au Sénégal",
  description: "La plateforme sénégalaise qui connecte habitants, commerçants, restaurants et prestataires de services partout au Sénégal.",
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
