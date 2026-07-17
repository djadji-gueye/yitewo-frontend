"use client";

import { useEffect } from "react";

// Les 3 layouts (dashboard, partner-portal, prestataire-portal) sont des Client
// Components (hooks de nav, état), donc pas d'export `metadata` possible pour
// pointer vers un manifest différent. On bascule le <link rel="manifest">
// existant (posé par le layout racine) au montage, avant que l'utilisateur
// n'ouvre le menu de partage pour installer l'app.
export default function ManifestSwitcher({ href }: { href: string }) {
  useEffect(() => {
    let link = document.querySelector<HTMLLinkElement>('link[rel="manifest"]');
    if (!link) {
      link = document.createElement("link");
      link.rel = "manifest";
      document.head.appendChild(link);
    }
    const previous = link.getAttribute("href");
    link.setAttribute("href", href);

    // On restaure le manifest global en quittant le portail (retour au site public).
    return () => {
      if (previous) link!.setAttribute("href", previous);
    };
  }, [href]);

  return null;
}
