"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

const BASE = process.env.NEXT_PUBLIC_URL_PROD || "http://localhost:3003";

export default function MissionsPage() {
  const params = useParams();
  const token = params?.token as string;

  const [missions, setMissions] = useState<any[]>([]);
  const [myInterests, setMyInterests] = useState<string[]>([]);
  const [myMissions, setMyMissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);
  const [tab, setTab] = useState<"open" | "mine">("open");

  useEffect(() => {
    if (!token) return;
    Promise.all([
      // Essaie le nouvel endpoint, fallback sur le générique
      fetch(`${BASE}/service-requests/open?partnerToken=${token}`)
        .then((r) => r.ok ? r.json() : fetch(`${BASE}/service-requests?partnerToken=${token}&status=PENDING`).then((r2) => r2.json()))
        .catch(() => []),
      fetch(`${BASE}/service-requests/my-interests?partnerToken=${token}`).then((r) => r.json()).catch(() => []),
      // Missions assignées — uniquement si l'endpoint existe, sinon tableau vide
      fetch(`${BASE}/service-requests/assigned?partnerToken=${token}`)
        .then((r) => r.ok ? r.json() : [])
        .catch(() => []),
    ]).then(([open, interests, assigned]) => {
      // Filtre les missions ouvertes (PENDING ou sans status) et supprime les infos client
      const openMissions = (Array.isArray(open) ? open : [])
        .filter((m: any) => !m.status || m.status === "PENDING" || m.status === "pending")
        .map((m: any) => ({
          ...m,
          customerName: undefined,
          customerPhone: undefined,
          customerEmail: undefined,
        }));
      setMissions(openMissions);
      setMyInterests(Array.isArray(interests) ? interests.map((i: any) => i.requestId || i.id) : []);
      setMyMissions(Array.isArray(assigned) ? assigned : []);
    }).finally(() => setLoading(false));
  }, [token]);

  const expressInterest = async (missionId: string) => {
    setActing(missionId);
    try {
      await fetch(`${BASE}/service-requests/${missionId}/interest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ partnerToken: token }),
      });
      setMyInterests((prev) => [...prev, missionId]);
    } catch { /* silencieux */ }
    finally { setActing(null); }
  };

  const markDone = async (missionId: string) => {
    setActing(missionId);
    try {
      await fetch(`${BASE}/service-requests/${missionId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "DONE", partnerToken: token }),
      });
      setMyMissions((prev) => prev.map((m) => m.id === missionId ? { ...m, status: "DONE" } : m));
    } catch { /* silencieux */ }
    finally { setActing(null); }
  };

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: "9px 20px", borderRadius: 10, fontSize: 13, cursor: "pointer", fontWeight: active ? 700 : 400,
    border: "none", background: active ? "#E8380D" : "transparent", color: active ? "#fff" : "#6b6b6b",
    transition: "all 0.18s",
  });

  if (loading) return <div style={{ textAlign: "center", padding: 60, color: "#aaa" }}>Chargement…</div>;

  return (
    <div style={{ maxWidth: 700, fontFamily: "DM Sans, sans-serif" }}>
      <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 22, color: "#1a1a1a", marginBottom: 6 }}>Missions</h1>
      <p style={{ fontSize: 13, color: "#aaa", marginBottom: 20, lineHeight: 1.6 }}>
        Exprimez votre intérêt pour les missions disponibles. L&apos;équipe Yitewo vous assignera les missions pour lesquelles vous avez été retenu.
      </p>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, background: "#f7f4f2", borderRadius: 12, padding: 4, marginBottom: 24, width: "fit-content" }}>
        <button style={tabStyle(tab === "open")} onClick={() => setTab("open")}>
          📋 Disponibles {missions.length > 0 && <span style={{ marginLeft: 6, background: tab === "open" ? "rgba(255,255,255,0.3)" : "#E8380D", color: "#fff", borderRadius: 99, fontSize: 10, padding: "1px 7px" }}>{missions.length}</span>}
        </button>
        <button style={tabStyle(tab === "mine")} onClick={() => setTab("mine")}>
          ✅ Mes missions {myMissions.length > 0 && <span style={{ marginLeft: 6, background: tab === "mine" ? "rgba(255,255,255,0.3)" : "#E8380D", color: "#fff", borderRadius: 99, fontSize: 10, padding: "1px 7px" }}>{myMissions.length}</span>}
        </button>
      </div>

      {/* MISSIONS OUVERTES */}
      {tab === "open" && (
        missions.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", background: "#fff", borderRadius: 18, border: "1px solid #f0ebe8" }}>
            <div style={{ fontSize: 44, marginBottom: 12 }}>📭</div>
            <p style={{ fontFamily: "Syne", fontWeight: 700, fontSize: 16, color: "#1a1a1a", marginBottom: 8 }}>Aucune mission disponible</p>
            <p style={{ fontSize: 13, color: "#aaa" }}>Les nouvelles demandes de clients apparaîtront ici. Revenez régulièrement !</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {missions.map((m) => {
              const interested = myInterests.includes(m.id);
              return (
                <div key={m.id} style={{ background: "#fff", borderRadius: 16, border: `1px solid ${interested ? "#a7f3d0" : "#f0ebe8"}`, padding: "18px 20px" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: "#fff5f3", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
                      {m.serviceIcon || "🔧"}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                        <p style={{ fontFamily: "Syne", fontWeight: 700, fontSize: 15, color: "#1a1a1a" }}>{m.service}</p>
                        {interested && <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: "#d1fae5", color: "#065f46" }}>✓ Intérêt exprimé</span>}
                      </div>

                      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", fontSize: 12, color: "#6b6b6b", marginBottom: 10 }}>
                        <span>📍 {m.quarter ? `${m.quarter}, ` : ""}{m.city}</span>
                        <span>🕐 {m.createdAt ? new Date(m.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short" }) : ""}</span>
                        {m.budget && <span>💰 {m.budget}</span>}
                      </div>

                      {m.description && (
                        <div style={{ padding: "10px 12px", background: "#f7f4f2", borderRadius: 10, fontSize: 13, color: "#555", lineHeight: 1.6, marginBottom: 12 }}>
                          {m.description}
                        </div>
                      )}

                      {/* Client caché */}
                      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: "#f7f4f2", borderRadius: 10, marginBottom: 14 }}>
                        <span>🔒</span>
                        <p style={{ fontSize: 12, color: "#aaa", fontStyle: "italic" }}>
                          Les coordonnées du client sont visibles uniquement si vous êtes sélectionné par l&apos;équipe Yitewo.
                        </p>
                      </div>

                      {interested ? (
                        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: "#d1fae5", borderRadius: 10, border: "1px solid #a7f3d0" }}>
                          <span>✅</span>
                          <div>
                            <p style={{ fontSize: 13, fontWeight: 700, color: "#065f46" }}>Intérêt transmis à l&apos;équipe</p>
                            <p style={{ fontSize: 11, color: "#6b9e8a" }}>Vous serez contacté si vous êtes sélectionné.</p>
                          </div>
                        </div>
                      ) : (
                        <button onClick={() => expressInterest(m.id)} disabled={acting === m.id} style={{
                          width: "100%", padding: "11px", borderRadius: 10, border: "1.5px solid #E8380D",
                          background: "#fff5f3", color: "#E8380D",
                          fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 13,
                          cursor: acting === m.id ? "not-allowed" : "pointer",
                          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                        }}>
                          {acting === m.id ? "⏳ Envoi…" : "🙋 Je suis intéressé(e)"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* MES MISSIONS ASSIGNÉES */}
      {tab === "mine" && (
        myMissions.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", background: "#fff", borderRadius: 18, border: "1px solid #f0ebe8" }}>
            <div style={{ fontSize: 44, marginBottom: 12 }}>⏳</div>
            <p style={{ fontFamily: "Syne", fontWeight: 700, fontSize: 16, color: "#1a1a1a", marginBottom: 8 }}>Aucune mission assignée</p>
            <p style={{ fontSize: 13, color: "#aaa" }}>L&apos;équipe Yitewo vous assignera des missions après validation de votre intérêt.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {myMissions.map((m) => (
              <div key={m.id} style={{ background: "#fff", borderRadius: 16, border: "1px solid #f0ebe8", padding: "18px 20px" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: "#d1fae5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
                    {m.serviceIcon || "🔧"}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
                      <p style={{ fontFamily: "Syne", fontWeight: 700, fontSize: 15, color: "#1a1a1a" }}>{m.service}</p>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: m.status === "DONE" ? "#d1fae5" : "#dbeafe", color: m.status === "DONE" ? "#065f46" : "#1d4ed8" }}>
                        {m.status === "DONE" ? "✅ Terminée" : "🎯 Assignée"}
                      </span>
                    </div>

                    <div style={{ display: "flex", gap: 12, flexWrap: "wrap", fontSize: 12, color: "#6b6b6b", marginBottom: 10 }}>
                      <span>📍 {m.quarter ? `${m.quarter}, ` : ""}{m.city}</span>
                    </div>

                    {m.description && (
                      <div style={{ padding: "10px 12px", background: "#f7f4f2", borderRadius: 10, fontSize: 13, color: "#555", lineHeight: 1.6, marginBottom: 12, borderLeft: "3px solid #E8380D" }}>
                        &ldquo;{m.description}&rdquo;
                      </div>
                    )}

                    {/* Infos client VISIBLES car assigné */}
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
                      {m.customerName && (
                        <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 12px", background: "#f0fdf4", borderRadius: 10, border: "1px solid #bbf7d0" }}>
                          <span>👤</span>
                          <span style={{ fontSize: 13, fontWeight: 600, color: "#065f46" }}>{m.customerName}</span>
                        </div>
                      )}
                      {m.customerPhone && (
                        <a href={`https://wa.me/${m.customerPhone?.replace(/[\s+]/g, "")}`} target="_blank" rel="noreferrer"
                          style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 12px", background: "#f0fdf4", borderRadius: 10, border: "1px solid #bbf7d0", textDecoration: "none" }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                          <span style={{ fontSize: 13, fontWeight: 600, color: "#065f46" }}>{m.customerPhone}</span>
                        </a>
                      )}
                    </div>

                    {m.status !== "DONE" && (
                      <button onClick={() => markDone(m.id)} disabled={acting === m.id}
                        style={{ padding: "9px 18px", borderRadius: 10, border: "none", background: "#10b981", color: "#fff", fontFamily: "Syne", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                        {acting === m.id ? "…" : "✅ Marquer terminée"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}