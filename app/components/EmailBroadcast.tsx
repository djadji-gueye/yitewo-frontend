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
type Mode = "partners" | "list";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function parseEmailsPreview(raw: string): { valid: string[]; invalidCount: number } {
    const tokens = raw.split(/[\n,;]+/).map((t) => t.trim().toLowerCase()).filter(Boolean);
    const seen = new Set<string>();
    const valid: string[] = [];
    let invalidCount = 0;
    for (const t of tokens) {
        if (!EMAIL_RE.test(t)) { invalidCount++; continue; }
        if (seen.has(t)) continue;
        seen.add(t);
        valid.push(t);
    }
    return { valid, invalidCount };
}

export default function EmailBroadcast() {
    const [mode, setMode] = useState<Mode>("partners");
    const [targetType, setTargetType] = useState("all");
    const [subject, setSubject] = useState("");
    const [body, setBody] = useState("");
    const [emailsRaw, setEmailsRaw] = useState("");
    const [status, setStatus] = useState<Status>("idle");
    const [result, setResult] = useState<{ sent: number; failed: number; total: number; invalid?: number; message?: string } | null>(null);

    const { valid: parsedEmails, invalidCount } = parseEmailsPreview(emailsRaw);

    const canSend = mode === "partners"
        ? Boolean(subject.trim() && body.trim())
        : Boolean(subject.trim() && body.trim() && parsedEmails.length > 0);

    const handleSend = async () => {
        if (!canSend) return;

        const confirmMsg = mode === "partners"
            ? `Envoyer cet email à tous les partenaires (${targetType === "all" ? "tous types" : targetType}) actifs ayant un email ?`
            : `Envoyer cette invitation à ${parsedEmails.length} adresse(s) externe(s) ?`;
        if (!confirm(confirmMsg)) return;

        setStatus("sending");
        try {
            const token = typeof window !== "undefined" ? localStorage.getItem("yitewo_token") : "";
            const url = mode === "partners" ? `${BASE}/admin/email-broadcast` : `${BASE}/admin/email-broadcast/list`;
            const payload = mode === "partners"
                ? { subject, body, targetType }
                : { subject, body, emailsRaw };

            const res = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            setResult(data);
            setStatus("success");
        } catch (err) {
            console.error("Broadcast error:", err);
            setStatus("error");
        }
    };

    const reset = () => { setStatus("idle"); setSubject(""); setBody(""); setEmailsRaw(""); setResult(null); };

    return (
        <div style={{ background: "#13131f", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: "24px" }}>
            <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 16, color: "#fff", marginBottom: 6 }}>
                📢 Communication groupée
            </h2>
            <p style={{ fontSize: 12, color: "#555", marginBottom: 16 }}>
                Envoyez un email à vos partenaires, ou invitez une liste d'adresses externes à rejoindre Yitewo.
            </p>

            {status !== "success" && (
                <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
                    <button onClick={() => setMode("partners")}
                        style={{ flex: 1, padding: "10px 14px", borderRadius: 10, border: `2px solid ${mode === "partners" ? "#E8380D" : "rgba(255,255,255,0.08)"}`, background: mode === "partners" ? "#E8380D22" : "transparent", color: mode === "partners" ? "#fff" : "#555", cursor: "pointer", fontSize: 12, fontWeight: mode === "partners" ? 700 : 400 }}>
                        👥 Partenaires existants
                    </button>
                    <button onClick={() => setMode("list")}
                        style={{ flex: 1, padding: "10px 14px", borderRadius: 10, border: `2px solid ${mode === "list" ? "#E8380D" : "rgba(255,255,255,0.08)"}`, background: mode === "list" ? "#E8380D22" : "transparent", color: mode === "list" ? "#fff" : "#555", cursor: "pointer", fontSize: 12, fontWeight: mode === "list" ? 700 : 400 }}>
                        ✉️ Liste externe (prospects)
                    </button>
                </div>
            )}

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
                    {mode === "partners" ? (
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
                    ) : (
                        <div>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                                <label style={lbl}>Liste d'emails externes *</label>
                                <span style={{ fontSize: 11, color: parsedEmails.length ? "#10b981" : "#555" }}>
                                    {parsedEmails.length} valide(s){invalidCount ? ` · ${invalidCount} ignorée(s)` : ""}
                                </span>
                            </div>
                            <textarea value={emailsRaw} onChange={(e) => setEmailsRaw(e.target.value)}
                                placeholder={"Collez les emails ici, un par ligne ou séparés par des virgules :\ncontact@boutique1.com\ncontact@boutique2.com, contact@boutique3.com"}
                                style={{ ...inp, height: 120, resize: "vertical" as const, fontFamily: "monospace" }} />
                            <p style={{ fontSize: 11, color: "#444", marginTop: 4 }}>
                                💡 Colle ta liste d'emails collectés manuellement (annuaires, salons, etc.). Doublons et adresses invalides filtrés automatiquement. Limite de 500 envois par lot.
                            </p>
                        </div>
                    )}

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
                            {mode === "partners"
                                ? "💡 Écrivez une ligne par paragraphe. Le nom du partenaire sera inséré automatiquement en en-tête."
                                : "💡 Écrivez une ligne par paragraphe. Un bouton d'inscription sera ajouté automatiquement à la fin."}
                        </p>
                    </div>

                    {/* Aperçu */}
                    {subject && body && (
                        <div style={{ background: "#0a0a14", borderRadius: 10, padding: "14px", border: "1px solid rgba(255,255,255,0.05)" }}>
                            <p style={{ fontSize: 11, color: "#444", marginBottom: 8, fontWeight: 600 }}>APERÇU</p>
                            <p style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>Objet : <span style={{ color: "#fff" }}>{subject} — Yitewo</span></p>
                            <p style={{ fontSize: 12, color: "#555" }}>Bonjour {mode === "partners" ? "[Nom du partenaire]" : ""} 👋</p>
                            <p style={{ fontSize: 12, color: "#666", marginTop: 4 }}>{body.slice(0, 120)}{body.length > 120 ? "…" : ""}</p>
                            {mode === "list" && (
                                <p style={{ fontSize: 11, color: "#E8380D", marginTop: 8 }}>+ bouton "Créer mon compte gratuit sur Yitewo →" ajouté automatiquement</p>
                            )}
                        </div>
                    )}

                    {status === "error" && (
                        <div style={{ background: "rgba(239,68,68,0.1)", borderRadius: 10, padding: "10px 14px", fontSize: 12, color: "#ef4444" }}>
                            ❌ Erreur lors de l'envoi. Vérifiez la configuration email du serveur.
                        </div>
                    )}

                    <button onClick={handleSend} disabled={!canSend || status === "sending"}
                        style={{ width: "100%", padding: "14px", borderRadius: 12, border: "none", background: canSend ? "#E8380D" : "#1a1a1a", color: canSend ? "#fff" : "#444", fontFamily: "Syne", fontWeight: 700, fontSize: 14, cursor: canSend ? "pointer" : "not-allowed", transition: "background .2s" }}>
                        {status === "sending"
                            ? "⏳ Envoi en cours… (patientez)"
                            : mode === "partners"
                                ? "📤 Envoyer le message groupé"
                                : `📤 Envoyer ${parsedEmails.length || ""} invitation(s)`}
                    </button>
                </div>
            )}
        </div>
    );
}

const lbl: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: "#888", display: "block", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" };
const inp: React.CSSProperties = { width: "100%", padding: "11px 14px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)", background: "#0d0d1a", color: "#fff", fontSize: 13, outline: "none", fontFamily: "DM Sans, sans-serif", boxSizing: "border-box" as const };