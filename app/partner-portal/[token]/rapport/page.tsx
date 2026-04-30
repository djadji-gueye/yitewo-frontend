"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { usePlan } from "@/hooks/usePlan";
import Link from "next/link";

const BASE = process.env.NEXT_PUBLIC_URL_PROD || "http://localhost:3003";

export default function RapportPage() {
  const params = useParams();
  const token = params?.token as string;
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const planInfo = usePlan(report?.partner?.plan || "free");

  useEffect(() => {
    if (!token) return;
    fetch(`${BASE}/partner-portal/${token}/monthly-report`)
      .then(r => r.json())
      .then(setReport)
      .catch(() => setReport({ locked: true }))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return (
    <div style={{ padding: 28, textAlign: "center", color: "#aaa" }}>
      <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
      <p>Chargement du rapport…</p>
    </div>
  );

  // Plan insuffisant
  if (report?.locked) return (
    <div style={{ padding: 28, maxWidth: 560, margin: "0 auto" }}>
      <div style={{ background: "#fff", border: "1px solid #f0ebe8", borderRadius: 20, padding: "40px 32px", textAlign: "center" }}>
        <div style={{ fontSize: 52, marginBottom: 16 }}>📊</div>
        <h2 style={{ fontFamily: "Syne", fontWeight: 800, fontSize: 20, color: "#1a1a1a", marginBottom: 10 }}>
          Rapport mensuel
        </h2>
        <p style={{ color: "#888", fontSize: 14, lineHeight: 1.7, marginBottom: 24 }}>
          {report?.message || "Le rapport mensuel est disponible à partir du plan Business."}
        </p>
        {/* Preview floutée */}
        <div style={{ filter: "blur(6px)", opacity: 0.4, pointerEvents: "none", marginBottom: 24, userSelect: "none" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
            {[["250 000", "Revenu du mois"], ["34", "Commandes"], ["+18%", "Croissance"], ["14h-15h", "Heure de pointe"]].map(([v, l]) => (
              <div key={l} style={{ background: "#f5f5f5", borderRadius: 10, padding: "14px" }}>
                <p style={{ fontSize: 22, fontWeight: 800 }}>{v}</p>
                <p style={{ fontSize: 11, color: "#888" }}>{l}</p>
              </div>
            ))}
          </div>
        </div>
        <a href="/pricing" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 28px", borderRadius: 99, background: "#1A9E5F", color: "#fff", textDecoration: "none", fontFamily: "Syne", fontWeight: 700, fontSize: 14 }}>
          ⭐ Passer au Business — 14 900 FCFA/mois
        </a>
      </div>
    </div>
  );

  const { revenue, orders, peakHour, period, partner } = report;
  const growthColor = revenue?.growth >= 0 ? "#10b981" : "#ef4444";
  const growthIcon = revenue?.growth >= 0 ? "↑" : "↓";

  return (
    <div style={{ padding: "24px 28px", maxWidth: 780, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: "Syne", fontWeight: 800, fontSize: 22, color: "#1a1a1a", marginBottom: 4 }}>
            📊 Rapport mensuel
          </h1>
          <p style={{ fontSize: 13, color: "#888" }}>{period} · {partner?.name}</p>
        </div>
        <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 99, background: "#d1fae5", color: "#065f46" }}>
          ⭐ Business
        </span>
      </div>

      {/* Stats principales */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px,1fr))", gap: 12, marginBottom: 24 }}>
        {[
          { icon: "💰", label: "Revenu du mois", value: `${revenue?.thisMonth?.toLocaleString("fr-FR") || 0} FCFA`, sub: `${growthIcon} ${Math.abs(revenue?.growth || 0)}% vs mois préc.`, subColor: growthColor },
          { icon: "📦", label: "Commandes", value: orders?.total || 0, sub: `${orders?.delivered || 0} livrées`, subColor: "#10b981" },
          { icon: "⏳", label: "En attente", value: orders?.pending || 0, sub: "à traiter", subColor: "#f59e0b" },
          { icon: "🕐", label: "Heure de pointe", value: peakHour || "N/A", sub: "pic de commandes", subColor: "#6366f1" },
        ].map((s) => (
          <div key={s.label} style={{ background: "#fff", border: "1px solid #f0ebe8", borderRadius: 14, padding: "16px 14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
              <span style={{ fontSize: 18 }}>{s.icon}</span>
              <p style={{ fontSize: 11, color: "#888" }}>{s.label}</p>
            </div>
            <p style={{ fontFamily: "Syne", fontWeight: 800, fontSize: 20, color: "#1a1a1a", marginBottom: 4 }}>
              {s.value}
            </p>
            <p style={{ fontSize: 11, color: s.subColor, fontWeight: 600 }}>{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Répartition commandes */}
      <div style={{ background: "#fff", border: "1px solid #f0ebe8", borderRadius: 16, padding: "20px 22px", marginBottom: 16 }}>
        <p style={{ fontFamily: "Syne", fontWeight: 700, fontSize: 15, color: "#1a1a1a", marginBottom: 16 }}>
          Répartition des commandes
        </p>
        {[
          { label: "Livrées", count: orders?.delivered || 0, total: orders?.total || 1, color: "#10b981" },
          { label: "En attente", count: orders?.pending || 0, total: orders?.total || 1, color: "#f59e0b" },
          { label: "Annulées", count: orders?.cancelled || 0, total: orders?.total || 1, color: "#ef4444" },
        ].map((row) => {
          const pct = orders?.total > 0 ? Math.round((row.count / orders.total) * 100) : 0;
          return (
            <div key={row.label} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#555", marginBottom: 5 }}>
                <span>{row.label}</span>
                <span style={{ fontWeight: 700, color: row.color }}>{row.count} ({pct}%)</span>
              </div>
              <div style={{ height: 6, background: "#f5f5f5", borderRadius: 99, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${pct}%`, background: row.color, borderRadius: 99, transition: "width 0.6s ease" }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Revenu comparatif */}
      <div style={{ background: "#fff", border: "1px solid #f0ebe8", borderRadius: 16, padding: "20px 22px" }}>
        <p style={{ fontFamily: "Syne", fontWeight: 700, fontSize: 15, color: "#1a1a1a", marginBottom: 16 }}>
          Comparaison revenus
        </p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {[
            { label: "Mois en cours", value: revenue?.thisMonth || 0, color: "#E8380D" },
            { label: "Mois précédent", value: revenue?.lastMonth || 0, color: "#ccc" },
          ].map((r) => (
            <div key={r.label} style={{ flex: "1 1 160px", background: "#f9f9f9", borderRadius: 12, padding: "14px 16px" }}>
              <div style={{ width: "100%", height: 6, background: "#eee", borderRadius: 99, marginBottom: 10, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${Math.min(100, (r.value / (Math.max(revenue?.thisMonth, revenue?.lastMonth) || 1)) * 100)}%`, background: r.color, borderRadius: 99 }} />
              </div>
              <p style={{ fontFamily: "Syne", fontWeight: 800, fontSize: 18, color: "#1a1a1a" }}>
                {r.value.toLocaleString("fr-FR")} FCFA
              </p>
              <p style={{ fontSize: 11, color: "#aaa" }}>{r.label}</p>
            </div>
          ))}
        </div>
        <p style={{ marginTop: 14, fontSize: 13, fontWeight: 700, color: growthColor }}>
          {growthIcon} {Math.abs(revenue?.growth || 0)}% par rapport au mois précédent
        </p>
      </div>
    </div>
  );
}
