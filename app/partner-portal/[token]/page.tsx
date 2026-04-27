"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";

const AIAdvisor = dynamic(() => import("@/components/AIAdvisor"), { ssr: false });

const BASE = process.env.NEXT_PUBLIC_URL_PROD || "http://localhost:3003";

function StatCard({ icon, label, value, color, sub }: any) {
  return (
    <div style={{
      background: "#fff", borderRadius: 16,
      border: "1px solid #f0ebe8", padding: "20px 22px",
      transition: "transform 0.2s, box-shadow 0.2s",
    }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 24px rgba(0,0,0,0.08)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
        (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
      }}
    >
      <div style={{
        width: 42, height: 42, borderRadius: 10,
        background: color + "18",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 20, marginBottom: 14,
      }}>
        {icon}
      </div>
      <p style={{ fontSize: 26, fontFamily: "Syne, sans-serif", fontWeight: 800, color: "#1a1a1a", marginBottom: 4 }}>
        {value ?? <span style={{ color: "#ddd" }}>—</span>}
      </p>
      <p style={{ fontSize: 13, color: "#6b6b6b" }}>{label}</p>
      {sub && <p style={{ fontSize: 11, color, marginTop: 4, fontWeight: 600 }}>{sub}</p>}
      {/* IA Advisor */}
      {/* {partner && (
        <AIAdvisor
          partner={partner}
          orders={orders}
          products={products}
          stats={stats}
        />
      )} */}
    </div>
  );
}

