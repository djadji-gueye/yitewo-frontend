import Link from "next/link";

const FAQS = [
  {
    section: "Commandes & Livraison",
    items: [
      {
        q: "Comment passer une commande ?",
        a: "Parcourez nos produits, ajoutez-les au panier, choisissez votre quartier, puis confirmez. Votre commande est transmise directement à notre équipe qui vous recontacte pour confirmer la livraison.",
      },
      {
        q: "Quels sont les délais de livraison ?",
        a: "Nous livrons généralement dans un délai de 30 minutes à 2 heures selon votre quartier et la disponibilité de nos livreurs. Pour les commandes urgentes, contactez-nous directement sur WhatsApp.",
      },
      {
        q: "Quelles sont les zones de livraison ?",
        a: "Nous livrons actuellement à Dakar (Almadies, Mermoz, Point E, Ouest-Foire, Hann, Grand-Yoff, HLM, Yoff) et à Saint-Louis (Île, Sor, Hydrobase, Guet Ndar, et plusieurs autres quartiers). D'autres zones seront bientôt disponibles.",
      },
      {
        q: "Quels sont les frais de livraison ?",
        a: "Les frais de livraison varient entre 500 et 1 000 FCFA selon votre quartier. Le montant exact est affiché avant de confirmer votre commande.",
      },
      {
        q: "Puis-je annuler ou modifier ma commande ?",
        a: "Vous pouvez annuler ou modifier votre commande tant qu'elle n'a pas encore été prise en charge par un livreur. Contactez-nous rapidement sur WhatsApp au +221 77 XXX XX XX.",
      },
      {
        q: "Comment suivre ma commande ?",
        a: "Après confirmation, notre équipe vous tient informé par WhatsApp de l'avancement de votre livraison. Vous pouvez également nous contacter à tout moment pour un suivi.",
      },
    ],
  },
  {
    section: "Paiement",
    items: [
      {
        q: "Quels modes de paiement acceptez-vous ?",
        a: "Nous acceptons le paiement à la livraison en espèces, ainsi que les paiements mobiles via Wave et Orange Money. D'autres modes de paiement seront bientôt disponibles.",
      },
      {
        q: "Le paiement en ligne est-il sécurisé ?",
        a: "Yitewo ne collecte aucune donnée de carte bancaire. Les paiements mobile money se font directement via les applications officielles Wave et Orange Money.",
      },
    ],
  },
  {
    section: "Produits & Services",
    items: [
      {
        q: "Les produits sont-ils frais ?",
        a: "Oui, nous travaillons avec des fournisseurs locaux pour garantir la fraîcheur de nos produits, notamment pour la viande, le poisson et les légumes. Les produits sont commandés et livrés le jour même.",
      },
      {
        q: "Comment demander un service à domicile ?",
        a: "Rendez-vous sur la page Services, choisissez le type de prestation (ménage, plombier, électricien…), indiquez votre zone, et soumettez votre demande. Un prestataire vous contactera rapidement.",
      },
      {
        q: "Les prestataires de services sont-ils vérifiés ?",
        a: "Oui, tous nos prestataires passent par un processus de vérification avant d'être référencés sur la plateforme. Nous nous engageons à vous mettre en relation avec des professionnels sérieux.",
      },
    ],
  },
  {
    section: "Opportunités & Annonces",
    items: [
      {
        q: "Comment publier une annonce ?",
        a: "Allez sur la page Opportunités, cliquez sur « Publier une annonce », remplissez le formulaire. Votre annonce sera examinée par notre équipe et publiée sous 24h si elle respecte nos conditions.",
      },
      {
        q: "Combien coûte la publication d'une annonce ?",
        a: "La publication d'annonces est gratuite pour le moment sur Yitewo.",
      },
      {
        q: "Comment suivre le statut de mon annonce ?",
        a: "Allez sur la page « Mes annonces » dans la section Opportunités et entrez le numéro de téléphone utilisé lors de votre soumission pour voir le statut en temps réel.",
      },
    ],
  },
  {
    section: "Partenariats",
    items: [
      {
        q: "Comment devenir partenaire Yitewo ?",
        a: "Rendez-vous sur la page Partenaires, remplissez le formulaire de candidature. Notre équipe vous contactera sous 48h pour discuter des modalités de collaboration.",
      },
      {
        q: "Quels types de partenaires acceptez-vous ?",
        a: "Nous travaillons avec des marchands, restaurants, livreurs et prestataires de services partout au Sénégal. Si vous avez une activité commerciale, vous êtes les bienvenus.",
      },
    ],
  },
  {
    section: "Contact & Support",
    items: [
      {
        q: "Comment contacter le service client ?",
        a: "Vous pouvez nous joindre via WhatsApp au +221 77 XXX XX XX, disponible du lundi au samedi de 8h à 20h. Vous pouvez aussi utiliser le bouton « Contactez-nous » en bas de chaque page.",
      },
      {
        q: "Que faire si ma commande n'est pas arrivée ?",
        a: "Contactez-nous immédiatement sur WhatsApp avec votre numéro de commande. Nous ferons le nécessaire pour résoudre la situation dans les plus brefs délais.",
      },
    ],
  },
];

