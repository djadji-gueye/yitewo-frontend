import Link from "next/link";

export default function CGUPage() {
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
          <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "clamp(26px, 5vw, 40px)", color: "#fff", marginBottom: 12 }}>
            Conditions Générales d'Utilisation
          </h1>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 14 }}>
            Dernière mise à jour : mars 2026
          </p>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "48px 20px 80px" }}>
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid var(--border)", padding: "36px 40px", fontSize: 14, lineHeight: 1.8, color: "#333" }}>

          <Section title="1. Présentation de la plateforme">
            <p>Yitewo est une plateforme de mise en relation permettant aux utilisateurs situés à Dakar et Saint-Louis (Sénégal) de commander des produits de première nécessité, des repas et des services à domicile, et de consulter ou publier des annonces d'opportunités.</p>
            <p>La plateforme est éditée et exploitée par Yitewo, dont le siège social est au Sénégal. En utilisant ce service, vous acceptez sans réserve les présentes conditions générales d'utilisation (CGU).</p>
          </Section>

          <Section title="2. Accès au service">
            <p>L'accès à la plateforme Yitewo est libre et gratuit pour tout utilisateur disposant d'un accès à Internet. L'utilisation de certaines fonctionnalités (commandes, demandes de service, publication d'annonces) nécessite de fournir un numéro de téléphone valide.</p>
            <p>Yitewo se réserve le droit de suspendre ou de restreindre l'accès au service à tout utilisateur ne respectant pas les présentes CGU, sans préavis ni indemnité.</p>
          </Section>

          <Section title="3. Commandes et livraison">
            <p>Les commandes passées via la plateforme constituent une demande ferme de l'utilisateur. Yitewo s'engage à traiter les commandes dans les meilleurs délais, sous réserve de la disponibilité des produits et des livreurs.</p>
            <p>Les frais de livraison sont indiqués avant la validation de la commande et varient selon le quartier de livraison. Yitewo se réserve le droit de modifier ces tarifs à tout moment, avec information préalable de l'utilisateur.</p>
            <p>En cas d'indisponibilité d'un produit après validation de la commande, Yitewo contactera l'utilisateur pour proposer une alternative ou procéder à l'annulation sans frais.</p>
          </Section>

          <Section title="4. Prix et paiement">
            <p>Les prix affichés sur la plateforme sont exprimés en Francs CFA (FCFA) toutes taxes comprises. Yitewo se réserve le droit de modifier les prix à tout moment. Les prix applicables sont ceux en vigueur au moment de la validation de la commande.</p>
            <p>Le paiement s'effectue à la livraison en espèces, ou via les solutions de paiement mobile acceptées (Wave, Orange Money). Yitewo ne stocke aucune donnée bancaire ou de paiement mobile des utilisateurs.</p>
          </Section>

          <Section title="5. Responsabilités">
            <p>Yitewo agit en tant qu'intermédiaire entre l'utilisateur et les partenaires (marchands, prestataires, livreurs). À ce titre :</p>
            <ul style={{ paddingLeft: 20, marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
              <li>Yitewo s'engage à faire ses meilleurs efforts pour garantir la qualité et la fraîcheur des produits livrés.</li>
              <li>Yitewo n'est pas responsable des retards de livraison causés par des événements indépendants de sa volonté (trafic, intempéries, force majeure).</li>
              <li>En cas de problème avec une commande ou un service, l'utilisateur doit contacter Yitewo dans un délai de 24 heures après la livraison ou la prestation.</li>
              <li>Yitewo décline toute responsabilité pour les dommages indirects résultant de l'utilisation de la plateforme.</li>
            </ul>
          </Section>

          <Section title="6. Annonces et opportunités">
            <p>Les utilisateurs peuvent soumettre des annonces sur la section Opportunités. Ces annonces sont soumises à validation par l'équipe Yitewo avant publication. Yitewo se réserve le droit de refuser ou de supprimer toute annonce qui :</p>
            <ul style={{ paddingLeft: 20, marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
              <li>Contient des informations fausses, trompeuses ou frauduleuses.</li>
              <li>Fait la promotion d'activités illégales au regard de la législation sénégalaise.</li>
              <li>Porte atteinte aux droits de tiers (droits de propriété intellectuelle, droit à l'image, etc.).</li>
              <li>Contient des propos injurieux, discriminatoires ou contraires aux bonnes mœurs.</li>
            </ul>
            <p>L'auteur d'une annonce est seul responsable de son contenu. Yitewo ne garantit pas l'exactitude des informations publiées dans les annonces.</p>
          </Section>

          <Section title="7. Partenaires">
            <p>Les marchands, prestataires et livreurs partenaires de Yitewo s'engagent à respecter une charte de qualité et de sérieux. En soumettant une candidature partenaire, vous acceptez que Yitewo puisse vérifier les informations fournies et procéder à une évaluation de votre activité avant toute activation.</p>
            <p>Yitewo se réserve le droit de désactiver un partenaire qui ne respecte pas ses engagements envers les utilisateurs, sans indemnité.</p>
          </Section>

          <Section title="8. Propriété intellectuelle">
            <p>L'ensemble des éléments constituant la plateforme Yitewo (logo, design, textes, images, fonctionnalités) est la propriété exclusive de Yitewo et est protégé par les lois sénégalaises et internationales relatives à la propriété intellectuelle.</p>
            <p>Toute reproduction, représentation, modification ou exploitation non autorisée de ces éléments est strictement interdite et passible de poursuites.</p>
          </Section>

          <Section title="9. Droit applicable et juridiction compétente">
            <p>Les présentes CGU sont régies par le droit sénégalais, notamment la loi n° 2008-08 du 25 janvier 2008 sur les transactions électroniques et la loi n° 2008-11 du 25 janvier 2008 portant sur la cybercriminalité.</p>
            <p>En cas de litige, et à défaut de résolution amiable, les tribunaux compétents de Dakar (Sénégal) seront seuls compétents.</p>
          </Section>

          <Section title="10. Modification des CGU">
            <p>Yitewo se réserve le droit de modifier les présentes CGU à tout moment. Les utilisateurs seront informés de toute modification substantielle. La poursuite de l'utilisation de la plateforme après notification vaut acceptation des nouvelles conditions.</p>
          </Section>

          <Section title="11. Contact">
            <p>Pour toute question relative aux présentes CGU, vous pouvez nous contacter :</p>
            <ul style={{ paddingLeft: 20, marginTop: 8, display: "flex", flexDirection: "column", gap: 4 }}>
              <li>Par WhatsApp : <strong>+221 77 XXX XX XX</strong></li>
              <li>Via notre site : <Link href="/" style={{ color: "var(--brand)" }}>yitewo.com</Link></li>
            </ul>
          </Section>

        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <h2 style={{
        fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 17,
        color: "var(--text)", marginBottom: 14,
        paddingBottom: 8, borderBottom: "1px solid var(--border)",
      }}>
        {title}
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {children}
      </div>
    </div>
  );
}
