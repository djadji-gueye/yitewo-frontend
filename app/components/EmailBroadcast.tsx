"use client";

import { useState } from "react";

const BASE = process.env.NEXT_PUBLIC_URL_PROD || "http://localhost:3003";

const TYPES = [
    { value: "all", label: "Tous les partenaires", icon: "👥", color: "#1a1a1a" },
    { value: "Marchand", label: "Marchands uniquement", icon: "🛒", color: "#0369a1" },
    { value: "Restaurant", label: "Restaurants uniquement", icon: "🍽️", color: "#b45309" },
    { value: "Prestataire", label: "Prestataires uniquement", icon: "🔧", color: "#065f46" },
];

type Status = "idle" | "sending" | "success" | "error";

export default function EmailBroadcast() {
    const [targetType, setTargetType] = useState("all");
    const [subject, setSubject] = useState("");
    const [body, setBody] = useState("");
    const [status, setStatus] = useState<Status>("idle");
    const [result, setResult] = useState<{ sent: number; failed: number; total: number } | null>(null);

    const canSend = subject.trim() && body.trim();

    const handleSend = async () => {
        if (!canSend) return;
        if (!confirm(`Envoyer cet email à tous les partenaires (${targetType === "all" ? "tous types" : targetType}) actifs ayant un email ?`)) return;
        setStatus("sending");
        try {
            const token = typeof window !== "undefined" ? localStorage.getItem("yitewo_token") : "";
            const res = await fetch(`${BASE}/admin/email-broadcast`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ subject, body, targetType }),
            });
            const data = await res.json();
            setResult(data);
            setStatus("success");
        } catch {
            setStatus("error");
        }
    };

    const reset = () => { setStatus("idle"); setSubject(""); setBody(""); setResult(null); };

    return (
        <div style={{ background: "#13131f", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: "24px" }}>
            <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 16, color: "#fff", marginBottom: 6 }}>
                📢 Communication groupée
            </h2>
            <p style={{ fontSize: 12, color: "#555", marginBottom: 20 }}>
                Envoyez un email à tous les partenaires actifs ayant fourni leur adresse email.
            </p>

            {status === "success" && result ? (
                <div style={{ textAlign: "center", padding: "32px 0" }}>
                    <div style={{ fontSize: 52, marginBottom: 12 }}>✅</div>
                    <p style={{ fontFamily: "Syne", fontWeight: 700, fontSize: 18, color: "#fff", marginBottom: 8 }}>Envoi terminé</p>
                    <div style={{ display: "flex", gap: 16, justifyContent: "center", margin: "16px 0" }}>
                        <div style={{ padding: "12px 20px", background: "rgba(16,185,129,0.1)", borderRadius: 10, textAlign: "center" }}>
                            <div style={{ fontSize: 24, fontWeight: 700, color: "#10b981" }}>{result.sent}</div>
                            <div style={{ fontSize: 11, color: "#555" }}>Envoyés</div>
                        </div>
                        <div style={{ padding: "12px 20px", background: "rgba(239,68,68,0.1)", borderRadius: 10, textAlign: "center" }}>
                            <div style={{ fontSize: 24, fontWeight: 700, color: "#ef4444" }}>{result.failed}</div>
                            <div style={{ fontSize: 11, color: "#555" }}>Échecs</div>
                        </div>
                        <div style={{ padding: "12px 20px", background: "rgba(255,255,255,0.05)", borderRadius: 10, textAlign: "center" }}>
                            <div style={{ fontSize: 24, fontWeight: 700, color: "#888" }}>{result.total}</div>
                            <div style={{ fontSize: 11, color: "#555" }}>Total</div>
                        </div>
                    </div>
                    <button onClick={reset} style={{ padding: "10px 24px", borderRadius: 99, border: "none", background: "#E8380D", color: "#fff", fontFamily: "Syne", fontWeight: 700, cursor: "pointer", fontSize: 13 }}>
                        Nouveau message
                    </button>
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

                    {/* Cible */}
                    <div>
                        <label style={lbl}>Destinataires</label>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                            {TYPES.map((t) => (
                                <button key={t.value} onClick={() => setTargetType(t.value)}
                                    style={{ padding: "10px 14px", borderRadius: 10, border: `2px solid ${targetType === t.value ? t.color : "rgba(255,255,255,0.08)"}`, background: targetType === t.value ? t.color + "22" : "transparent", color: targetType === t.value ? "#fff" : "#555", cursor: "pointer", fontSize: 12, fontWeight: targetType === t.value ? 700 : 400, display: "flex", alignItems: "center", gap: 8, transition: "all .2s" }}>
                                    <span>{t.icon}</span> {t.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Sujet */}
                    <div>
                        <label style={lbl}>Objet de l'email *</label>
                        <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Ex : Nouveauté Yitewo — Mise à jour importante" style={inp} />
                    </div>

                    {/* Corps */}
                    <div>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                            <label style={lbl}>Contenu du message *</label>
                            <span style={{ fontSize: 11, color: "#555" }}>{body.length} caractères</span>
                        </div>
                        <textarea value={body} onChange={(e) => setBody(e.target.value)}
                            placeholder={"Chers partenaires,\n\nNous souhaitons vous informer de...\n\nCordialement,\nL'équipe Yitewo"}
                            style={{ ...inp, height: 180, resize: "vertical" as const }} />
                        <p style={{ fontSize: 11, color: "#444", marginTop: 4 }}>
                            💡 Écrivez une ligne par paragraphe. Le nom du partenaire sera inséré automatiquement en en-tête.
                        </p>
                    </div>

                    {/* Aperçu */}
                    {subject && body && (
                        <div style={{ background: "#0a0a14", borderRadius: 10, padding: "14px", border: "1px solid rgba(255,255,255,0.05)" }}>
                            <p style={{ fontSize: 11, color: "#444", marginBottom: 8, fontWeight: 600 }}>APERÇU</p>
                            <p style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>Objet : <span style={{ color: "#fff" }}>{subject} — Yitewo</span></p>
                            <p style={{ fontSize: 12, color: "#555" }}>Bonjour [Nom du partenaire] 👋</p>
                            <p style={{ fontSize: 12, color: "#666", marginTop: 4 }}>{body.slice(0, 120)}{body.length > 120 ? "…" : ""}</p>
                        </div>
                    )}

                    {status === "error" && (
                        <div style={{ background: "rgba(239,68,68,0.1)", borderRadius: 10, padding: "10px 14px", fontSize: 12, color: "#ef4444" }}>
                            ❌ Erreur lors de l'envoi. Vérifiez la configuration email du serveur.
                        </div>
                    )}

                    <button onClick={handleSend} disabled={!canSend || status === "sending"}
                        style={{ width: "100%", padding: "14px", borderRadius: 12, border: "none", background: canSend ? "#E8380D" : "#1a1a1a", color: canSend ? "#fff" : "#444", fontFamily: "Syne", fontWeight: 700, fontSize: 14, cursor: canSend ? "pointer" : "not-allowed", transition: "background .2s" }}>
                        {status === "sending" ? "⏳ Envoi en cours… (patientez)" : "📤 Envoyer le message groupé"}
                    </button>
                </div>
            )}
        </div>
    );
}

const lbl: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: "#888", display: "block", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" };
const inp: React.CSSProperties = { width: "100%", padding: "11px 14px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)", background: "#0d0d1a", color: "#fff", fontSize: 13, outline: "none", fontFamily: "DM Sans, sans-serif", boxSizing: "border-box" as const };