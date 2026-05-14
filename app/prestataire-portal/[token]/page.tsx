"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

const BASE = process.env.NEXT_PUBLIC_URL_PROD || "http://localhost:3003";

function StatCard({ icon, label, value, color, sub }: any) {
  return (
    <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #f0ebe8", padding: "20px 22px" }}>
      <div style={{ width: 42, height: 42, borderRadius: 10, background: color + "18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, marginBottom: 14 }}>
        {icon}
      </div>
      <p style={{ fontSize: 26, fontFamily: "Syne, sans-serif", fontWeight: 800, color: "#1a1a1a", marginBottom: 4 }}>
        {value ?? <span style={{ color: "#ddd" }}>—</span>}
      </p>
      <p style={{ fontSize: 13, color: "#6b6b6b" }}>{label}</p>
      {sub && <p style={{ fontSize: 11, color, marginTop: 4, fontWeight: 600 }}>{sub}</p>}
    </div>
  );
}

export default function PrestataireDashboard() {
  const params = useParams();
  const token = params?.token as string;

  const [prestataire, setPrestataire] = useState<any>(null);
  const [missions, setMissions] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    Promise.all([
      fetch(`${BASE}/partners/portal/${token}`).then((r) => r.json()),
      fetch(`${BASE}/service-requests/open?partnerToken=${token}`).then((r) => r.json()).catch(() => []),
      fetch(`${BASE}/social/stats/${token}`).then((r) => r.json()).catch(() => null),
    ]).then(([p, m, s]) => {
      setPrestataire(p);
      setMissions(Array.isArray(m) ? m : []);
      setStats(s);
    }).finally(() => setLoading(false));
  }, [token]);

  if (loading) return <div style={{ textAlign: "center", padding: 60, color: "#aaa" }}>Chargement…</div>;
  if (!prestataire) return null;

  const pendingMissions = missions; // all open missions = potential interests
  const doneMissions: any[] = []; // assigned shown in missions tab
  const initials = prestataire.name?.split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase() || "?";
  const hue = [...(prestataire.name || "")].reduce((acc: number, c: string) => acc + c.charCodeAt(0), 0) % 360;

  return (
    <div style={{ maxWidth: 800, fontFamily: "DM Sans, sans-serif" }}>

      {/* Header identité */}
      <div style={{ background: "#fff", borderRadius: 18, border: "1px solid #f0ebe8", padding: "24px", marginBottom: 20, display: "flex", alignItems: "center", gap: 18 }}>
        <div style={{ width: 72, height: 72, borderRadius: "50%", overflow: "hidden", flexShrink: 0, background: `linear-gradient(135deg,hsl(${hue},55%,28%),hsl(${(hue + 60) % 360},65%,42%))`, display: "flex", alignItems: "center", justifyContent: "center", border: "3px solid #fff", boxShadow: "0 4px 16px rgba(0,0,0,0.12)" }}>
          {prestataire.profileImageUrl
            ? <img src={prestataire.profileImageUrl} alt={prestataire.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : <span style={{ fontFamily: "Syne", fontWeight: 800, fontSize: 24, color: "#fff" }}>{initials}</span>}
        </div>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 20, color: "#1a1a1a", marginBottom: 4 }}>{prestataire.name}</h1>
          <p style={{ fontSize: 13, color: "#6b6b6b", marginBottom: 8 }}>📍 {prestataire.zone ? `${prestataire.zone}, ` : ""}{prestataire.city}</p>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {(prestataire.serviceCategories || []).slice(0, 3).map((c: string) => (
              <span key={c} style={{ fontSize: 11, padding: "3px 9px", borderRadius: 99, background: "#fff5f3", color: "#E8380D", border: "1px solid #fdd0c5", fontWeight: 600 }}>{c}</span>
            ))}
          </div>
        </div>
        <Link href={`/prestataire-portal/${token}/profil`}
          style={{ padding: "8px 16px", borderRadius: 10, border: "1px solid #f0ebe8", background: "#fff", color: "#6b6b6b", textDecoration: "none", fontSize: 13, fontWeight: 600, flexShrink: 0 }}>
          ✏️ Modifier
        </Link>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 14, marginBottom: 24 }}>
        <StatCard icon="📋" label="Missions disponibles" value={missions.length} color="#E8380D" />
        <StatCard icon="🙋" label="Mes intérêts" value={pendingMissions.length} color="#f59e0b" sub={pendingMissions.length > 0 ? "En attente de validation" : undefined} />
        <StatCard icon="✅" label="Missions assignées" value={doneMissions.length} color="#10b981" />
        <StatCard icon="⭐" label="Note moyenne" value={stats?.avgRating ? `${stats.avgRating}/5` : "—"} color="#6d28d9" sub={stats?.reviewCount ? `${stats.reviewCount} avis` : undefined} />
      </div>

      {/* Missions récentes */}
      <div style={{ background: "#fff", borderRadius: 18, border: "1px solid #f0ebe8", padding: "20px", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 16, color: "#1a1a1a" }}>Missions disponibles</h2>
          <Link href={`/prestataire-portal/${token}/missions`} style={{ fontSize: 12, color: "#E8380D", fontWeight: 600, textDecoration: "none" }}>Voir tout →</Link>
        </div>

        {missions.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 20px", color: "#aaa" }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>📭</div>
            <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>Aucune mission pour l'instant</p>
            <p style={{ fontSize: 12, lineHeight: 1.6 }}>Les missions disponibles apparaîtront ici. Allez dans "Mes missions" pour exprimer votre intérêt.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {missions.slice(0, 5).map((m) => (
              <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 14px", borderRadius: 12, background: "#f7f4f2", border: "1px solid #f0ebe8" }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: m.status === "done" ? "#d1fae5" : "#fef3c7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>
                  {m.status === "done" ? "✅" : "⏳"}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 600, fontSize: 13, color: "#1a1a1a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.service || "Mission"}</p>
                  <p style={{ fontSize: 11, color: "#6b6b6b" }}>📍 {m.quarter ? `${m.quarter}, ` : ""}{m.city} · <span style={{ color: "#aaa", fontStyle: "italic" }}>🔒 Client confidentiel</span></p>
                </div>
                <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 99, background: "#fff5f3", color: "#E8380D", border: "1px solid #fdd0c5", flexShrink: 0 }}>
                  Disponible
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions rapides */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Link href={`/prestataire-portal/${token}/disponibilites`}
          style={{ background: "#fff", borderRadius: 14, border: "1px solid #f0ebe8", padding: "18px 20px", textDecoration: "none", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: "#dbeafe", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🗓️</div>
          <div>
            <p style={{ fontFamily: "Syne", fontWeight: 700, fontSize: 13, color: "#1a1a1a", marginBottom: 2 }}>Disponibilités</p>
            <p style={{ fontSize: 11, color: "#6b6b6b" }}>Gérer mes horaires</p>
          </div>
        </Link>
        <Link href={`/prestataire-portal/${token}/reputation`}
          style={{ background: "#fff", borderRadius: 14, border: "1px solid #f0ebe8", padding: "18px 20px", textDecoration: "none", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: "#fef3c7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>⭐</div>
          <div>
            <p style={{ fontFamily: "Syne", fontWeight: 700, fontSize: 13, color: "#1a1a1a", marginBottom: 2 }}>Réputation</p>
            <p style={{ fontSize: 11, color: "#6b6b6b" }}>Voir mes avis</p>
          </div>
        </Link>
      </div>
    </div>
  );
}