"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

const BASE = process.env.NEXT_PUBLIC_URL_PROD || "http://localhost:3003";

function authFetch(path: string, options?: RequestInit) {
  const token = typeof window !== "undefined" ? localStorage.getItem("yitewo_token") : "";
  return fetch(`${BASE}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...options?.headers },
  }).then((r) => r.json());
}

const STATUS_ORDER: Record<string, { label: string; color: string; bg: string }> = {
  PENDING:    { label: "En attente",  color: "#92400e", bg: "#fef3c7" },
  CONFIRMED:  { label: "Confirmée",   color: "#1e40af", bg: "#dbeafe" },
  PREPARING:  { label: "En prépa",    color: "#6d28d9", bg: "#ede9fe" },
  DELIVERING: { label: "En livraison",color: "#0369a1", bg: "#e0f2fe" },
  DELIVERED:  { label: "Livrée",      color: "#065f46", bg: "#d1fae5" },
  CANCELLED:  { label: "Annulée",     color: "#991b1b", bg: "#fee2e2" },
};

const NOTIF_ICONS: Record<string, string> = {
  NEW_ORDER: "🛒",
  ORDER_STATUS_CHANGED: "📦",
  NEW_SERVICE_REQUEST: "🔧",
  NEW_OPPORTUNITY_INTEREST: "💬",
  NEW_OPPORTUNITY_SUBMISSION: "📋",
  NEW_PARTNER: "🤝",
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "À l'instant";
  if (mins < 60) return `Il y a ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `Il y a ${hrs}h`;
  return `Il y a ${Math.floor(hrs / 24)} j`;
}

function StatCard({ label, value, icon, color, sub, href }: any) {
  return (
    <Link href={href || "#"} style={{ textDecoration: "none" }}>
      <div style={{
        background: "#13131f", border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 16, padding: "20px 22px",
        transition: "border-color 0.2s, transform 0.2s",
        cursor: "pointer",
      }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.borderColor = color;
          (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.06)";
          (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: color + "22", display: "flex",
            alignItems: "center", justifyContent: "center", fontSize: 18,
          }}>
            {icon}
          </div>
          <span style={{ fontSize: 11, color: "#444", fontWeight: 500 }}>→</span>
        </div>
        <p style={{ fontSize: 28, fontFamily: "Syne, sans-serif", fontWeight: 800, color: "#fff", marginBottom: 4 }}>
          {value ?? <span style={{ fontSize: 20, color: "#333" }}>—</span>}
        </p>
        <p style={{ fontSize: 13, color: "#666" }}>{label}</p>
        {sub && <p style={{ fontSize: 11, color: color, marginTop: 4, fontWeight: 500 }}>{sub}</p>}
      </div>
    </Link>
  );
}

export default function DashboardHome() {
  const [stats, setStats] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [ordersData, notifsData] = await Promise.all([
        authFetch("/orders"),
        authFetch("/notifications"),
      ]);

      const ordersList = Array.isArray(ordersData) ? ordersData : [];
      const notifsList = Array.isArray(notifsData) ? notifsData : [];

      setOrders(ordersList.slice(0, 5));
      setNotifications(notifsList.slice(0, 8));

      // Compute stats locally
      const totalRevenue = ordersList
        .filter((o: any) => o.status === "DELIVERED")
        .reduce((s: number, o: any) => s + (o.totalPrice || 0), 0);

      setStats({
        totalOrders: ordersList.length,
        pendingOrders: ordersList.filter((o: any) => o.status === "PENDING").length,
        deliveredOrders: ordersList.filter((o: any) => o.status === "DELIVERED").length,
        totalRevenue,
        unreadNotifs: notifsList.filter((n: any) => !n.isRead).length,
      });
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [loadData]);

  const markAllRead = async () => {
    await authFetch("/notifications/mark-all-read", { method: "PATCH" });
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setStats((s: any) => s ? { ...s, unreadNotifs: 0 } : s);
  };

  return (
    <div style={{ padding: "28px 28px 60px", maxWidth: 1200, margin: "0 auto" }}>

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 26, color: "#fff", marginBottom: 6 }}>
          Vue d'ensemble
        </h1>
        <p style={{ color: "#555", fontSize: 14 }}>
          {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>

      {/* Stats grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14, marginBottom: 32 }}>
        <StatCard label="Commandes totales"  value={stats?.totalOrders}     icon="🛒" color="#E8380D" href="/dashboard/commandes" />
        <StatCard label="En attente"          value={stats?.pendingOrders}   icon="⏳" color="#f59e0b" sub={stats?.pendingOrders > 0 ? "À traiter" : undefined} href="/dashboard/commandes" />
        <StatCard label="Livrées"             value={stats?.deliveredOrders} icon="✅" color="#10b981" href="/dashboard/commandes" />
        <StatCard
          label="Revenus (livrées)"
          value={stats?.totalRevenue != null ? `${stats.totalRevenue.toLocaleString()} F` : null}
          icon="💰" color="#6366f1" href="/dashboard/commandes"
        />
        <StatCard label="Notifications"       value={stats?.unreadNotifs}    icon="🔔" color="#ec4899" sub={stats?.unreadNotifs > 0 ? "Non lues" : "Tout lu"} href="/dashboard" />
      </div>

      {/* Main content */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 20 }}
        className="dashboard-grid">

        {/* Recent orders */}
        <div style={{ background: "#13131f", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, overflow: "hidden" }}>
          <div style={{ padding: "18px 22px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 16, color: "#fff" }}>
              Commandes récentes
            </h2>
            <Link href="/dashboard/commandes" style={{ fontSize: 12, color: "#E8380D", textDecoration: "none", fontWeight: 600 }}>
              Tout voir →
            </Link>
          </div>

          {loading ? (
            <div style={{ padding: "32px", textAlign: "center", color: "#444" }}>Chargement…</div>
          ) : orders.length === 0 ? (
            <div style={{ padding: "40px", textAlign: "center", color: "#444" }}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>🛒</div>
              <p style={{ fontSize: 14 }}>Aucune commande pour l'instant</p>
            </div>
          ) : (
            <div>
              {orders.map((order, i) => {
                const s = STATUS_ORDER[order.status] || STATUS_ORDER.PENDING;
                return (
                  <div key={order.id} style={{
                    padding: "14px 22px",
                    borderBottom: i < orders.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                    display: "flex", alignItems: "center", gap: 14,
                    transition: "background 0.15s",
                  }}
                    onMouseEnter={(e) => (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.02)"}
                    onMouseLeave={(e) => (e.currentTarget as HTMLDivElement).style.background = "transparent"}
                  >
                    <div style={{
                      width: 36, height: 36, borderRadius: 10,
                      background: "rgba(232,56,13,0.12)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 16, flexShrink: 0,
                    }}>🛒</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: "#ddd", marginBottom: 2 }}>
                        #{order.id.slice(-6).toUpperCase()}
                        {order.customerName && <span style={{ color: "#666", fontWeight: 400 }}> · {order.customerName}</span>}
                      </p>
                      <p style={{ fontSize: 12, color: "#555" }}>
                        {order.quarter}, {order.city} · {order.items?.length || 0} article(s)
                      </p>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <span style={{
                        display: "inline-block", padding: "3px 10px", borderRadius: 99,
                        fontSize: 11, fontWeight: 700, background: s.bg + "22", color: s.color,
                        marginBottom: 4,
                      }}>
                        {s.label}
                      </span>
                      <p style={{ fontSize: 12, color: "#666" }}>
                        {order.totalPrice?.toLocaleString()} FCFA
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Notifications */}
        <div style={{ background: "#13131f", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "18px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
            <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 16, color: "#fff" }}>
              Notifications
              {stats?.unreadNotifs > 0 && (
                <span style={{ marginLeft: 8, background: "#E8380D", color: "#fff", borderRadius: 99, fontSize: 10, fontWeight: 800, padding: "2px 7px" }}>
                  {stats.unreadNotifs}
                </span>
              )}
            </h2>
            {stats?.unreadNotifs > 0 && (
              <button onClick={markAllRead} style={{
                background: "none", border: "none", color: "#555", fontSize: 11,
                cursor: "pointer", fontWeight: 500,
              }}>
                Tout lire
              </button>
            )}
          </div>

          <div style={{ flex: 1, overflowY: "auto" }}>
            {loading ? (
              <div style={{ padding: "32px", textAlign: "center", color: "#444" }}>Chargement…</div>
            ) : notifications.length === 0 ? (
              <div style={{ padding: "40px", textAlign: "center", color: "#444" }}>
                <div style={{ fontSize: 32, marginBottom: 10 }}>🔔</div>
                <p style={{ fontSize: 14 }}>Aucune notification</p>
              </div>
            ) : (
              notifications.map((notif, i) => (
                <div key={notif.id} style={{
                  padding: "12px 20px",
                  borderBottom: i < notifications.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                  display: "flex", gap: 12, alignItems: "flex-start",
                  background: notif.isRead ? "transparent" : "rgba(232,56,13,0.04)",
                  transition: "background 0.15s",
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                    background: notif.isRead ? "rgba(255,255,255,0.04)" : "rgba(232,56,13,0.12)",
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14,
                  }}>
                    {NOTIF_ICONS[notif.type] || "📬"}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 12, fontWeight: notif.isRead ? 400 : 600, color: notif.isRead ? "#666" : "#ddd", marginBottom: 2, lineHeight: 1.4 }}>
                      {notif.title}
                    </p>
                    <p style={{ fontSize: 11, color: "#444", lineHeight: 1.4, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                      {notif.body}
                    </p>
                    <p style={{ fontSize: 10, color: "#333", marginTop: 4 }}>{timeAgo(notif.createdAt)}</p>
                  </div>
                  {!notif.isRead && (
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#E8380D", flexShrink: 0, marginTop: 6 }} />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div style={{ marginTop: 24 }}>
        <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 16, color: "#fff", marginBottom: 14 }}>
          Accès rapide
        </h2>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {[
            { label: "Valider des annonces",    href: "/dashboard/opportunites", icon: "📋", color: "#6366f1" },
            { label: "Gérer les commandes",     href: "/dashboard/commandes",    icon: "🛒", color: "#E8380D" },
            { label: "Demandes de service",     href: "/dashboard/services",     icon: "🔧", color: "#10b981" },
            { label: "Nouveaux partenaires",    href: "/dashboard/partenaires",  icon: "🤝", color: "#f59e0b" },
          ].map((a) => (
            <Link key={a.href} href={a.href} style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "10px 18px", borderRadius: 10,
              background: "#13131f", border: "1px solid rgba(255,255,255,0.06)",
              textDecoration: "none", color: "#888", fontSize: 13, fontWeight: 500,
              transition: "all 0.18s",
            }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.borderColor = a.color;
                (e.currentTarget as HTMLAnchorElement).style.color = "#fff";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,255,255,0.06)";
                (e.currentTarget as HTMLAnchorElement).style.color = "#888";
              }}
            >
              <span>{a.icon}</span> {a.label}
            </Link>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .dashboard-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
