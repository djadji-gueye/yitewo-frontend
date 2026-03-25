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
  { value: "", label: "Toutes" },
  { value: "PENDING", label: "En attente", color: "#f59e0b" },
  { value: "CONFIRMED", label: "Confirmée", color: "#3b82f6" },
  { value: "PREPARING", label: "En prépa", color: "#8b5cf6" },
  { value: "DELIVERING", label: "En livraison", color: "#0ea5e9" },
  { value: "DELIVERED", label: "Livrée", color: "#10b981" },
  { value: "CANCELLED", label: "Annulée", color: "#ef4444" },
];

const STATUS_FLOW = ["PENDING", "CONFIRMED", "PREPARING", "DELIVERING", "DELIVERED"];

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "À l'instant";
  if (mins < 60) return `${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return new Date(iso).toLocaleDateString("fr-FR");
}

export default function CommandesPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [selected, setSelected] = useState<any>(null);
  const [updating, setUpdating] = useState(false);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    try {
      const data = await authFetch("/orders");
      setOrders(Array.isArray(data) ? data : []);
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (orderId: string, status: string) => {
    setUpdating(true);
    try {
      await authFetch(`/orders/${orderId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status } : o));
      setSelected((prev: any) => prev?.id === orderId ? { ...prev, status } : prev);
    } finally {
      setUpdating(false);
    }
  };

  const filtered = orders.filter((o) => {
    const matchStatus = !filter || o.status === filter;
    const matchSearch = !search ||
      o.id.slice(-6).toLowerCase().includes(search.toLowerCase()) ||
      o.customerName?.toLowerCase().includes(search.toLowerCase()) ||
      o.customerPhone?.includes(search) ||
      o.quarter?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const statusMeta = (s: string) => STATUSES.find((x) => x.value === s) || STATUSES[1];

  return (
    <div style={{ display: "flex", height: "calc(100vh - 60px)" }}>

      {/* List panel */}
      <div style={{ width: selected ? 420 : "100%", borderRight: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", transition: "width 0.25s" }}>

        {/* Header */}
        <div style={{ padding: "20px 20px 0", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 22, color: "#fff" }}>
              Commandes
              <span style={{ marginLeft: 10, fontSize: 14, color: "#555", fontWeight: 400 }}>({filtered.length})</span>
            </h1>
            <button onClick={load} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "6px 12px", color: "#888", fontSize: 12, cursor: "pointer" }}>
              ↻ Actualiser
            </button>
          </div>

          {/* Search */}
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher (ID, nom, quartier…)"
            style={{ width: "100%", padding: "9px 14px", borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#fff", fontSize: 13, outline: "none", marginBottom: 12 }} />

          {/* Filters */}
          <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 12, scrollbarWidth: "none" }}>
            {STATUSES.map((s) => (
              <button key={s.value} onClick={() => setFilter(s.value)} style={{
                flexShrink: 0, padding: "5px 14px", borderRadius: 99, fontSize: 12, cursor: "pointer",
                border: `1px solid ${filter === s.value ? (s.color || "#E8380D") : "rgba(255,255,255,0.08)"}`,
                background: filter === s.value ? ((s.color || "#E8380D") + "22") : "transparent",
                color: filter === s.value ? (s.color || "#E8380D") : "#666",
                fontWeight: filter === s.value ? 700 : 400, transition: "all 0.18s",
              }}>
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Orders list */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {loading ? (
            <div style={{ padding: "40px", textAlign: "center", color: "#444" }}>Chargement…</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: "40px", textAlign: "center", color: "#444" }}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>🛒</div>
              <p>Aucune commande{filter ? " dans ce statut" : ""}</p>
            </div>
          ) : (
            filtered.map((order) => {
              const s = statusMeta(order.status);
              const isSelected = selected?.id === order.id;
              return (
                <div key={order.id} onClick={() => setSelected(isSelected ? null : order)}
                  style={{
                    padding: "14px 20px", cursor: "pointer",
                    borderBottom: "1px solid rgba(255,255,255,0.04)",
                    background: isSelected ? "rgba(232,56,13,0.08)" : "transparent",
                    borderLeft: isSelected ? "3px solid #E8380D" : "3px solid transparent",
                    transition: "all 0.15s",
                  }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 13, color: "#fff" }}>
                          #{order.id.slice(-6).toUpperCase()}
                        </span>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: (s.color || "#E8380D") + "22", color: s.color || "#E8380D" }}>
                          {s.label}
                        </span>
                      </div>
                      <p style={{ fontSize: 12, color: "#666", marginBottom: 2 }}>
                        {order.customerName || "Anonyme"}
                        {order.customerPhone && <span style={{ color: "#444" }}> · {order.customerPhone}</span>}
                      </p>
                      {order.partner?.name && (
                        <p style={{ fontSize: 12, color: "#E8380D", marginBottom: 2, fontWeight: 600 }}>
                          🏪 {order.partner.name}
                        </p>
                      )}
                      <p style={{ fontSize: 12, color: "#555" }}>
                        📍 {order.quarter}, {order.city} · {order.items?.length || 0} article(s)
                      </p>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 13, color: "#fff" }}>
                        {order.totalPrice?.toLocaleString()} F
                      </p>
                      <p style={{ fontSize: 11, color: "#444", marginTop: 2 }}>{timeAgo(order.createdAt)}</p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Detail panel */}
      {selected && (
        <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
            <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 20, color: "#fff" }}>
              Commande #{selected.id.slice(-6).toUpperCase()}
            </h2>
            <button onClick={() => setSelected(null)} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "6px 12px", color: "#888", fontSize: 12, cursor: "pointer" }}>
              ✕ Fermer
            </button>
          </div>

          {/* Status flow */}
          <div style={{ background: "#13131f", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: "18px 20px", marginBottom: 16 }}>
            <p style={{ fontSize: 12, color: "#555", marginBottom: 14, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>
              Statut de la commande
            </p>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {STATUS_FLOW.map((s) => {
                const meta = statusMeta(s);
                const isCurrent = selected.status === s;
                const isDone = STATUS_FLOW.indexOf(s) < STATUS_FLOW.indexOf(selected.status);
                return (
                  <button key={s} onClick={() => updateStatus(selected.id, s)} disabled={updating}
                    style={{
                      padding: "7px 14px", borderRadius: 8, fontSize: 12, cursor: "pointer",
                      border: `1px solid ${isCurrent ? (meta.color || "#E8380D") : "rgba(255,255,255,0.08)"}`,
                      background: isCurrent ? ((meta.color || "#E8380D") + "22") : isDone ? "rgba(255,255,255,0.03)" : "transparent",
                      color: isCurrent ? (meta.color || "#E8380D") : isDone ? "#444" : "#666",
                      fontWeight: isCurrent ? 700 : 400, transition: "all 0.18s",
                    }}>
                    {isDone ? "✓ " : ""}{meta.label}
                  </button>
                );
              })}
              <button onClick={() => updateStatus(selected.id, "CANCELLED")} disabled={updating}
                style={{ padding: "7px 14px", borderRadius: 8, fontSize: 12, cursor: "pointer", border: "1px solid rgba(239,68,68,0.3)", background: selected.status === "CANCELLED" ? "rgba(239,68,68,0.15)" : "transparent", color: selected.status === "CANCELLED" ? "#ef4444" : "#666", fontWeight: selected.status === "CANCELLED" ? 700 : 400 }}>
                Annuler
              </button>
            </div>
          </div>

          {/* Info */}
          <div style={{ background: "#13131f", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: "18px 20px", marginBottom: 16 }}>
            <p style={{ fontSize: 12, color: "#555", marginBottom: 14, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>Informations</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                ["Client", selected.customerName || "Anonyme"],
                ["Téléphone", selected.customerPhone || "—"],
                ...(selected.partner?.name ? [["Commerçant", selected.partner.name]] : []),
                ["Quartier", `${selected.quarter}, ${selected.city}`],
                ["Livraison", `${selected.deliveryFee?.toLocaleString()} FCFA`],
                ["Total", `${selected.totalPrice?.toLocaleString()} FCFA`],
                ["Date", new Date(selected.createdAt).toLocaleString("fr-FR")],
              ].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                  <span style={{ color: "#555" }}>{k}</span>
                  <span style={{ color: k === "Commerçant" ? "#E8380D" : "#ddd", fontWeight: 500 }}>{v}</span>
                </div>
              ))}
              {selected.note && (
                <div style={{ marginTop: 6, padding: "10px 12px", background: "rgba(255,255,255,0.03)", borderRadius: 8, fontSize: 12, color: "#888" }}>
                  📝 {selected.note}
                </div>
              )}
            </div>
          </div>

          {/* Items */}
          <div style={{ background: "#13131f", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: "18px 20px" }}>
            <p style={{ fontSize: 12, color: "#555", marginBottom: 14, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>
              Articles ({selected.items?.length || 0})
            </p>
            {selected.items?.map((item: any) => (
              <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <div>
                  <p style={{ fontSize: 13, color: "#ddd" }}>{item.product?.name || item.partnerProduct?.name || "Produit"}</p>
                  <p style={{ fontSize: 11, color: "#555" }}>x{item.quantity} · {item.unitPrice?.toLocaleString()} F/u</p>
                </div>
                <p style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>
                  {(item.quantity * item.unitPrice)?.toLocaleString()} F
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
