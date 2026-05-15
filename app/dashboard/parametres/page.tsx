"use client";

import { useState, useRef, useEffect } from "react";

const BASE = process.env.NEXT_PUBLIC_URL_PROD || "http://localhost:3003";

function authFetch(path: string, options?: RequestInit) {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("yitewo_token") || ""
      : "";
  return fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options?.headers,
    },
  });
}

// ── Chat de test de l'agent ──────────────────────────────────────
function AgentTester() {
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<{ role: "user" | "bot"; text: string }[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  const send = async () => {
    const text = msg.trim();
    if (!text || loading) return;
    setMsg("");
    const newHistory = [...history, { role: "user" as const, text }];
    setHistory(newHistory);
    setLoading(true);
    try {
      const res = await authFetch("/whatsapp/test-agent", {
        method: "POST",
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      const reply = data.reply || data.message || data.response || "Aucune réponse";
      setHistory([...newHistory, { role: "bot", text: reply }]);
    } catch {
      setHistory([...newHistory, { role: "bot", text: "❌ Erreur de connexion au backend" }]);
    } finally {
      setLoading(false);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }
  };

  return (
    <div>
      <div
        style={{
          minHeight: 180, maxHeight: 300, overflowY: "auto",
          background: "#080812", borderRadius: "10px 10px 0 0",
          padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10,
          border: "1px solid rgba(255,255,255,0.06)", borderBottom: "none",
        }}
      >
        {history.length === 0 ? (
          <p style={{ color: "#333", fontSize: 12, textAlign: "center", marginTop: 50 }}>
            Simulez un message client WhatsApp…
          </p>
        ) : (
          history.map((h, i) => (
            <div key={i} style={{ display: "flex", justifyContent: h.role === "user" ? "flex-end" : "flex-start" }}>
              <div
                style={{
                  maxWidth: "78%", padding: "9px 13px",
                  borderRadius: h.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                  background: h.role === "user" ? "#1A9E5F" : "#1a1a2e",
                  color: "#fff", fontSize: 13, lineHeight: 1.55,
                  border: h.role === "bot" ? "1px solid rgba(255,255,255,0.07)" : "none",
                  whiteSpace: "pre-wrap",
                }}
              >
                {h.text}
              </div>
            </div>
          ))
        )}
        {loading && (
          <div style={{ display: "flex", justifyContent: "flex-start" }}>
            <div style={{ padding: "9px 18px", borderRadius: "14px 14px 14px 4px", background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.07)" }}>
              <span style={{ color: "#444", fontSize: 20, letterSpacing: 6 }}>···</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div style={{ display: "flex", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "0 0 10px 10px", overflow: "hidden" }}>
        <input
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Ex: J'ai besoin d'un plombier à Dakar…"
          style={{ flex: 1, padding: "11px 14px", background: "#13131f", border: "none", color: "#fff", fontSize: 13, outline: "none" }}
        />
        <button
          onClick={send}
          disabled={!msg.trim() || loading}
          style={{ padding: "0 20px", background: loading ? "#1a3a2a" : "#1A9E5F", border: "none", color: "#fff", cursor: !msg.trim() || loading ? "not-allowed" : "pointer", fontSize: 16, transition: "background 0.2s" }}
        >
          ➤
        </button>
      </div>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
        {["J'ai besoin d'un plombier", "Montrez-moi les boutiques", "aide", "Je veux m'inscrire comme prestataire"].map((s) => (
          <button
            key={s}
            onClick={() => setMsg(s)}
            style={{ fontSize: 11, padding: "4px 10px", borderRadius: 99, background: "rgba(26,158,95,0.1)", border: "1px solid rgba(26,158,95,0.2)", color: "#1A9E5F", cursor: "pointer" }}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Page principale ───────────────────────────────────────────────
export default function ParametresPage() {
  const [tab, setTab] = useState<"whatsapp" | "password">("whatsapp");

  // WhatsApp states
  const WEBHOOK_URL = `${process.env.NEXT_PUBLIC_URL_PROD || "https://yitewo-backend.onrender.com"}/whatsapp/webhook`;
  const [waToken, setWaToken] = useState("");
  const [waPhoneId, setWaPhoneId] = useState("");
  const [waVerify, setWaVerify] = useState("yitewo_webhook_2024");
  const [groqKey, setGroqKey] = useState("");
  const [waSaving, setWaSaving] = useState(false);
  const [waSaved, setWaSaved] = useState(false);
  const [waSaveError, setWaSaveError] = useState("");
  const [waConnected, setWaConnected] = useState(false);
  const [waLastSaved, setWaLastSaved] = useState<string | null>(null);
  const [configLoading, setConfigLoading] = useState(true);
  const [webhookCopied, setWebhookCopied] = useState(false);

  // Chargement de la config depuis le backend au montage
  useEffect(() => {
    authFetch("/whatsapp/config")
      .then((res) => res.json())
      .then((data) => {
        if (data.isConnected !== undefined) {
          setWaConnected(data.isConnected);
          // Pré-remplir phoneId et verifyToken (pas les secrets complets)
          if (data.phoneId) setWaPhoneId(data.phoneId);
          if (data.verifyToken) setWaVerify(data.verifyToken);
          if (data.updatedAt) {
            setWaLastSaved(new Date(data.updatedAt).toLocaleString("fr-FR"));
          }
        }
      })
      .catch(() => {
        // Silencieux — pas de config existante
      })
      .finally(() => setConfigLoading(false));
  }, []);

  // Password states
  const [oldPwd, setOldPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirm, setConfirm] = useState("");
  const [pwdStatus, setPwdStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [pwdError, setPwdError] = useState("");

  const canSavePwd = oldPwd && newPwd.length >= 6 && newPwd === confirm;

  const handlePwd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSavePwd) return;
    setPwdStatus("loading");
    try {
      const res = await authFetch("/auth/change-password", {
        method: "PATCH",
        body: JSON.stringify({ oldPassword: oldPwd, newPassword: newPwd }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || "Erreur");
      setPwdStatus("success");
      setOldPwd(""); setNewPwd(""); setConfirm("");
    } catch (err: any) {
      setPwdError(err?.message || "Erreur");
      setPwdStatus("error");
    }
  };

  // ── Sauvegarde WhatsApp → backend (persistance DB) ────────────
  const saveWA = async () => {
    if (!waToken || !waPhoneId || !groqKey) return;
    setWaSaving(true);
    setWaSaveError("");
    try {
      const res = await authFetch("/whatsapp/config", {
        method: "POST",
        body: JSON.stringify({
          phoneId: waPhoneId,
          token: waToken,
          verifyToken: waVerify,
          groqApiKey: groqKey,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Erreur sauvegarde");
      setWaConnected(data.isConnected);
      setWaLastSaved(new Date(data.updatedAt).toLocaleString("fr-FR"));
      setWaSaved(true);
      setTimeout(() => setWaSaved(false), 3000);
    } catch (err: any) {
      setWaSaveError(err?.message || "Erreur lors de la sauvegarde");
    } finally {
      setWaSaving(false);
    }
  };

  const copyWebhook = () => {
    navigator.clipboard?.writeText(WEBHOOK_URL);
    setWebhookCopied(true);
    setTimeout(() => setWebhookCopied(false), 2000);
  };

  const canSaveWA = !!(waToken && waPhoneId && groqKey) && !waSaving;

  const TABS = [
    { key: "whatsapp", label: "💬 WhatsApp Agent IA" },
    { key: "password", label: "🔐 Mot de passe" },
  ];

  return (
    <div style={{ padding: "28px", maxWidth: 680, margin: "0 auto" }}>
      <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 22, color: "#fff", marginBottom: 28 }}>
        Paramètres
      </h1>

      {/* Onglets */}
      <div style={{ display: "flex", gap: 4, marginBottom: 28, background: "#13131f", borderRadius: 10, padding: 4, border: "1px solid rgba(255,255,255,0.06)", width: "fit-content" }}>
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as any)}
            style={{
              padding: "7px 18px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 13,
              background: tab === t.key ? "#1A9E5F" : "transparent",
              color: tab === t.key ? "#fff" : "#555",
              fontWeight: tab === t.key ? 700 : 400, transition: "all 0.2s",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ════════════ ONGLET WHATSAPP ════════════ */}
      {tab === "whatsapp" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Bandeau statut connexion */}
          {configLoading ? (
            <div style={{ background: "#13131f", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: "14px 18px", display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ color: "#444", fontSize: 13 }}>Chargement de la configuration…</span>
            </div>
          ) : (
            <div style={{
              background: waConnected ? "rgba(26,158,95,0.08)" : "rgba(255,255,255,0.03)",
              border: `1px solid ${waConnected ? "rgba(26,158,95,0.25)" : "rgba(255,255,255,0.06)"}`,
              borderRadius: 12, padding: "14px 18px",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: waConnected ? "#1A9E5F" : "#333", boxShadow: waConnected ? "0 0 6px #1A9E5F" : "none", flexShrink: 0 }} />
                <div>
                  <p style={{ fontFamily: "Syne", fontWeight: 700, fontSize: 13, color: waConnected ? "#1A9E5F" : "#555", margin: 0 }}>
                    {waConnected ? "Agent IA connecté" : "Non configuré"}
                  </p>
                  {waLastSaved && (
                    <p style={{ fontSize: 11, color: "#444", margin: "2px 0 0" }}>
                      Dernière sauvegarde : {waLastSaved}
                    </p>
                  )}
                </div>
              </div>
              {waConnected && (
                <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 99, background: "rgba(26,158,95,0.15)", color: "#1A9E5F", border: "1px solid rgba(26,158,95,0.3)", fontWeight: 700 }}>
                  ✓ ACTIF
                </span>
              )}
            </div>
          )}

          {/* Avantages */}
          <div style={{ background: "rgba(26,158,95,0.06)", border: "1px solid rgba(26,158,95,0.15)", borderRadius: 12, padding: "14px 18px" }}>
            <p style={{ fontFamily: "Syne", fontWeight: 700, fontSize: 13, color: "#1A9E5F", marginBottom: 10 }}>
              Agent IA Groq (Llama 3.3) — gratuit · répond 24h/7j en français et wolof
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {[
                "Répond automatiquement aux clients WhatsApp",
                "Oriente vers le bon prestataire ou boutique",
                "Crée les demandes de service automatiquement",
                "Configuration sauvegardée en base de données",
              ].map((item) => (
                <div key={item} style={{ display: "flex", gap: 7, alignItems: "flex-start", fontSize: 12, color: "#666" }}>
                  <span style={{ color: "#1A9E5F", flexShrink: 0 }}>✓</span> {item}
                </div>
              ))}
            </div>
          </div>

          {/* ── ÉTAPE 1 : Groq API Key ── */}
          <div style={{ background: "#13131f", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: "20px 22px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <div style={{ width: 26, height: 26, borderRadius: "50%", background: "#1A9E5F", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "#fff", flexShrink: 0 }}>1</div>
              <p style={{ fontFamily: "Syne", fontWeight: 700, fontSize: 14, color: "#fff" }}>Obtenir la clé Groq (IA gratuite)</p>
            </div>

            <div style={{ background: "#0d0d18", borderRadius: 10, padding: "12px 14px", marginBottom: 14, fontSize: 12, color: "#666", lineHeight: 1.9 }}>
              1. Aller sur{" "}
              <a href="https://console.groq.com" target="_blank" rel="noreferrer" style={{ color: "#1A9E5F" }}>
                console.groq.com
              </a>{" "}
              → Sign up gratuit
              <br />
              2. <strong style={{ color: "#888" }}>API Keys</strong> → <strong style={{ color: "#888" }}>Create API Key</strong>
              <br />
              3. Copier la clé <code style={{ color: "#aaa", background: "#13131f", padding: "1px 5px", borderRadius: 4 }}>gsk_xxxxxxxxxx</code> ci-dessous
            </div>

            <label style={lblStyle}>Groq API Key</label>
            <input
              value={groqKey}
              onChange={(e) => setGroqKey(e.target.value)}
              type="password"
              placeholder={waConnected ? "••••••••••••••• (déjà enregistrée)" : "gsk_xxxxxxxxxxxxxxxxxxxxxxxx"}
              style={inputStyle}
            />
            <p style={{ fontSize: 11, color: "#444", marginTop: 6 }}>
              La clé est stockée de façon sécurisée dans la base de données — plus besoin du <code style={{ color: "#555" }}>.env</code>.
            </p>
          </div>

          {/* ── ÉTAPE 2 : Meta App / WhatsApp Business ── */}
          <div style={{ background: "#13131f", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: "20px 22px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <div style={{ width: 26, height: 26, borderRadius: "50%", background: "#1877F2", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "#fff", flexShrink: 0 }}>2</div>
              <p style={{ fontFamily: "Syne", fontWeight: 700, fontSize: 14, color: "#fff" }}>Créer l'app Meta WhatsApp Business</p>
            </div>

            <div style={{ background: "#0d0d18", borderRadius: 10, padding: "12px 14px", marginBottom: 14, fontSize: 12, color: "#666", lineHeight: 1.9 }}>
              1. Aller sur{" "}
              <a href="https://developers.facebook.com/apps" target="_blank" rel="noreferrer" style={{ color: "#1877F2" }}>
                developers.facebook.com
              </a>{" "}
              → <strong style={{ color: "#888" }}>Créer une application</strong> → Business
              <br />
              2. Ajouter le produit <strong style={{ color: "#888" }}>WhatsApp</strong>
              <br />
              3. Dans <strong style={{ color: "#888" }}>Configuration → Webhook</strong>, entrer l'URL ci-dessous
              <br />
              4. Copier le <strong style={{ color: "#888" }}>Phone Number ID</strong> et <strong style={{ color: "#888" }}>Access Token</strong>
            </div>

            {/* URL Webhook */}
            <label style={lblStyle}>URL Webhook à coller dans Meta</label>
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 14 }}>
              <code style={{ flex: 1, padding: "10px 13px", borderRadius: 8, background: "#080812", color: "#1A9E5F", fontSize: 12, border: "1px solid rgba(26,158,95,0.2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }}>
                {WEBHOOK_URL}
              </code>
              <button
                onClick={copyWebhook}
                style={{ padding: "9px 14px", borderRadius: 8, background: webhookCopied ? "rgba(16,185,129,0.15)" : "rgba(26,158,95,0.1)", border: "1px solid rgba(26,158,95,0.25)", color: webhookCopied ? "#10b981" : "#1A9E5F", cursor: "pointer", fontSize: 12, fontWeight: 600, flexShrink: 0, transition: "all 0.2s" }}
              >
                {webhookCopied ? "✅ Copié" : "📋 Copier"}
              </button>
            </div>

            {/* Champs */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={lblStyle}>Phone Number ID</label>
                <input
                  value={waPhoneId}
                  onChange={(e) => setWaPhoneId(e.target.value)}
                  placeholder="Ex: 123456789012345"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={lblStyle}>Access Token (permanent)</label>
                <input
                  value={waToken}
                  onChange={(e) => setWaToken(e.target.value)}
                  type="password"
                  placeholder={waConnected && !waToken ? "••••••••••••••• (déjà enregistré)" : "EAAxxxxxxxxxxxxxx…"}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={lblStyle}>Token de vérification webhook</label>
                <input
                  value={waVerify}
                  onChange={(e) => setWaVerify(e.target.value)}
                  placeholder="yitewo_webhook_2024"
                  style={inputStyle}
                />
              </div>
            </div>

            {/* Erreur sauvegarde */}
            {waSaveError && (
              <div style={{ marginTop: 12, padding: "10px 14px", borderRadius: 8, background: "rgba(232,56,13,0.1)", border: "1px solid rgba(232,56,13,0.25)", color: "#ff8a70", fontSize: 12 }}>
                ❌ {waSaveError}
              </div>
            )}

            {/* Bouton sauvegarde */}
            <button
              onClick={saveWA}
              disabled={!canSaveWA}
              style={{
                marginTop: 16, width: "100%", padding: "12px", borderRadius: 10,
                background: waSaved ? "rgba(16,185,129,0.15)" : canSaveWA ? "#1A9E5F" : "#1a1a1a",
                color: waSaved ? "#10b981" : canSaveWA ? "#fff" : "#333",
                fontFamily: "Syne", fontWeight: 700, fontSize: 14,
                cursor: canSaveWA ? "pointer" : "not-allowed",
                transition: "all 0.2s",
                border: waSaved ? "1px solid rgba(16,185,129,0.3)" : "none",
              } as React.CSSProperties}
            >
              {waSaving
                ? "⏳ Sauvegarde en cours…"
                : waSaved
                  ? "✅ Configuration sauvegardée en base !"
                  : "💾 Sauvegarder la configuration"}
            </button>

            <p style={{ fontSize: 11, color: "#333", marginTop: 8, textAlign: "center" }}>
              Les credentials sont stockés en base de données — persistants après redémarrage.
            </p>
          </div>

          {/* ── ÉTAPE 3 : Tester l'agent ── */}
          <div style={{ background: "#13131f", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: "20px 22px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <div style={{ width: 26, height: 26, borderRadius: "50%", background: "#8b5cf6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "#fff", flexShrink: 0 }}>3</div>
              <p style={{ fontFamily: "Syne", fontWeight: 700, fontSize: 14, color: "#fff" }}>Tester l'agent IA</p>
            </div>
            <p style={{ fontSize: 12, color: "#555", marginBottom: 14 }}>
              Simulez un message client pour vérifier que l'agent répond correctement avant de le connecter à WhatsApp.
            </p>
            <AgentTester />
          </div>
        </div>
      )}

      {/* ════════════ ONGLET MOT DE PASSE ════════════ */}
      {tab === "password" && (
        <div style={{ background: "#13131f", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: "24px" }}>
          <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 16, color: "#fff", marginBottom: 20 }}>
            🔐 Changer le mot de passe
          </h2>

          {pwdStatus === "success" && (
            <div style={{ background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#10b981", marginBottom: 16 }}>
              ✅ Mot de passe mis à jour avec succès
            </div>
          )}
          {pwdStatus === "error" && (
            <div style={{ background: "rgba(232,56,13,0.12)", border: "1px solid rgba(232,56,13,0.3)", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#ff8a70", marginBottom: 16 }}>
              ❌ {pwdError}
            </div>
          )}

          <form onSubmit={handlePwd} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              { label: "Mot de passe actuel", val: oldPwd, set: setOldPwd },
              { label: "Nouveau mot de passe (min. 6 caractères)", val: newPwd, set: setNewPwd },
              { label: "Confirmer le nouveau mot de passe", val: confirm, set: setConfirm },
            ].map((f) => (
              <div key={f.label}>
                <label style={lblStyle}>{f.label}</label>
                <input
                  type="password"
                  value={f.val}
                  onChange={(e) => f.set(e.target.value)}
                  required
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = "#E8380D")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
                />
              </div>
            ))}
            {newPwd && confirm && newPwd !== confirm && (
              <p style={{ fontSize: 12, color: "#ef4444" }}>Les mots de passe ne correspondent pas</p>
            )}
            <button
              type="submit"
              disabled={!canSavePwd || pwdStatus === "loading"}
              style={{
                padding: "12px", borderRadius: 10, border: "none", marginTop: 4,
                background: canSavePwd ? "#E8380D" : "#1a1a1a",
                color: canSavePwd ? "#fff" : "#333",
                fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 14,
                cursor: canSavePwd ? "pointer" : "not-allowed", transition: "all 0.2s",
              }}
            >
              {pwdStatus === "loading" ? "Enregistrement…" : "Enregistrer le mot de passe"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

const lblStyle: React.CSSProperties = {
  fontSize: 12, fontWeight: 600, color: "#555", display: "block", marginBottom: 6,
};
const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 13px", borderRadius: 8,
  background: "#080812", border: "1px solid rgba(255,255,255,0.08)",
  color: "#fff", fontSize: 13, outline: "none",
  fontFamily: "DM Sans, sans-serif", boxSizing: "border-box",
  transition: "border-color 0.2s",
};