export default function PartnerPortalHome() {
  const params = useParams();
  const token = params?.token as string;

  const [partner, setPartner] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  // Plan actuel du partenaire (simulé — à terme depuis la DB)
  const currentPlan = partner?.plan || "free"; // "free" | "pro" | "business"
  const WAVE_NUMBER = "221777259330"; // Numéro Wave Yitewo pour paiement
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  const load = useCallback(async () => {
    if (!token) return;
    try {
      const [p, o, pr] = await Promise.all([
        fetch(`${BASE}/partners/portal/${token}`).then((r) => r.json()),
        fetch(`${BASE}/orders?partnerToken=${token}`).then((r) => r.json()).catch(() => []),
        fetch(`${BASE}/partner-products?token=${token}`).then((r) => r.json()).catch(() => []),
      ]);
      setPartner(p);
      setOrders(Array.isArray(o) ? o : o?.data ?? []);
      setProducts(Array.isArray(pr) ? pr : pr?.data ?? []);
      if (p?.slug) {
        fetch(`${BASE}/social/stats/${p.slug}`).then((r) => r.json()).then(setStats).catch(() => { });
      }
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000); // rafraîchissement auto toutes les 30s
    return () => clearInterval(interval);
  }, [load]);

  const pendingOrders = orders.filter((o) => o.status === "PENDING").length;
  const todayOrders = orders.filter((o) => {
    const d = new Date(o.createdAt);
    const now = new Date();
    return d.getDate() === now.getDate() && d.getMonth() === now.getMonth();
  }).length;
  const totalRevenue = orders
    .filter((o) => o.status === "DELIVERED")
    .reduce((s, o) => s + (o.totalPrice || 0), 0);

  const STATUS_LABEL: Record<string, { label: string; color: string; bg: string }> = {
    PENDING: { label: "En attente", color: "#92400e", bg: "#fef3c7" },
    CONFIRMED: { label: "Confirmée", color: "#1e40af", bg: "#dbeafe" },
    PREPARING: { label: "En prépa", color: "#6d28d9", bg: "#ede9fe" },
    DELIVERING: { label: "En livraison", color: "#0369a1", bg: "#e0f2fe" },
    DELIVERED: { label: "Livrée", color: "#065f46", bg: "#d1fae5" },
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

  return (
    <div>
      {/* Welcome */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 24, color: "#1a1a1a", marginBottom: 6 }}>
          Bonjour{partner ? `, ${partner.name}` : ""} 👋
        </h1>
        <p style={{ color: "#6b6b6b", fontSize: 14 }}>
          {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 14, marginBottom: 32 }}>
        <StatCard icon="🛒" label="Commandes totales" value={orders.length} color="#E8380D" />
        <StatCard icon="⏳" label="En attente" value={pendingOrders} color="#f59e0b" sub={pendingOrders > 0 ? "À traiter" : undefined} />
        <StatCard icon="📅" label="Aujourd'hui" value={todayOrders} color="#6366f1" />
        <StatCard icon="💰" label="Revenus (livrées)" value={totalRevenue > 0 ? `${totalRevenue.toLocaleString()} F` : "0 F"} color="#10b981" />
        <StatCard icon="📦" label="Produits actifs" value={products.filter((p) => p.isActive).length} color="#0ea5e9" />
      </div>

      {/* Quick actions */}
      <div style={{ display: "flex", gap: 12, marginBottom: 32, flexWrap: "wrap" }}>
        <Link href={`/partner-portal/${token}/produits`} style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "11px 22px", borderRadius: 99,
          background: "#E8380D", color: "#fff",
          textDecoration: "none", fontFamily: "Syne, sans-serif",
          fontWeight: 700, fontSize: 14,
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Ajouter un produit
        </Link>
        <Link href={`/partner-portal/${token}/commandes`} style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "11px 22px", borderRadius: 99,
          border: "1px solid #f0ebe8", background: "#fff",
          color: "#1a1a1a", textDecoration: "none", fontWeight: 600, fontSize: 14,
        }}>
          Voir les commandes
          {pendingOrders > 0 && (
            <span style={{ background: "#E8380D", color: "#fff", borderRadius: 99, fontSize: 11, fontWeight: 800, padding: "1px 7px" }}>
              {pendingOrders}
            </span>
          )}
        </Link>
      </div>

      {/* ═══ ENCART UPGRADE PLAN ═══ */}
      {currentPlan === "free" && (
        <div style={{
          background: "linear-gradient(135deg, #fff8f6 0%, #fff3f0 100%)",
          border: "1.5px solid #E8380D30",
          borderRadius: 18, padding: "22px 24px", marginBottom: 28,
          position: "relative", overflow: "hidden",
        }}>
          {/* Déco */}
          <div style={{ position: "absolute", top: -30, right: -30, width: 120, height: 120, borderRadius: "50%", background: "rgba(232,56,13,0.06)" }} />
          <div style={{ position: "absolute", bottom: -20, right: 60, width: 80, height: 80, borderRadius: "50%", background: "rgba(232,56,13,0.04)" }} />

          <div style={{ display: "flex", alignItems: "flex-start", gap: 16, flexWrap: "wrap", position: "relative", zIndex: 1 }}>
            <div style={{ flex: 1, minWidth: 240 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: 20 }}>🚀</span>
                <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 15, color: "#1a1a1a" }}>
                  Vous êtes sur le plan Gratuit
                </span>
                <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: "#f0ebe8", color: "#888" }}>
                  GRATUIT
                </span>
              </div>

              {/* Ce qui est bloqué */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 16px", marginBottom: 14 }}>
                {[
                  { text: "Apparaître en 1ère page", locked: true },
                  { text: "Statistiques détaillées", locked: true },
                  { text: "Badge Pro Vérifié", locked: true },
                  { text: "Agent WhatsApp IA", locked: true },
                  { text: "Produits illimités", locked: true },
                  { text: "Rapport mensuel", locked: true },
                ].map((item) => (
                  <div key={item.text} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#888" }}>
                    <span style={{ color: item.locked ? "#ddd" : "#10b981", flexShrink: 0 }}>
                      {item.locked ? "🔒" : "✓"}
                    </span>
                    {item.text}
                  </div>
                ))}
              </div>

              {/* Urgence */}
              <p style={{ fontSize: 12, color: "#E8380D", fontWeight: 600 }}>
                📍 Vous êtes actuellement en position basse dans les résultats de recherche.
              </p>
            </div>

            {/* CTA */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10, flexShrink: 0, alignItems: "center" }}>
              {/* Pro */}
              <div style={{ background: "#fff", border: "1.5px solid #E8380D", borderRadius: 14, padding: "16px 20px", textAlign: "center", minWidth: 180 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: "#E8380D", letterSpacing: "0.05em", marginBottom: 4 }}>YITEWO PRO</p>
                <p style={{ fontFamily: "Syne", fontWeight: 800, fontSize: 22, color: "#1a1a1a", marginBottom: 2 }}>
                  4 900 <span style={{ fontSize: 13, fontWeight: 600 }}>FCFA/mois</span>
                </p>
                <p style={{ fontSize: 10, color: "#aaa", marginBottom: 12 }}>≈ moins d'un bouquet Canal+</p>
                <a
                  href={`https://wa.me/${WAVE_NUMBER}?text=${encodeURIComponent(`Bonjour ! Je souhaite passer au plan Yitewo Pro (4 900 FCFA/mois) pour ma boutique : ${partner?.name || ""}. Je vais envoyer le paiement via Wave.`)}`}
                  target="_blank" rel="noreferrer"
                  style={{ display: "block", padding: "9px 16px", borderRadius: 10, background: "#E8380D", color: "#fff", textDecoration: "none", fontFamily: "Syne", fontWeight: 700, fontSize: 13 }}
                >
                  Payer via Wave →
                </a>
              </div>

              <a href="/pricing" style={{ fontSize: 11, color: "#aaa", textDecoration: "underline" }}>
                Voir tous les plans
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Badge plan actif si Pro ou Business */}
      {currentPlan !== "free" && (
        <div style={{ background: currentPlan === "business" ? "linear-gradient(135deg, #1A9E5F15, #1A9E5F08)" : "linear-gradient(135deg, #E8380D10, #E8380D05)", border: `1px solid ${currentPlan === "business" ? "#1A9E5F30" : "#E8380D20"}`, borderRadius: 12, padding: "12px 18px", marginBottom: 24, display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 18 }}>{currentPlan === "business" ? "⭐" : "🚀"}</span>
          <div>
            <p style={{ fontFamily: "Syne", fontWeight: 700, fontSize: 13, color: "#1a1a1a" }}>
              Plan {currentPlan === "business" ? "Business" : "Pro"} actif
            </p>
            <p style={{ fontSize: 11, color: "#aaa" }}>Toutes vos fonctionnalités premium sont disponibles</p>
          </div>
          <span style={{ marginLeft: "auto", fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 99, background: currentPlan === "business" ? "#1A9E5F22" : "#E8380D15", color: currentPlan === "business" ? "#1A9E5F" : "#E8380D" }}>
            {currentPlan.toUpperCase()} ✓
          </span>
        </div>
      )}

      {/* Recent orders */}
      <div style={{
        background: "#fff", borderRadius: 16,
        border: "1px solid #f0ebe8", overflow: "hidden",
      }}>
        <div style={{
          padding: "18px 22px", borderBottom: "1px solid #f0ebe8",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 16, color: "#1a1a1a" }}>
            Dernières commandes
          </h2>
          <Link href={`/partner-portal/${token}/commandes`} style={{ fontSize: 13, color: "#E8380D", textDecoration: "none", fontWeight: 600 }}>
            Tout voir →
          </Link>
        </div>

        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#aaa", fontSize: 14 }}>
            Chargement…
          </div>
        ) : orders.length === 0 ? (
          <div style={{ padding: "48px", textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🛒</div>
            <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 600, fontSize: 16, color: "#1a1a1a", marginBottom: 6 }}>
              Aucune commande pour l'instant
            </p>
            <p style={{ fontSize: 13, color: "#aaa", marginBottom: 20 }}>
              Partagez votre lien pour recevoir vos premières commandes
            </p>
            <button
              onClick={() => navigator.clipboard?.writeText(`${window.location.origin}/order?partner=${partner?.slug}`)}
              style={{
                padding: "10px 24px", borderRadius: 99,
                border: "none", background: "#E8380D",
                color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer",
              }}
            >
              📋 Copier mon lien de commande
            </button>
          </div>
        ) : (
          orders.slice(0, 5).map((order, i) => {
            const s = STATUS_LABEL[order.status] || STATUS_LABEL.PENDING;
            return (
              <div key={order.id} style={{
                padding: "14px 22px",
                borderBottom: i < Math.min(orders.length, 5) - 1 ? "1px solid #f7f4f2" : "none",
                display: "flex", alignItems: "center", gap: 14,
                transition: "background 0.15s",
              }}
                onMouseEnter={(e) => (e.currentTarget as HTMLDivElement).style.background = "#fafaf8"}
                onMouseLeave={(e) => (e.currentTarget as HTMLDivElement).style.background = "transparent"}
              >
                <div style={{
                  width: 38, height: 38, borderRadius: 10,
                  background: "#fff5f3", display: "flex",
                  alignItems: "center", justifyContent: "center",
                  fontSize: 16, flexShrink: 0,
                }}>🛒</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "#1a1a1a", marginBottom: 2 }}>
                    #{order.id.slice(-6).toUpperCase()}
                    {order.customerName && <span style={{ color: "#aaa", fontWeight: 400 }}> · {order.customerName}</span>}
                  </p>
                  <p style={{ fontSize: 12, color: "#aaa" }}>
                    {order.quarter}, {order.city} · {order.items?.length || 0} article(s)
                  </p>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <span style={{
                    display: "inline-block", padding: "3px 10px", borderRadius: 99,
                    fontSize: 11, fontWeight: 700,
                    background: s.bg, color: s.color, marginBottom: 4,
                  }}>
                    {s.label}
                  </span>
                  <p style={{ fontSize: 12, color: "#aaa" }}>
                    {order.totalPrice?.toLocaleString()} FCFA · {timeAgo(order.createdAt)}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
      {/* IA Advisor */}
      {partner && (
        <AIAdvisor
          partner={partner}
          orders={orders}
          products={products}
          stats={stats}
        />
      )}
    </div>
  );
}
