"use client";

import { useState, useEffect, useCallback } from "react";

const BASE = process.env.NEXT_PUBLIC_URL_PROD || "http://localhost:3003";

const PLAN_COLORS: Record<string, string> = {
  free: "#6b7280", pro: "#E8380D", business: "#1A9E5F", enterprise: "#6366f1",
};
const PLAN_ICONS: Record<string, string> = {
  free: "🌱", pro: "🚀", business: "⭐", enterprise: "🏢",
};
const PLAN_PRICES: Record<string, number> = {
  pro: 4900, business: 14900, enterprise: 49000,
};

function authFetch(path: string, options?: RequestInit) {
  const token = typeof window !== "undefined"
    ? localStorage.getItem("yitewo_token") || "" : "";
  return fetch(`${BASE}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...options?.headers },
  }).then(r => r.json());
}

export default function AbonnementsAdminPage() {
  const [tab, setTab] = useState<"pending" | "all">("pending");
  const [pending, setPending] = useState<any[]>([]);
  const [subs, setSubs] = useState<any[]>([]);
  const [stats, setStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);
  const [activateForm, setActivateForm] = useState<{ partnerId: string; partnerName: string } | null>(null);
  const [newPlan, setNewPlan] = useState("pro");
  const [newBilling, setNewBilling] = useState("mensuel");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [p, s, st] = await Promise.all([
        authFetch("/subscriptions/pending-payments"),
        authFetch("/subscriptions"),
        authFetch("/subscriptions/stats"),
      ]);
      setPending(Array.isArray(p) ? p : []);
      setSubs(Array.isArray(s) ? s : []);
      setStats(Array.isArray(st) ? st : []);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const confirmPayment = async (paymentId: string) => {
    setActing(paymentId);
    try {
      await authFetch(`/subscriptions/payments/${paymentId}/confirm`, {
        method: "PATCH", body: JSON.stringify({}),
      });
      await load();
    } finally { setActing(null); }
  };

  const activatePlan = async () => {
    if (!activateForm?.partnerId) return;
    setActing("activate");
    try {
      await authFetch("/subscriptions/activate", {
        method: "POST",
        body: JSON.stringify({ partnerId: activateForm.partnerId, plan: newPlan, billing: newBilling }),
      });
      setActivateForm(null);
      await load();
    } finally { setActing(null); }
  };

  const revokePlan = async (partnerId: string, name: string) => {
    if (!confirm(`Révoquer le plan de ${name} → repasse en Gratuit ?`)) return;
    setActing(partnerId);
    try {
      await authFetch(`/subscriptions/partners/${partnerId}/revoke`, {
        method: "PATCH", body: JSON.stringify({}),
      });
      await load();
    } finally { setActing(null); }
  };

  const mrr = subs
    .filter(s => s.isActive && s.plan !== "free")
    .reduce((acc, s) => acc + (PLAN_PRICES[s.plan] || 0), 0);

  return (
    <div style={{ padding: "24px 28px", maxWidth: 960, margin: "0 auto" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: "Syne", fontWeight: 800, fontSize: 22, color: "#fff", marginBottom: 4 }}>
            Abonnements 💳
          </h1>
          {pending.length > 0 && (
            <p style={{ fontSize: 13, color: "#f59e0b" }}>
              ⚡ {pending.length} paiement{pending.length > 1 ? "s" : ""} en attente de confirmation
            </p>
          )}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={load} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "7px 14px", color: "#888", fontSize: 12, cursor: "pointer" }}>
            ↻ Actualiser
          </button>
          <button onClick={() => setActivateForm({ partnerId: "", partnerName: "" })}
            style={{ background: "#1A9E5F", border: "none", borderRadius: 8, padding: "7px 16px", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
            + Activer un plan
          </button>
        </div>
      </div>

      {/* Stats MRR */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px,1fr))", gap: 10, marginBottom: 24 }}>
        {[
          { label: "Revenu mensuel (MRR)", v: `${mrr.toLocaleString("fr-FR")} FCFA`, c: "#10b981" },
          { label: "En attente paiement", v: pending.length, c: pending.length > 0 ? "#f59e0b" : "#555" },
          ...stats.map((s: any) => ({
            label: `Plan ${s.plan}`, v: s._count.plan, c: PLAN_COLORS[s.plan] || "#888",
          })),
        ].map(s => (
          <div key={s.label} style={{ background: "#13131f", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "12px 14px" }}>
            <p style={{ fontFamily: "Syne", fontWeight: 800, fontSize: 20, color: s.c as string, marginBottom: 2 }}>{s.v}</p>
            <p style={{ fontSize: 11, color: "#555" }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 3, background: "#13131f", borderRadius: 10, padding: 3, border: "1px solid rgba(255,255,255,0.06)", width: "fit-content", marginBottom: 20 }}>
        {[
          { key: "pending", label: `⚡ En attente${pending.length > 0 ? ` (${pending.length})` : ""}` },
          { key: "all", label: "📋 Tous les abonnements" },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key as any)} style={{
            padding: "7px 16px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12,
            background: tab === t.key ? "#E8380D" : "transparent",
            color: tab === t.key ? "#fff" : "#555",
            fontWeight: tab === t.key ? 700 : 400,
          }}>{t.label}</button>
        ))}
      </div>

      {/* Paiements en attente */}
      {tab === "pending" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {pending.length === 0 ? (
            <div style={{ textAlign: "center", padding: 40, color: "#555", background: "#13131f", borderRadius: 14 }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
              <p>Aucun paiement en attente</p>
            </div>
          ) : pending.map((payment: any) => {
            const sub = payment.subscription;
            const partner = sub?.partner;
            return (
              <div key={payment.id} style={{ background: "#13131f", border: "1.5px solid rgba(245,158,11,0.3)", borderRadius: 14, padding: "16px 18px" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 14, flexWrap: "wrap" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
                      <span style={{ fontFamily: "Syne", fontWeight: 700, fontSize: 14, color: "#fff" }}>{partner?.name}</span>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: `${PLAN_COLORS[sub?.plan] || "#888"}22`, color: PLAN_COLORS[sub?.plan] || "#888" }}>
                        {PLAN_ICONS[sub?.plan]} {sub?.plan?.toUpperCase()} · {sub?.billing}
                      </span>
                      <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 99, background: "rgba(245,158,11,0.15)", color: "#f59e0b", fontWeight: 600 }}>
                        ⏳ À confirmer
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: 14, flexWrap: "wrap", fontSize: 12, color: "#555" }}>
                      <span>💰 {payment.amount?.toLocaleString("fr-FR")} FCFA</span>
                      <span>📱 {payment.method}</span>
                      {payment.reference && <span>🔖 Réf: <strong style={{ color: "#888" }}>{payment.reference}</strong></span>}
                      <span>📞 {partner?.contact}</span>
                      <span>📍 {partner?.city}</span>
                      <span>🗓️ {new Date(payment.createdAt).toLocaleDateString("fr-FR")}</span>
                    </div>
                    {payment.notes && (
                      <p style={{ fontSize: 11, color: "#444", marginTop: 6, fontStyle: "italic" }}>{payment.notes}</p>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 8, flexShrink: 0, alignItems: "center" }}>
                    <button onClick={() => confirmPayment(payment.id)} disabled={acting === payment.id}
                      style={{ padding: "9px 18px", borderRadius: 8, border: "none", background: "#10b981", color: "#fff", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>
                      {acting === payment.id ? "…" : "✅ Confirmer"}
                    </button>
                    <button onClick={() => revokePlan(partner?.id, partner?.name)} disabled={!!acting}
                      style={{ padding: "9px 12px", borderRadius: 8, border: "1px solid rgba(239,68,68,0.3)", background: "transparent", color: "#ef4444", fontSize: 12, cursor: "pointer" }}>
                      ✗ Rejeter
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tous les abonnements */}
      {tab === "all" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {subs.length === 0 ? (
            <div style={{ textAlign: "center", padding: 40, color: "#555", background: "#13131f", borderRadius: 14 }}>
              Aucun abonnement enregistré
            </div>
          ) : subs.map((sub: any) => (
            <div key={sub.id} style={{ background: "#13131f", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: "14px 16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <span style={{ fontSize: 20 }}>{PLAN_ICONS[sub.plan]}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 3 }}>
                    <span style={{ fontFamily: "Syne", fontWeight: 700, fontSize: 13, color: "#fff" }}>{sub.partner?.name}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, color: PLAN_COLORS[sub.plan] || "#888" }}>{sub.plan?.toUpperCase()}</span>
                    <span style={{ fontSize: 10, color: sub.isActive ? "#10b981" : "#555" }}>
                      {sub.isActive ? "● Actif" : "○ Inactif"}
                    </span>
                    <span style={{ fontSize: 10, color: "#444" }}>{sub.billing}</span>
                  </div>
                  <div style={{ fontSize: 11, color: "#444", display: "flex", gap: 12, flexWrap: "wrap" }}>
                    {sub.endDate && <span>Expire le {new Date(sub.endDate).toLocaleDateString("fr-FR")}</span>}
                    <span>{sub.partner?.city}</span>
                    <span>{sub.partner?.contact}</span>
                    {sub.payments?.length > 0 && (
                      <span style={{ color: "#555" }}>
                        Dernier paiement : {sub.payments[0].amount?.toLocaleString("fr-FR")} FCFA · {sub.payments[0].status}
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                  <button onClick={() => setActivateForm({ partnerId: sub.partner?.id, partnerName: sub.partner?.name })}
                    style={{ fontSize: 11, padding: "5px 10px", borderRadius: 6, border: "1px solid rgba(26,158,95,0.3)", background: "transparent", color: "#1A9E5F", cursor: "pointer" }}>
                    Changer
                  </button>
                  {sub.isActive && sub.plan !== "free" && (
                    <button onClick={() => revokePlan(sub.partner?.id, sub.partner?.name)} disabled={acting === sub.partner?.id}
                      style={{ fontSize: 11, padding: "5px 10px", borderRadius: 6, border: "1px solid rgba(239,68,68,0.2)", background: "transparent", color: "#ef4444", cursor: "pointer" }}>
                      Révoquer
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal activation */}
      {activateForm && (
        <div onClick={() => setActivateForm(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: "#13131f", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 18, padding: "28px 26px", width: "100%", maxWidth: 400 }}>
            <h3 style={{ fontFamily: "Syne", fontWeight: 700, fontSize: 16, color: "#fff", marginBottom: 20 }}>
              {activateForm.partnerName ? `Changer le plan — ${activateForm.partnerName}` : "Activer un plan"}
            </h3>

            {!activateForm.partnerId && (
              <div style={{ marginBottom: 14 }}>
                <label style={lblS}>ID Partenaire *</label>
                <input
                  placeholder="Copier l'ID depuis Dashboard → Partenaires"
                  style={inpS}
                  onChange={e => setActivateForm(f => ({ ...f!, partnerId: e.target.value }))}
                />
                <p style={{ fontSize: 11, color: "#444", marginTop: 4 }}>
                  Visible dans la liste des partenaires (hover sur la carte)
                </p>
              </div>
            )}

            <div style={{ marginBottom: 14 }}>
              <label style={lblS}>Plan</label>
              <select value={newPlan} onChange={e => setNewPlan(e.target.value)} style={{ ...inpS, cursor: "pointer" }}>
                <option value="pro">🚀 Pro — 4 900 FCFA/mois</option>
                <option value="business">⭐ Business — 14 900 FCFA/mois</option>
                <option value="enterprise">🏢 Enterprise — sur devis</option>
              </select>
            </div>

            <div style={{ marginBottom: 22 }}>
              <label style={lblS}>Facturation</label>
              <div style={{ display: "flex", gap: 8 }}>
                {(["mensuel", "annuel"] as const).map(b => (
                  <button key={b} onClick={() => setNewBilling(b)} style={{
                    flex: 1, padding: "9px", borderRadius: 8, cursor: "pointer", fontSize: 13,
                    border: `1.5px solid ${newBilling === b ? "#1A9E5F" : "rgba(255,255,255,0.08)"}`,
                    background: newBilling === b ? "rgba(26,158,95,0.1)" : "transparent",
                    color: newBilling === b ? "#1A9E5F" : "#555",
                    fontWeight: newBilling === b ? 700 : 400,
                  }}>
                    {b === "mensuel" ? "Mensuel" : "Annuel (-17%)"}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setActivateForm(null)} style={{ flex: 1, padding: "11px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)", background: "transparent", color: "#555", cursor: "pointer", fontSize: 13 }}>
                Annuler
              </button>
              <button onClick={activatePlan} disabled={!activateForm.partnerId || acting === "activate"}
                style={{ flex: 1, padding: "11px", borderRadius: 10, border: "none", background: activateForm.partnerId ? "#1A9E5F" : "#1a1a1a", color: activateForm.partnerId ? "#fff" : "#333", fontWeight: 700, fontSize: 13, cursor: activateForm.partnerId ? "pointer" : "not-allowed" }}>
                {acting === "activate" ? "Activation…" : "✅ Activer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const lblS: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: "#555", display: "block", marginBottom: 6 };
const inpS: React.CSSProperties = { width: "100%", padding: "10px 13px", borderRadius: 8, background: "#080812", border: "1px solid rgba(255,255,255,0.08)", color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box" };
