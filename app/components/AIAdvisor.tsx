"use client";

import { useState } from "react";

interface Props {
  partner: any;
  orders: any[];
  products: any[];
  stats?: any;
}

const QUICK_QUESTIONS = [
  "Comment augmenter mes ventes cette semaine ?",
  "Quels produits devrais-je ajouter ?",
  "Comment améliorer ma note clients ?",
  "Faut-il que je lance une promo ?",
];

export default function AIAdvisor({ partner, orders, products, stats }: Props) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: "user" | "ai"; text: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const buildPrompt = (question: string) => {
    const pending = orders.filter((o) => o.status === "PENDING").length;
    const delivered = orders.filter((o) => o.status === "DELIVERED").length;
    const revenue = orders.filter((o) => o.status === "DELIVERED").reduce((s, o) => s + (o.totalPrice || 0), 0);
    const active = products.filter((p) => p.isActive).length;
    const history = messages.slice(-4).map((m) => `${m.role === "user" ? "Marchand" : "Conseiller"}: ${m.text}`).join("\n");

    return `Tu es le conseiller Yitewo, un assistant bienveillant qui aide les commerçants sénégalais à mieux vendre.
Réponds en français, de façon directe et pratique. Maximum 3-4 phrases. Sois concret et actionnable.

Données du marchand :
- Nom: ${partner?.name} (${partner?.type}, ${partner?.city})
- Produits actifs: ${active}/${products.length}
- Commandes: ${orders.length} total, ${pending} en attente, ${delivered} livrées
- Revenus: ${revenue.toLocaleString()} FCFA
- Abonnés: ${stats?.followers ?? 0}
- Note: ${stats?.avgRating ? `${stats.avgRating}/5 (${stats?.reviewCount} avis)` : "Aucun avis encore"}
- Badge: ${stats?.badge ?? "Aucun badge"}

${history ? `Conversation précédente:\n${history}\n` : ""}
Question du marchand: ${question}

Réponse du conseiller Yitewo:`;
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    const q = text.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: q }]);
    setLoading(true);

    try {
      const prompt = encodeURIComponent(buildPrompt(q));
      const res = await fetch(`https://text.pollinations.ai/${prompt}`, {
        headers: { "Accept": "text/plain" },
      });
      const reply = await res.text();
      setMessages((prev) => [...prev, { role: "ai", text: reply.trim() }]);
    } catch {
      setMessages((prev) => [...prev, { role: "ai", text: "Je n'ai pas pu répondre. Réessayez dans un instant." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {!open && (
        <div onClick={() => setOpen(true)} style={{
          position: "fixed", bottom: 28, right: 28, zIndex: 300,
          background: "#E8380D", borderRadius: 99,
          padding: "13px 20px", cursor: "pointer",
          display: "flex", alignItems: "center", gap: 10,
          boxShadow: "0 8px 24px rgba(232,56,13,0.4)",
          fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 14, color: "#fff",
          transition: "transform 0.2s",
        }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          <span style={{ fontSize: 18 }}>✨</span> Conseiller IA
        </div>
      )}

      {open && (
        <div style={{
          position: "fixed", bottom: 24, right: 24, zIndex: 300,
          width: "min(420px, calc(100vw - 48px))",
          background: "#fff", borderRadius: 20,
          border: "1px solid #f0ebe8",
          boxShadow: "0 24px 64px rgba(0,0,0,0.15)",
          display: "flex", flexDirection: "column",
          maxHeight: "78vh", fontFamily: "DM Sans, sans-serif",
          overflow: "hidden",
        }}>

          {/* Header */}
          <div style={{ background: "linear-gradient(135deg, #1a0500, #E8380D)", padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>✨</div>
              <div>
                <p style={{ fontSize: 14, fontFamily: "Syne,sans-serif", fontWeight: 700, color: "#fff", margin: 0 }}>Conseiller Yitewo</p>
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", margin: 0 }}>Personnalisé pour {partner?.name}</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: 8, width: 28, height: 28, cursor: "pointer", color: "#fff", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: "16px 16px 8px" }}>
            {messages.length === 0 && (
              <div style={{ textAlign: "center", padding: "16px 8px" }}>
                <div style={{ fontSize: 32, marginBottom: 10 }}>👋</div>
                <p style={{ fontSize: 14, fontWeight: 600, color: "#1a1a1a", marginBottom: 4 }}>Bonjour {partner?.name?.split(" ")[0]} !</p>
                <p style={{ fontSize: 12, color: "#6b6b6b", lineHeight: 1.6, marginBottom: 16 }}>Je connais vos données. Posez-moi n'importe quelle question sur votre activité.</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                  {QUICK_QUESTIONS.map((q) => (
                    <button key={q} onClick={() => sendMessage(q)} style={{
                      padding: "9px 14px", borderRadius: 10, border: "1px solid #f0ebe8",
                      background: "#fafaf8", fontSize: 12, color: "#1a1a1a", cursor: "pointer",
                      textAlign: "left", fontFamily: "DM Sans, sans-serif", transition: "all 0.15s",
                    }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "#fff5f3"; e.currentTarget.style.borderColor = "#fdd0c5"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "#fafaf8"; e.currentTarget.style.borderColor = "#f0ebe8"; }}
                    >
                      💬 {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m, i) => (
              <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", marginBottom: 10 }}>
                {m.role === "ai" && (
                  <div style={{ width: 26, height: 26, borderRadius: 7, background: "#fff5f3", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0, marginRight: 8, marginTop: 2 }}>✨</div>
                )}
                <div style={{
                  maxWidth: "78%", padding: "10px 14px",
                  borderRadius: m.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                  background: m.role === "user" ? "#E8380D" : "#f7f4f2",
                  color: m.role === "user" ? "#fff" : "#1a1a1a",
                  fontSize: 13, lineHeight: 1.6, whiteSpace: "pre-wrap",
                }}>
                  {m.text}
                </div>
              </div>
            ))}

            {loading && (
              <div style={{ display: "flex", gap: 8, alignItems: "center", padding: "6px 0" }}>
                <div style={{ width: 26, height: 26, borderRadius: 7, background: "#fff5f3", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>✨</div>
                <div style={{ display: "flex", gap: 4 }}>
                  {[0, 1, 2].map((i) => (
                    <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: "#E8380D", animation: "bounce 1.2s infinite", animationDelay: `${i * 0.2}s` }} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Suggestions rapides */}
          {messages.length > 0 && !loading && (
            <div style={{ padding: "0 14px 8px", display: "flex", gap: 6, flexWrap: "wrap" }}>
              {QUICK_QUESTIONS.slice(0, 2).map((q) => (
                <button key={q} onClick={() => sendMessage(q)} style={{ padding: "4px 10px", borderRadius: 99, border: "1px solid #f0ebe8", background: "#fff", fontSize: 11, color: "#6b6b6b", cursor: "pointer", fontFamily: "DM Sans,sans-serif" }}>
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={{ padding: "10px 14px", borderTop: "1px solid #f0ebe8", display: "flex", gap: 8 }}>
            <input value={input} onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); sendMessage(input); } }}
              placeholder="Posez votre question…"
              style={{ flex: 1, padding: "9px 13px", borderRadius: 10, border: "1px solid #f0ebe8", fontSize: 13, outline: "none", fontFamily: "DM Sans,sans-serif", background: "#fafaf8" }}
            />
            <button onClick={() => sendMessage(input)} disabled={!input.trim() || loading} style={{
              width: 38, height: 38, borderRadius: 9, border: "none",
              background: input.trim() ? "#E8380D" : "#f0ebe8",
              color: input.trim() ? "#fff" : "#ccc",
              cursor: input.trim() ? "pointer" : "not-allowed", fontSize: 16,
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>↑</button>
          </div>
          <style>{`@keyframes bounce{0%,80%,100%{transform:scale(0.6);opacity:0.4}40%{transform:scale(1);opacity:1}}`}</style>
        </div>
      )}
    </>
  );
}
