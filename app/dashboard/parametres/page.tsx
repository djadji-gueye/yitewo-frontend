"use client";

import { useState } from "react";

const BASE = process.env.NEXT_PUBLIC_URL_PROD || "http://localhost:3003";

export default function ParametresPage() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");

  const canSave = oldPassword && newPassword.length >= 6 && newPassword === confirm;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSave) return;
    setStatus("loading");
    setError("");
    try {
      const token = localStorage.getItem("yitewo_token");
      const res = await fetch(`${BASE}/auth/change-password`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ oldPassword, newPassword }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || "Erreur");
      }
      setStatus("success");
      setOldPassword(""); setNewPassword(""); setConfirm("");
    } catch (err: any) {
      setError(err?.message || "Erreur inconnue");
      setStatus("error");
    }
  };

  return (
    <div style={{ padding: "28px", maxWidth: 520, margin: "0 auto" }}>
      <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 22, color: "#fff", marginBottom: 28 }}>
        Paramètres
      </h1>

      <div style={{ background: "#13131f", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: "24px" }}>
        <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 16, color: "#fff", marginBottom: 20 }}>
          🔐 Changer le mot de passe
        </h2>

        {status === "success" && (
          <div style={{ background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#10b981", marginBottom: 16 }}>
            ✅ Mot de passe mis à jour avec succès
          </div>
        )}
        {status === "error" && (
          <div style={{ background: "rgba(232,56,13,0.12)", border: "1px solid rgba(232,56,13,0.3)", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#ff8a70", marginBottom: 16 }}>
            ❌ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {[
            { label: "Mot de passe actuel", value: oldPassword, onChange: setOldPassword },
            { label: "Nouveau mot de passe (min. 6 caractères)", value: newPassword, onChange: setNewPassword },
            { label: "Confirmer le nouveau mot de passe", value: confirm, onChange: setConfirm },
          ].map((f) => (
            <div key={f.label}>
              <label style={{ fontSize: 12, color: "#666", display: "block", marginBottom: 6, fontWeight: 500 }}>{f.label}</label>
              <input
                type="password" value={f.value} onChange={(e) => f.onChange(e.target.value)}
                required minLength={f.label.includes("actuel") ? 1 : 6}
                style={{ width: "100%", padding: "11px 14px", borderRadius: 10, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", fontSize: 14, outline: "none", fontFamily: "DM Sans, sans-serif", transition: "border-color 0.2s" }}
                onFocus={(e) => (e.target.style.borderColor = "#E8380D")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
              />
            </div>
          ))}

          {newPassword && confirm && newPassword !== confirm && (
            <p style={{ fontSize: 12, color: "#ef4444" }}>Les mots de passe ne correspondent pas</p>
          )}

          <button type="submit" disabled={!canSave || status === "loading"} style={{
            padding: "12px", borderRadius: 10, border: "none", marginTop: 4,
            background: canSave ? "#E8380D" : "#2a2a2a",
            color: "#fff", fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 14,
            cursor: canSave ? "pointer" : "not-allowed", transition: "all 0.2s",
          }}>
            {status === "loading" ? "Enregistrement…" : "Enregistrer"}
          </button>
        </form>
      </div>
    </div>
  );
}