export default function FAQPage() {
  return (
    <div style={{ background: "var(--surface)", minHeight: "100vh" }}>

      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #1a0500 0%, #3a0c00 50%, #E8380D 100%)",
        padding: "56px 20px 64px",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: -60, right: -60, width: 260, height: 260, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />
        <div style={{ maxWidth: 760, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "rgba(255,255,255,0.6)", textDecoration: "none", fontSize: 13, marginBottom: 20 }}>
            ← Retour à l'accueil
          </Link>
          <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "clamp(28px, 5vw, 44px)", color: "#fff", marginBottom: 12 }}>
            Questions fréquentes
          </h1>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 16, lineHeight: 1.6 }}>
            Tout ce que vous devez savoir sur Yitewo — boutiques, services, paiement et plus encore.
          </p>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "48px 20px 80px" }}>
        {FAQS.map((section) => (
          <div key={section.section} style={{ marginBottom: 48 }}>
            <h2 style={{
              fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 18,
              color: "var(--brand)", marginBottom: 20,
              paddingBottom: 10, borderBottom: "2px solid var(--brand-light)",
            }}>
              {section.section}
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {section.items.map((item) => (
                <details key={item.q} style={{
                  background: "#fff", borderRadius: 12,
                  border: "1px solid var(--border)",
                  overflow: "hidden",
                }}>
                  <summary style={{
                    padding: "16px 20px",
                    fontFamily: "Syne, sans-serif", fontWeight: 600, fontSize: 15,
                    cursor: "pointer", listStyle: "none",
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    color: "var(--text)",
                  }}>
                    {item.q}
                    <span style={{ color: "var(--brand)", fontSize: 20, flexShrink: 0, marginLeft: 12 }}>+</span>
                  </summary>
                  <div style={{
                    padding: "0 20px 16px",
                    fontSize: 14, lineHeight: 1.7,
                    color: "var(--muted)",
                  }}>
                    {item.a}
                  </div>
                </details>
              ))}
            </div>
          </div>
        ))}

        {/* Contact CTA */}
        <div style={{
          background: "var(--brand-light)", borderRadius: 16,
          border: "1px solid #fdd0c5", padding: "28px 28px",
          textAlign: "center",
        }}>
          <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 18, marginBottom: 8 }}>
            Vous n'avez pas trouvé votre réponse ?
          </p>
          <p style={{ color: "var(--muted)", fontSize: 14, marginBottom: 20 }}>
            Notre équipe est disponible du lundi au samedi, de 8h à 20h.
          </p>
          <a
            href="https://wa.me/22177XXXXXXX"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex", alignItems: "center", gap: 10,
              background: "var(--green)", color: "#fff",
              padding: "12px 28px", borderRadius: 99,
              textDecoration: "none", fontFamily: "Syne, sans-serif",
              fontWeight: 700, fontSize: 14,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.553 4.116 1.524 5.849L.073 23.486a.5.5 0 00.617.608l5.757-1.509A11.96 11.96 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
            </svg>
            Nous contacter sur WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
