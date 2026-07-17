"use client";

import { useState } from "react";
import { isIOSChrome } from "@/lib/push";

export default function IOSInstallHint({ onClose }: { onClose: () => void }) {
  const chrome = isIOSChrome();

  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "flex-end" }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ background: "#fff", width: "100%", borderRadius: "20px 20px 0 0", padding: "24px 20px 32px", maxWidth: 480, margin: "0 auto" }}
      >
        <div style={{ width: 36, height: 4, background: "#eee", borderRadius: 2, margin: "0 auto 16px" }} />
        <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>📲 Installer Yitewo sur ton iPhone</h3>

        {chrome && (
          <p style={{ fontSize: 13, background: "#fff7ed", color: "#9a3412", padding: "10px 12px", borderRadius: 10, marginBottom: 14 }}>
            ⚠️ Sur iPhone, l'installation et les notifications ne fonctionnent que depuis <strong>Safari</strong> — pas Chrome.
            Copie ce lien et ouvre-le dans Safari.
          </p>
        )}

        <ol style={{ fontSize: 14, lineHeight: 1.7, paddingLeft: 18, color: "#333" }}>
          <li>Ouvre cette page dans <strong>Safari</strong> (si ce n'est pas déjà le cas)</li>
          <li>Appuie sur l'icône <strong>Partager</strong> ⬆️ (en bas de l'écran)</li>
          <li>Choisis <strong>"Sur l'écran d'accueil"</strong></li>
          <li>Appuie sur <strong>"Ajouter"</strong> en haut à droite</li>
          <li>Ouvre Yitewo depuis la nouvelle icône sur ton écran d'accueil</li>
          <li>Reviens sur cette page et active les notifications 🔔</li>
        </ol>

        <button
          onClick={onClose}
          style={{ marginTop: 18, width: "100%", padding: "12px", borderRadius: 10, background: "#1a1a1a", color: "#fff", fontWeight: 600, border: "none" }}
        >
          Compris
        </button>
      </div>
    </div>
  );
}
