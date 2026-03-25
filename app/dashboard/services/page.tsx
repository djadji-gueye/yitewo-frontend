"use client";

import { useState, useEffect, useCallback } from "react";

const BASE = process.env.NEXT_PUBLIC_URL_PROD || "http://localhost:3003";
function authFetch(path: string, options?: RequestInit) {
  const token = typeof window !== "undefined" ? localStorage.getItem("yitewo_token") : "";
  return fetch(`${BASE}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...options?.headers },
  }).then((r) => r.json());
}

const STATUSES = [
  { value: "",           label: "Tous" },
  { value: "PENDING",    label: "En attente",    color: "#f59e0b" },
  { value: "ASSIGNED",   label: "Assignée",      color: "#3b82f6" },
  { value: "IN_PROGRESS",label: "En cours",      color: "#8b5cf6" },
  { value: "DONE",       label: "Terminée",      color: "#10b981" },
  { value: "CANCELLED",  label: "Annulée",       color: "#ef4444" },
];

const SERVICE_ICONS: Record<string, string> = {
  "Ménage à domicile": "🧹",
  "Plombier": "🚰",
  "Électricien": "💡",
  "Climatisation": "❄️",
  "Bricoleur": "🔧",
  "Urgence dépannage": "🚨",
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "À l'instant";
  if (mins < 60) return `${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return new Date(iso).toLocaleDateString("fr-FR");
}

export default function ServicesPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [acting, setActing] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await authFetch("/service-requests");
      setRequests(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (id: string, status: string) => {
    setActing(id);
    try {
      await authFetch(`/service-requests/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      setRequests((prev) => prev.map((r) => r.id === id ? { ...r, status } : r));
    } finally {
      setActing(null);
    }
  };

  const filtered = requests.filter((r) => !filter || r.status === filter);
  const pendingCount = requests.filter((r) => r.status === "PENDING").length;

  return (
    <div style={{ padding: "28px", maxWidth: 900, margin: "0 auto" }}>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 22, color: "#fff", marginBottom: 4 }}>
            Demandes de service
          </h1>
          {pendingCount > 0 && (
            <p style={{ fontSize: 13, color: "#f59e0b" }}>
              ⚠️ {pendingCount} demande{pendingCount > 1 ? "s" : ""} en attente
            </p>
          )}
        </div>
        <button onClick={load} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "6px 12px", color: "#888", fontSize: 12, cursor: "pointer" }}>
          ↻ Actualiser
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 20 }}>
        {STATUSES.map((s) => (
          <button key={s.value} onClick={() => setFilter(s.value)} style={{
            padding: "5px 14px", borderRadius: 99, fontSize: 12, cursor: "pointer",
            border: `1px solid ${filter === s.value ? (s.color || "#E8380D") : "rgba(255,255,255,0.08)"}`,
            background: filter === s.value ? ((s.color || "#E8380D") + "22") : "transparent",
            color: filter === s.value ? (s.color || "#E8380D") : "#666",
            fontWeight: filter === s.value ? 700 : 400, transition: "all 0.18s",
          }}>
            {s.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px", color: "#444" }}>Chargement…</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px", color: "#444" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🔧</div>
          <p>Aucune demande</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map((req) => {
            const statusMeta = STATUSES.find((s) => s.value === req.status) || STATUSES[1];
            const icon = SERVICE_ICONS[req.service] || "🔧";
            return (
              <div key={req.id} style={{
                background: "#13131f", border: `1px solid ${req.status === "PENDING" ? "rgba(245,158,11,0.2)" : "rgba(255,255,255,0.06)"}`,
                borderRadius: 14, padding: "16px 20px",
              }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 14, flexWrap: "wrap" }}>
                  <div style={{ width: 44, height: 44, borderRadius: 10, background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
                    {icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                      <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 15, color: "#fff" }}>{req.service}</h3>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: (statusMeta.color || "#f59e0b") + "22", color: statusMeta.color || "#f59e0b" }}>
                        {statusMeta.label}
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: 14, flexWrap: "wrap", fontSize: 12, color: "#666", marginBottom: req.description ? 8 : 0 }}>
                      <span>📍 {req.quarter}, {req.city}</span>
                      {req.customerName && <span>👤 {req.customerName}</span>}
                      {req.customerPhone && <span>📞 {req.customerPhone}</span>}
                      <span>🕐 {timeAgo(req.createdAt)}</span>
                    </div>
                    {req.description && (
                      <p style={{ fontSize: 12, color: "#777", lineHeight: 1.5, marginTop: 4 }}>{req.description}</p>
                    )}
                  </div>
                  {/* Status actions */}
                  <div style={{ display: "flex", gap: 6, flexShrink: 0, flexWrap: "wrap" }}>
                    {req.status === "PENDING" && (
                      <button onClick={() => updateStatus(req.id, "ASSIGNED")} disabled={acting === req.id}
                        style={{ padding: "6px 14px", borderRadius: 8, border: "none", background: "#3b82f6", color: "#fff", fontWeight: 600, fontSize: 12, cursor: "pointer" }}>
                        {acting === req.id ? "…" : "Assigner"}
                      </button>
                    )}
                    {req.status === "ASSIGNED" && (
                      <button onClick={() => updateStatus(req.id, "IN_PROGRESS")} disabled={acting === req.id}
                        style={{ padding: "6px 14px", borderRadius: 8, border: "none", background: "#8b5cf6", color: "#fff", fontWeight: 600, fontSize: 12, cursor: "pointer" }}>
                        En cours
                      </button>
                    )}
                    {(req.status === "ASSIGNED" || req.status === "IN_PROGRESS") && (
                      <button onClick={() => updateStatus(req.id, "DONE")} disabled={acting === req.id}
                        style={{ padding: "6px 14px", borderRadius: 8, border: "none", background: "#10b981", color: "#fff", fontWeight: 600, fontSize: 12, cursor: "pointer" }}>
                        ✅ Terminée
                      </button>
                    )}
                    {req.status !== "DONE" && req.status !== "CANCELLED" && (
                      <button onClick={() => updateStatus(req.id, "CANCELLED")} disabled={acting === req.id}
                        style={{ padding: "6px 14px", borderRadius: 8, border: "1px solid rgba(239,68,68,0.3)", background: "transparent", color: "#ef4444", fontWeight: 600, fontSize: 12, cursor: "pointer" }}>
                        Annuler
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
