"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "next/navigation";

const BASE = process.env.NEXT_PUBLIC_URL_PROD || "http://localhost:3003";

const STATUS_META: Record<string, { label: string; color: string; bg: string; next?: string; nextLabel?: string }> = {
  PENDING: { label: "En attente", color: "#92400e", bg: "#fef3c7", next: "CONFIRMED", nextLabel: "✅ Confirmer" },
  CONFIRMED: { label: "Confirmée", color: "#1e40af", bg: "#dbeafe", next: "PREPARING", nextLabel: "🍳 En préparation" },
  PREPARING: { label: "En prépa", color: "#6d28d9", bg: "#ede9fe", next: "DELIVERING", nextLabel: "🛵 Prêt à livrer" },
  DELIVERING: { label: "En livraison", color: "#0369a1", bg: "#e0f2fe" },
  DELIVERED: { label: "Livrée ✅", color: "#065f46", bg: "#d1fae5" },
  CANCELLED: { label: "Annulée", color: "#991b1b", bg: "#fee2e2" },
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "À l'instant";
  if (mins < 60) return `Il y a ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `Il y a ${hrs}h`;
  return new Date(iso).toLocaleDateString("fr-FR");
}

export default function PartnerOrdersPage() {
  const params = useParams();
  const token = params?.token as string;

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [selected, setSelected] = useState<any>(null);
  const [acting, setActing] = useState<string | null>(null);
  const updatingRef = useRef(false);

  const load = useCallback(async () => {
    if (!token) return;
    if (updatingRef.current) return; // ne pas écraser pendant un updateStatus
    try {
      const data = await fetch(`${BASE}/orders?partnerToken=${token}`).then((r) => r.json()).catch(() => []);
      const list = Array.isArray(data) ? data : data?.data ?? [];
      setOrders(list);
      // Sync la commande ouverte dans le panneau si elle a changé côté serveur
      setSelected((prev: any) => {
        if (!prev) return prev;
        const fresh = list.find((o: any) => o.id === prev.id);
        return fresh ? { ...prev, ...fresh } : prev;
      });
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, [load]);

  const updateStatus = async (orderId: string, status: string) => {
    setActing(orderId);
    updatingRef.current = true;
    // Mise à jour optimiste immédiate
    setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status } : o));
    setSelected((prev: any) => prev?.id === orderId ? { ...prev, status } : prev);
    try {
      await fetch(`${BASE}/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
    } finally {
      setActing(null);
      // Attendre 2s avant de réactiver le refresh pour laisser la DB se stabiliser
      setTimeout(() => { updatingRef.current = false; }, 2000);
    }
  };

  const filtered = orders.filter((o) => !filter || o.status === filter);
  const pendingCount = orders.filter((o) => o.status === "PENDING").length;

  return (
    <div style={{ display: "flex", gap: 20, height: "calc(100vh - 112px)" }}>

      {/* List */}
      <div style={{
        width: selected ? 380 : "100%", flexShrink: 0,
        display: "flex", flexDirection: "column",
        transition: "width 0.25s",
      }}>
        {/* Header */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div>
              <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 22, color: "#1a1a1a", marginBottom: 4 }}>
                Commandes
              </h1>
              {pendingCount > 0 && (
                <p style={{ fontSize: 13, color: "#f59e0b", fontWeight: 600 }}>
                  ⚠️ {pendingCount} commande{pendingCount > 1 ? "s" : ""} en attente
                </p>
              )}
            </div>
            <button onClick={load} style={{
              padding: "7px 14px", borderRadius: 8,
              border: "1px solid #f0ebe8", background: "#fff",
              color: "#aaa", fontSize: 12, cursor: "pointer",
            }}>
              ↻ Actualiser
            </button>
          </div>

          {/* Filter pills */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <button onClick={() => setFilter("")} style={pill(!filter)}>Toutes ({orders.length})</button>
            {["PENDING", "CONFIRMED", "PREPARING", "DELIVERED"].map((s) => {
              const count = orders.filter((o) => o.status === s).length;
              if (count === 0) return null;
              const meta = STATUS_META[s];
              return (
                <button key={s} onClick={() => setFilter(s)} style={{
                  ...pill(filter === s),
                  borderColor: filter === s ? meta.color : "#f0ebe8",
                  background: filter === s ? meta.bg : "#fff",
                  color: filter === s ? meta.color : "#6b6b6b",
                }}>
                  {meta.label} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Orders list */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "60px", color: "#aaa" }}>Chargement…</div>
          ) : filtered.length === 0 ? (
            <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #f0ebe8", padding: "60px 24px", textAlign: "center" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🛒</div>
              <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 600, fontSize: 16, color: "#1a1a1a" }}>
                Aucune commande
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {filtered.map((order) => {
                const s = STATUS_META[order.status] || STATUS_META.PENDING;
                const isSelected = selected?.id === order.id;
                return (
                  <div key={order.id} onClick={() => setSelected(isSelected ? null : order)}
                    style={{
                      background: "#fff", borderRadius: 14, border: "1px solid",
                      borderColor: isSelected ? "#E8380D" : (order.status === "PENDING" ? "#fcd34d" : "#f0ebe8"),
                      padding: "14px 16px", cursor: "pointer",
                      transition: "all 0.15s",
                    }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                          <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 14, color: "#1a1a1a" }}>
                            #{order.id.slice(-6).toUpperCase()}
                          </span>
                          <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: s.bg, color: s.color }}>
                            {s.label}
                          </span>
                        </div>
                        <p style={{ fontSize: 12, color: "#aaa", marginBottom: 2 }}>
                          {order.customerName || "Anonyme"}
                          {order.customerPhone && ` · ${order.customerPhone}`}
                        </p>
                        <p style={{ fontSize: 12, color: "#aaa" }}>
                          📍 {order.quarter}, {order.city} · {order.items?.length || 0} article(s)
                        </p>
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 14, color: "#1a1a1a" }}>
                          {order.totalPrice?.toLocaleString()} F
                        </p>
                        <p style={{ fontSize: 11, color: "#aaa", marginTop: 2 }}>{timeAgo(order.createdAt)}</p>
                      </div>
                    </div>

                    {/* Quick action button */}
                    {s.next && (
                      <button
                        onClick={(e) => { e.stopPropagation(); updateStatus(order.id, s.next!); }}
                        disabled={acting === order.id}
                        style={{
                          marginTop: 10, width: "100%", padding: "7px",
                          borderRadius: 8, border: "none",
                          background: order.status === "PENDING" ? "#E8380D" : "#1a1a1a",
                          color: "#fff", fontWeight: 600, fontSize: 12,
                          cursor: "pointer", opacity: acting === order.id ? 0.6 : 1,
                        }}
                      >
                        {acting === order.id ? "…" : s.nextLabel}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Detail panel */}
      {selected && (
        <div style={{
          flex: 1, background: "#fff", borderRadius: 16,
          border: "1px solid #f0ebe8", padding: "24px",
          overflowY: "auto",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 18, color: "#1a1a1a" }}>
              Commande #{selected.id.slice(-6).toUpperCase()}
            </h2>
            <button onClick={() => setSelected(null)} style={{
              background: "#fafaf8", border: "1px solid #f0ebe8",
              borderRadius: 8, padding: "6px 12px", color: "#aaa", fontSize: 12, cursor: "pointer",
            }}>
              ✕ Fermer
            </button>
          </div>

          {/* Status actions */}
          <div style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: "#aaa", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Changer le statut
            </p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {["CONFIRMED", "PREPARING", "DELIVERING", "DELIVERED"].map((s) => {
                const meta = STATUS_META[s];
                const isCurrent = selected.status === s;
                return (
                  <button key={s} onClick={() => updateStatus(selected.id, s)} disabled={acting === selected.id}
                    style={{
                      padding: "7px 14px", borderRadius: 8, fontSize: 12, cursor: "pointer",
                      border: `1px solid ${isCurrent ? meta.color : "#f0ebe8"}`,
                      background: isCurrent ? meta.bg : "#fff",
                      color: isCurrent ? meta.color : "#6b6b6b",
                      fontWeight: isCurrent ? 700 : 400,
                    }}>
                    {meta.label}
                  </button>
                );
              })}
              <button onClick={() => updateStatus(selected.id, "CANCELLED")} disabled={acting === selected.id}
                style={{ padding: "7px 14px", borderRadius: 8, fontSize: 12, cursor: "pointer", border: "1px solid #fee2e2", background: "#fff", color: "#ef4444" }}>
                Annuler
              </button>
            </div>
          </div>

          {/* Info */}
          <div style={{ background: "#fafaf8", borderRadius: 12, padding: "16px", marginBottom: 16 }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: "#aaa", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Informations
            </p>
            {[
              ["Client", selected.customerName || "Anonyme"],
              ["Téléphone", selected.customerPhone || "—"],
              ["Adresse", `${selected.quarter}, ${selected.city}`],
              ["Livraison", `${selected.deliveryFee?.toLocaleString()} FCFA`],
              ["Date", new Date(selected.createdAt).toLocaleString("fr-FR")],
            ].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
                <span style={{ color: "#aaa" }}>{k}</span>
                <span style={{ fontWeight: 500, color: "#1a1a1a" }}>{v}</span>
              </div>
            ))}
            {selected.note && (
              <div style={{ marginTop: 8, padding: "8px 12px", background: "#fff", borderRadius: 8, fontSize: 12, color: "#6b6b6b" }}>
                📝 {selected.note}
              </div>
            )}
          </div>

          {/* Items */}
          <div style={{ background: "#fafaf8", borderRadius: 12, padding: "16px" }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: "#aaa", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Articles ({selected.items?.length || 0})
            </p>
            {selected.items?.map((item: any) => (
              <div key={item.id} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "8px 0", borderBottom: "1px solid #f0ebe8",
              }}>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "#1a1a1a" }}>
                    {item.product?.name || item.partnerProduct?.name || "Produit"}
                  </p>
                  <p style={{ fontSize: 11, color: "#aaa" }}>
                    x{item.quantity} · {item.unitPrice?.toLocaleString()} F/u
                  </p>
                </div>
                <p style={{ fontSize: 13, fontWeight: 700, color: "#1a1a1a" }}>
                  {(item.quantity * item.unitPrice)?.toLocaleString()} F
                </p>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, paddingTop: 12, borderTop: "2px solid #f0ebe8" }}>
              <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 15 }}>Total</span>
              <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 15, color: "#E8380D" }}>
                {selected.totalPrice?.toLocaleString()} FCFA
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function pill(active: boolean): React.CSSProperties {
  return {
    padding: "5px 14px", borderRadius: 99, fontSize: 12, cursor: "pointer",
    border: "1px solid " + (active ? "#1a1a1a" : "#f0ebe8"),
    background: active ? "#1a1a1a" : "#fff",
    color: active ? "#fff" : "#6b6b6b",
    fontWeight: active ? 700 : 400, transition: "all 0.18s",
    whiteSpace: "nowrap" as const,
  };
}
