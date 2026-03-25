import Link from "next/link";

export default function PrivacyPage() {
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
            Politique de Confidentialité
          </h1>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 14 }}>
            Dernière mise à jour : mars 2026
          </p>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "48px 20px 80px" }}>

        {/* Intro banner */}
        <div style={{
          background: "var(--green-light)", border: "1px solid #b8f0d8",
          borderRadius: 14, padding: "18px 22px", marginBottom: 32,
          fontSize: 14, color: "#065f46", lineHeight: 1.6,
        }}>
          🔒 <strong>Votre vie privée est importante pour nous.</strong> Yitewo s'engage à protéger vos données personnelles conformément à la loi sénégalaise n° 2008-12 du 25 janvier 2008 sur la protection des données personnelles, et aux règles de la Commission de Protection des Données Personnelles (CDP) du Sénégal.
        </div>

        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid var(--border)", padding: "36px 40px", fontSize: 14, lineHeight: 1.8, color: "#333" }}>

          <Section title="1. Responsable du traitement">
            <p>Le responsable du traitement des données collectées via la plateforme Yitewo est la société Yitewo, opérant au Sénégal. Pour toute question relative à vos données personnelles, vous pouvez nous contacter via WhatsApp au <strong>+221 77 646 10 35</strong>.</p>
          </Section>

          <Section title="2. Données collectées">
            <p>Dans le cadre de l'utilisation de nos services, nous sommes susceptibles de collecter les données suivantes :</p>
            <ul style={{ paddingLeft: 20, marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
              <li><strong>Données de commande :</strong> nom (optionnel), numéro de téléphone, adresse de livraison (quartier et ville), contenu du panier, montant de la commande.</li>
              <li><strong>Données de service :</strong> type de service demandé, zone géographique, description du besoin, coordonnées de contact.</li>
              <li><strong>Données d'annonces :</strong> titre, description, localisation, numéro de contact fourni lors de la soumission d'une annonce.</li>
              <li><strong>Données de navigation :</strong> adresse IP, type de navigateur, pages visitées, via des outils d'analyse anonymisés.</li>
              <li><strong>Données de géolocalisation :</strong> position GPS approchée, uniquement si vous activez la fonctionnalité de localisation automatique. Cette donnée n'est jamais stockée en base de données.</li>
            </ul>
          </Section>

          <Section title="3. Finalités du traitement">
            <p>Vos données sont utilisées pour les finalités suivantes :</p>
            <ul style={{ paddingLeft: 20, marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
              <li>Traiter et livrer vos commandes de produits ou de services.</li>
              <li>Vous contacter pour confirmer une commande ou vous informer de son avancement.</li>
              <li>Publier et modérer les annonces de la section Opportunités.</li>
              <li>Améliorer la qualité de nos services et de notre plateforme.</li>
              <li>Assurer la sécurité de la plateforme et prévenir les fraudes.</li>
              <li>Respecter nos obligations légales et réglementaires.</li>
            </ul>
            <p>Nous n'utilisons pas vos données à des fins publicitaires et ne les revendons jamais à des tiers commerciaux.</p>
          </Section>

          <Section title="4. Base légale du traitement">
            <p>Conformément à la loi sénégalaise n° 2008-12 sur la protection des données personnelles, le traitement de vos données repose sur :</p>
            <ul style={{ paddingLeft: 20, marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
              <li><strong>L'exécution d'un contrat</strong> : traitement nécessaire à la réalisation de votre commande ou demande de service.</li>
              <li><strong>Votre consentement</strong> : pour la géolocalisation et les communications marketing éventuelles.</li>
              <li><strong>L'intérêt légitime</strong> : pour la sécurité de la plateforme et la prévention des fraudes.</li>
            </ul>
          </Section>

          <Section title="5. Partage des données">
            <p>Vos données personnelles ne sont jamais vendues à des tiers. Elles peuvent être partagées dans les cas suivants :</p>
            <ul style={{ paddingLeft: 20, marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
              <li><strong>Avec nos partenaires livreurs</strong> : uniquement le nom et le quartier de livraison, pour assurer la livraison de votre commande.</li>
              <li><strong>Avec nos partenaires marchands</strong> : uniquement pour les commandes effectuées via leur boutique.</li>
              <li><strong>Avec les autorités compétentes</strong> : si la loi sénégalaise nous y oblige (réquisitions judiciaires, etc.).</li>
            </ul>
          </Section>

          <Section title="6. Durée de conservation">
            <p>Vos données sont conservées pour les durées suivantes :</p>
            <ul style={{ paddingLeft: 20, marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
              <li><strong>Données de commande :</strong> 3 ans à compter de la date de commande, pour des raisons comptables et légales.</li>
              <li><strong>Données de demandes de service :</strong> 1 an à compter de la date de la demande.</li>
              <li><strong>Annonces soumises :</strong> 2 ans, ou jusqu'à suppression à votre demande.</li>
              <li><strong>Données de navigation :</strong> 13 mois maximum.</li>
            </ul>
          </Section>

          <Section title="7. Vos droits">
            <p>Conformément à la loi n° 2008-12 sur la protection des données personnelles au Sénégal, vous disposez des droits suivants :</p>
            <ul style={{ paddingLeft: 20, marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
              <li><strong>Droit d'accès</strong> : obtenir la confirmation que vos données sont traitées et en obtenir une copie.</li>
              <li><strong>Droit de rectification</strong> : faire corriger des données inexactes ou incomplètes.</li>
              <li><strong>Droit de suppression</strong> : demander l'effacement de vos données, sous réserve de nos obligations légales.</li>
              <li><strong>Droit d'opposition</strong> : vous opposer au traitement de vos données pour des motifs légitimes.</li>
              <li><strong>Droit à la portabilité</strong> : recevoir vos données dans un format structuré et lisible.</li>
            </ul>
            <p>Pour exercer ces droits, contactez-nous via WhatsApp au <strong>+221 77 646 10 35</strong>. Nous répondrons dans un délai de 30 jours. Vous pouvez également saisir la <strong>Commission de Protection des Données Personnelles (CDP)</strong> du Sénégal si vous estimez que vos droits ne sont pas respectés.</p>
          </Section>

          <Section title="8. Sécurité des données">
            <p>Yitewo met en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données contre tout accès non autorisé, perte, destruction ou divulgation. Ces mesures comprennent notamment :</p>
            <ul style={{ paddingLeft: 20, marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
              <li>Le chiffrement des communications entre votre appareil et nos serveurs (HTTPS).</li>
              <li>L'accès aux données restreint au personnel autorisé uniquement.</li>
              <li>L'authentification sécurisée par token JWT pour les accès administrateurs.</li>
              <li>Des sauvegardes régulières des données hébergées.</li>
            </ul>
          </Section>

          <Section title="9. Géolocalisation">
            <p>La fonctionnalité de localisation automatique utilise l'API de géolocalisation de votre navigateur et le service OpenStreetMap/Nominatim (open source) pour identifier votre quartier approximatif. Cette information est utilisée uniquement pour faciliter la sélection de votre zone de livraison et n'est jamais enregistrée en base de données sans votre action explicite.</p>
            <p>Vous pouvez refuser la géolocalisation à tout moment et sélectionner votre quartier manuellement.</p>
          </Section>

          <Section title="10. Cookies et traceurs">
            <p>La plateforme Yitewo utilise un nombre minimal de cookies, strictement nécessaires au fonctionnement du service (maintien de la session, préférences utilisateur). Nous n'utilisons pas de cookies publicitaires ou de tracking tiers.</p>
          </Section>

          <Section title="11. Modifications de la politique">
            <p>Cette politique de confidentialité peut être mise à jour pour refléter les évolutions de nos pratiques ou de la réglementation. La date de dernière modification est indiquée en haut de ce document. Nous vous informerons de tout changement substantiel.</p>
          </Section>

          <Section title="12. Contact et réclamations">
            <p>Pour toute question relative à la protection de vos données ou pour exercer vos droits :</p>
            <ul style={{ paddingLeft: 20, marginTop: 8, display: "flex", flexDirection: "column", gap: 4 }}>
              <li>WhatsApp : <strong>+221 77 646 10 35</strong></li>
              <li>Site : <Link href="/" style={{ color: "var(--brand)" }}>yitewo-frontend.vercel.app</Link></li>
            </ul>
            <p style={{ marginTop: 10 }}>En cas de réclamation non résolue, vous pouvez contacter la <strong>Commission de Protection des Données Personnelles (CDP)</strong> du Sénégal, autorité de contrôle compétente en matière de protection des données personnelles.</p>
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
