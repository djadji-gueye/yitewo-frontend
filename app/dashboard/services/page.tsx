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
  { value: "", label: "Tous" },
  { value: "PENDING", label: "En attente", color: "#f59e0b" },
  { value: "REVIEWING", label: "En cours", color: "#8b5cf6" },
  { value: "ASSIGNED", label: "Assignée", color: "#3b82f6" },
  { value: "DONE", label: "Terminée", color: "#10b981" },
  { value: "CANCELLED", label: "Annulée", color: "#ef4444" },
];

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
  const [expanded, setExpanded] = useState<string | null>(null);
  // interests: { [requestId]: Partner[] }
  const [interests, setInterests] = useState<Record<string, any[]>>({});
  const [loadingInterests, setLoadingInterests] = useState<string | null>(null);
  const [assigning, setAssigning] = useState<string | null>(null);

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
      await authFetch(`/service-requests/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) });
      setRequests((prev) => prev.map((r) => r.id === id ? { ...r, status } : r));
    } finally { setActing(null); }
  };

  const loadInterests = async (requestId: string) => {
    if (interests[requestId]) { setExpanded(expanded === requestId ? null : requestId); return; }
    setLoadingInterests(requestId);
    setExpanded(requestId);
    try {
      const data = await authFetch(`/service-requests/${requestId}/interests`);
      setInterests((prev) => ({ ...prev, [requestId]: Array.isArray(data) ? data : [] }));
    } finally { setLoadingInterests(null); }
  };

  const assignTo = async (requestId: string, partnerId: string, partnerName: string) => {
    if (!confirm(`Assigner cette mission à ${partnerName} ?\n\nLes autres prestataires ne verront plus cette mission.`)) return;
    setAssigning(requestId);
    try {
      await authFetch(`/service-requests/${requestId}/assign`, {
        method: "POST",
        body: JSON.stringify({ partnerId }),
      });
      setRequests((prev) => prev.map((r) => r.id === requestId ? { ...r, status: "ASSIGNED", assignedPartnerId: partnerId, assignedPartnerName: partnerName } : r));
      setExpanded(null);
    } finally { setAssigning(null); }
  };

  const filtered = requests.filter((r) => !filter || r.status === filter);
  const pendingCount = requests.filter((r) => r.status === "PENDING").length;
  const interestCount = requests.filter((r) => (interests[r.id]?.length ?? 0) > 0 && r.status === "PENDING").length;

  return (
    <div style={{ padding: "28px", maxWidth: 900, margin: "0 auto" }}>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 22, color: "#fff", marginBottom: 4 }}>
            Demandes de service
          </h1>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {pendingCount > 0 && <p style={{ fontSize: 13, color: "#f59e0b" }}>⚠️ {pendingCount} en attente</p>}
            {interestCount > 0 && <p style={{ fontSize: 13, color: "#8b5cf6" }}>🙋 {interestCount} avec des prestataires intéressés</p>}
          </div>
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
            fontWeight: filter === s.value ? 700 : 400,
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
            const reqInterests = interests[req.id] || [];
            const hasInterests = reqInterests.length > 0;
            const isExpanded = expanded === req.id;

            return (
              <div key={req.id} style={{ background: "#13131f", border: `1px solid ${req.status === "PENDING" ? "rgba(245,158,11,0.2)" : "rgba(255,255,255,0.06)"}`, borderRadius: 14, overflow: "hidden" }}>

                {/* Carte principale */}
                <div style={{ padding: "16px 20px" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 14, flexWrap: "wrap" }}>
                    <div style={{ width: 44, height: 44, borderRadius: 10, background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
                      {req.serviceIcon || "🔧"}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                        <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 15, color: "#fff" }}>{req.service}</h3>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: (statusMeta.color || "#f59e0b") + "22", color: statusMeta.color || "#f59e0b" }}>
                          {statusMeta.label}
                        </span>
                        {/* Badge intérêts reçus */}
                        {req.interestCount > 0 && req.status === "PENDING" && (
                          <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: "rgba(139,92,246,0.2)", color: "#a78bfa" }}>
                            🙋 {req.interestCount} intérêt{req.interestCount > 1 ? "s" : ""}
                          </span>
                        )}
                        {/* Badge prestataire assigné */}
                        {req.status === "ASSIGNED" && req.assignedPartnerName && (
                          <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: "rgba(59,130,246,0.2)", color: "#60a5fa" }}>
                            👤 {req.assignedPartnerName}
                          </span>
                        )}
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

                    {/* Actions */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 }}>
                      {/* Bouton voir les intérêts */}
                      {req.status === "PENDING" && (
                        <button onClick={() => loadInterests(req.id)} disabled={loadingInterests === req.id}
                          style={{
                            padding: "7px 14px", borderRadius: 8, fontSize: 11, cursor: "pointer",
                            border: "1px solid rgba(139,92,246,0.4)",
                            background: isExpanded ? "rgba(139,92,246,0.2)" : "rgba(139,92,246,0.08)",
                            color: "#a78bfa", fontWeight: 700,
                          }}>
                          {loadingInterests === req.id ? "…" : isExpanded ? "▲ Masquer" : `🙋 Voir intérêts${req.interestCount ? ` (${req.interestCount})` : ""}`}
                        </button>
                      )}

                      {req.status === "PENDING" && (
                        <button onClick={() => updateStatus(req.id, "CANCELLED")} disabled={acting === req.id}
                          style={{ padding: "6px 14px", borderRadius: 8, border: "1px solid rgba(239,68,68,0.3)", background: "transparent", color: "#ef4444", fontWeight: 600, fontSize: 11, cursor: "pointer" }}>
                          Annuler
                        </button>
                      )}
                      {req.status === "ASSIGNED" && (
                        <button onClick={() => updateStatus(req.id, "DONE")} disabled={acting === req.id}
                          style={{ padding: "6px 14px", borderRadius: 8, border: "none", background: "#10b981", color: "#fff", fontWeight: 600, fontSize: 11, cursor: "pointer" }}>
                          ✅ Terminée
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Panel intérêts expandable */}
                {isExpanded && (
                  <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", background: "#0d0d1a", padding: "16px 20px" }}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: "#a78bfa", marginBottom: 14, textTransform: "uppercase", letterSpacing: 0.5 }}>
                      Prestataires intéressés
                    </p>

                    {loadingInterests === req.id ? (
                      <p style={{ fontSize: 13, color: "#555" }}>Chargement…</p>
                    ) : !hasInterests ? (
                      <div style={{ padding: "20px", textAlign: "center", border: "1px dashed rgba(255,255,255,0.08)", borderRadius: 10 }}>
                        <p style={{ fontSize: 13, color: "#555" }}>Aucun prestataire intéressé pour l'instant.</p>
                        <p style={{ fontSize: 12, color: "#444", marginTop: 4 }}>Vous pouvez aussi affecter manuellement un prestataire.</p>
                      </div>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {reqInterests.map((partner: any) => {
                          const initials = partner.name?.split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase() || "?";
                          const hue = [...(partner.name || "")].reduce((a: number, c: string) => a + c.charCodeAt(0), 0) % 360;
                          return (
                            <div key={partner.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 14px", background: "rgba(255,255,255,0.03)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.06)" }}>
                              {/* Avatar */}
                              <div style={{ width: 40, height: 40, borderRadius: "50%", overflow: "hidden", flexShrink: 0, background: `linear-gradient(135deg,hsl(${hue},55%,28%),hsl(${(hue + 60) % 360},65%,42%))`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                {partner.profileImageUrl
                                  ? <img src={partner.profileImageUrl} alt={partner.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                  : <span style={{ fontFamily: "Syne", fontWeight: 800, fontSize: 13, color: "#fff" }}>{initials}</span>}
                              </div>

                              <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{ fontWeight: 700, fontSize: 14, color: "#fff", marginBottom: 2 }}>{partner.name}</p>
                                <div style={{ display: "flex", gap: 10, fontSize: 11, color: "#666", flexWrap: "wrap" }}>
                                  <span>📍 {partner.zone ? `${partner.zone}, ` : ""}{partner.city}</span>
                                  {partner.avgRating && <span>⭐ {partner.avgRating}/5</span>}
                                  {partner.serviceCategories?.length > 0 && (
                                    <span>🏷️ {partner.serviceCategories.slice(0, 2).join(", ")}</span>
                                  )}
                                </div>
                              </div>

                              {/* Bouton assigner */}
                              <button
                                onClick={() => assignTo(req.id, partner.id, partner.name)}
                                disabled={assigning === req.id}
                                style={{
                                  padding: "8px 18px", borderRadius: 9, border: "none",
                                  background: "#E8380D", color: "#fff",
                                  fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 12,
                                  cursor: assigning === req.id ? "not-allowed" : "pointer",
                                  flexShrink: 0, whiteSpace: "nowrap",
                                }}>
                                {assigning === req.id ? "…" : "Affecter →"}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Affectation manuelle */}
                    <div style={{ marginTop: 16, padding: "12px 14px", background: "rgba(59,130,246,0.08)", borderRadius: 10, border: "1px solid rgba(59,130,246,0.2)" }}>
                      <p style={{ fontSize: 12, color: "#60a5fa", fontWeight: 600, marginBottom: 8 }}>
                        💡 Affectation manuelle — entrez l'ID d'un prestataire
                      </p>
                      <ManualAssign requestId={req.id} onAssign={(pId, pName) => assignTo(req.id, pId, pName)} disabled={assigning === req.id} />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ManualAssign({ requestId, onAssign, disabled }: { requestId: string; onAssign: (id: string, name: string) => void; disabled: boolean }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  const BASE = process.env.NEXT_PUBLIC_URL_PROD || "http://localhost:3003";

  const search = async () => {
    if (!query.trim()) return;
    setSearching(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("yitewo_token") : "";
      const data = await fetch(`${BASE}/partners?type=Prestataire&search=${encodeURIComponent(query)}`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then((r) => r.json());
      setResults(Array.isArray(data) ? data.slice(0, 5) : []);
    } finally { setSearching(false); }
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 8 }}>
        <input value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === "Enter" && search()}
          placeholder="Nom du prestataire…"
          style={{ flex: 1, padding: "7px 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: "#fff", fontSize: 12, outline: "none" }} />
        <button onClick={search} disabled={searching || !query.trim()}
          style={{ padding: "7px 14px", borderRadius: 8, border: "none", background: "#3b82f6", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
          {searching ? "…" : "Chercher"}
        </button>
      </div>
      {results.length > 0 && (
        <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
          {results.map((p: any) => (
            <div key={p.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 10px", background: "rgba(255,255,255,0.04)", borderRadius: 8 }}>
              <div>
                <p style={{ fontSize: 13, color: "#fff", fontWeight: 600 }}>{p.name}</p>
                <p style={{ fontSize: 11, color: "#666" }}>📍 {p.city} · {p.contact}</p>
              </div>
              <button onClick={() => { onAssign(p.id, p.name); setResults([]); setQuery(""); }} disabled={disabled}
                style={{ padding: "5px 12px", borderRadius: 7, border: "none", background: "#E8380D", color: "#fff", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                Affecter
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}