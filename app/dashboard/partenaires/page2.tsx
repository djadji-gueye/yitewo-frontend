"use client";
import AddressPicker from "@/components/AddressPicker";

import { useState, useEffect, useCallback } from "react";

const BASE = process.env.NEXT_PUBLIC_URL_PROD || "http://localhost:3003";
function authFetch(path: string, options?: RequestInit) {
  const token = typeof window !== "undefined" ? localStorage.getItem("yitewo_token") : "";
  return fetch(`${BASE}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...options?.headers },
  }).then((r) => r.json());
}

const TYPE_META: Record<string, { icon: string; color: string }> = {
  Marchand: { icon: "🛒", color: "#10b981" },
  Restaurant: { icon: "🍽️", color: "#f59e0b" },
  Prestataire: { icon: "🔧", color: "#8b5cf6" },
  Livreur: { icon: "🏍️", color: "#3b82f6" },
  Ouvrier: { icon: "👷", color: "#6b7280" },
};

function TokenButton({ partnerId }: { partnerId: string }) {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generate = async () => {
    setLoading(true);
    try {
      const adminToken = localStorage.getItem("yitewo_token");
      const res = await fetch(`${BASE}/partners/${partnerId}/portal-token`, {
        method: "POST",
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const data = await res.json();
      setToken(data.token);
    } finally {
      setLoading(false);
    }
  };

  const copy = () => {
    if (!token) return;
    const url = `${window.location.origin}/partner-portal/${token}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!token) return (
    <button onClick={generate} disabled={loading} style={{
      padding: "6px 14px", borderRadius: 8, fontSize: 11, cursor: "pointer",
      border: "1px solid rgba(99,102,241,0.3)", background: "rgba(99,102,241,0.1)",
      color: "#818cf8", fontWeight: 600,
    }}>
      {loading ? "…" : "🔗 Générer lien portail"}
    </button>
  );

  return (
    <button onClick={copy} style={{
      padding: "6px 14px", borderRadius: 8, fontSize: 11, cursor: "pointer",
      border: "1px solid rgba(16,185,129,0.3)", background: "rgba(16,185,129,0.1)",
      color: "#10b981", fontWeight: 600,
    }}>
      {copied ? "✅ Copié !" : "📋 Copier lien portail"}
    </button>
  );
}

export default function PartenairesPage() {
  const [partners, setPartners] = useState<any[]>([]);
  const [tokens, setTokens] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "active" | "pending">("pending");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [expandedId, setExpandedId]   = useState<string | null>(null);
  const [geoEdit, setGeoEdit]         = useState<{address:string;lat?:number;lng?:number;bannerUrl:string}>({address:"",bannerUrl:""});
  const [savingGeo, setSavingGeo]     = useState(false);

  const load = useCallback(async () => {
    try {
      const [p, t] = await Promise.all([
        authFetch("/partners"),
        authFetch("/partners/admin/portal-tokens"),
      ]);
      setPartners(Array.isArray(p) ? p : []);
      // Build token map: partnerId → token
      const tokenMap: Record<string, string> = {};
      if (Array.isArray(t)) {
        t.forEach((pt: any) => { tokenMap[pt.partner.id] = pt.token; });
      }
      setTokens(tokenMap);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggleActive = async (id: string, current: boolean) => {
    setActing(id);
    try {
      await fetch(`${BASE}/partners/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("yitewo_token")}` },
        body: JSON.stringify({ isActive: !current }),
      });
      setPartners((prev) => prev.map((p) => p.id === id ? { ...p, isActive: !current } : p));
    } finally { setActing(null); }
  };

  const uploadPhoto = async (partnerId: string, file: File) => {
    setUploadingId(partnerId);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const adminToken = localStorage.getItem("yitewo_token");
      const res = await fetch(`${BASE}/partners/upload-profile-image`, {
        method: "POST",
        headers: { Authorization: `Bearer ${adminToken}` },
        body: fd,
      });
      const data = await res.json();
      if (data.url) {
        setPartners((prev) => prev.map((p) => p.id === partnerId ? { ...p, profileImageUrl: data.url } : p));
        await authFetch(`/partners/${partnerId}`, { method: "PATCH", body: JSON.stringify({ profileImageUrl: data.url }) });
      }
    } catch (e) { console.error("Upload failed", e); }
    finally { setUploadingId(null); }
  };

  const saveGeo = async (id: string) => {
    setSavingGeo(true);
    try {
      await authFetch(`/partners/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          address:   geoEdit.address || undefined,
          lat:       geoEdit.lat,
          lng:       geoEdit.lng,
          bannerUrl: geoEdit.bannerUrl || undefined,
        }),
      });
      setPartners((prev) => prev.map((p) => p.id === id
        ? { ...p, address: geoEdit.address, lat: geoEdit.lat, lng: geoEdit.lng, bannerUrl: geoEdit.bannerUrl }
        : p
      ));
      setExpandedId(null);
    } finally { setSavingGeo(false); }
  };

  const generateToken = async (id: string) => {
    setActing(id);
    try {
      const res = await authFetch(`/partners/${id}/portal-token`, { method: "POST" });
      setTokens((prev) => ({ ...prev, [id]: res.token }));
    } finally { setActing(null); }
  };

  const copyPortalLink = (partnerId: string) => {
    const token = tokens[partnerId];
    if (!token) return;
    const url = `${window.location.origin}/partner-portal/${token}`;
    navigator.clipboard?.writeText(url);
    setCopiedId(partnerId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filtered = partners.filter((p) => {
    if (filter === "active") return p.isActive;
    if (filter === "pending") return !p.isActive;
    return true;
  });

  const pendingCount = partners.filter((p) => !p.isActive).length;

  return (
    <div style={{ padding: "28px", maxWidth: 960, margin: "0 auto" }}>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 22, color: "#fff", marginBottom: 4 }}>
            Partenaires
          </h1>
          {pendingCount > 0 && (
            <p style={{ fontSize: 13, color: "#f59e0b" }}>
              ⏳ {pendingCount} candidature{pendingCount > 1 ? "s" : ""} en attente
            </p>
          )}
        </div>
        <button onClick={load} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "6px 12px", color: "#888", fontSize: 12, cursor: "pointer" }}>
          ↻ Actualiser
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 24, background: "#13131f", borderRadius: 10, padding: 4, width: "fit-content", border: "1px solid rgba(255,255,255,0.06)" }}>
        {[
          { key: "pending", label: "En attente", count: pendingCount },
          { key: "active", label: "Actifs", count: partners.filter((p) => p.isActive).length },
          { key: "all", label: "Tous", count: partners.length },
        ].map((t) => (
          <button key={t.key} onClick={() => setFilter(t.key as any)} style={{
            padding: "7px 16px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12,
            background: filter === t.key ? "#E8380D" : "transparent",
            color: filter === t.key ? "#fff" : "#666",
            fontWeight: filter === t.key ? 700 : 400,
            display: "flex", alignItems: "center", gap: 6,
          }}>
            {t.label}
            {t.count > 0 && (
              <span style={{ background: filter === t.key ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.08)", color: filter === t.key ? "#fff" : "#666", borderRadius: 99, fontSize: 10, padding: "1px 6px" }}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px", color: "#444" }}>Chargement…</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px", color: "#444" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🤝</div>
          <p>Aucun partenaire dans cette catégorie</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.map((partner) => {
            const meta = TYPE_META[partner.type] || { icon: "👤", color: "#888" };
            const hasToken = !!tokens[partner.id];
            const isCopied = copiedId === partner.id;
            const portalUrl = hasToken ? `${typeof window !== "undefined" ? window.location.origin : ""}/partner-portal/${tokens[partner.id]}` : null;

            return (
              <div key={partner.id}>
              <div style={{
                background: "#13131f",
                border: `1px solid ${!partner.isActive ? "rgba(245,158,11,0.2)" : "rgba(255,255,255,0.06)"}`,
                borderRadius: 14, padding: "18px 20px",
                borderBottomLeftRadius: expandedId === partner.id ? 0 : 14,
                borderBottomRightRadius: expandedId === partner.id ? 0 : 14,
              }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 14, flexWrap: "wrap" }}>

                  {/* Avatar / Icon */}
                  {partner.type === "Prestataire" ? (
                    <div style={{ position: "relative", flexShrink: 0 }}>
                      <div style={{ width: 52, height: 52, borderRadius: "50%", overflow: "hidden", background: meta.color + "22", display: "flex", alignItems: "center", justifyContent: "center", border: `2px solid ${meta.color}44` }}>
                        {partner.profileImageUrl
                          ? <img src={partner.profileImageUrl} alt={partner.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          : <span style={{ fontSize: 22 }}>{meta.icon}</span>
                        }
                      </div>
                      <label style={{ position: "absolute", bottom: -2, right: -2, width: 20, height: 20, borderRadius: "50%", background: "#1a1a2e", border: "1px solid #333", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 10 }}
                        title="Changer la photo">
                        {uploadingId === partner.id ? "⏳" : "📷"}
                        <input type="file" accept="image/*" style={{ display: "none" }}
                          onChange={(e) => { if (e.target.files?.[0]) uploadPhoto(partner.id, e.target.files[0]); }} />
                      </label>
                    </div>
                  ) : (
                    <div style={{ width: 44, height: 44, borderRadius: 10, background: meta.color + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
                      {meta.icon}
                    </div>
                  )}

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                      <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 15, color: "#fff" }}>{partner.name}</h3>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: meta.color + "22", color: meta.color }}>
                        {partner.type}
                      </span>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: partner.isActive ? "rgba(16,185,129,0.15)" : "rgba(245,158,11,0.15)", color: partner.isActive ? "#10b981" : "#f59e0b" }}>
                        {partner.isActive ? "● Actif" : "○ En attente"}
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: 14, flexWrap: "wrap", fontSize: 12, color: "#666" }}>
                      <span>📍 {partner.city}{partner.zone ? `, ${partner.zone}` : ""}</span>
                      <span>📞 {partner.contact}</span>
                      {partner.categories?.length > 0 && (
                        <span>🏷️ {partner.categories.map((c: any) => c.name).join(", ")}</span>
                      )}
                    </div>
                    {partner.message && (
                      <p style={{ fontSize: 12, color: "#555", marginTop: 6, lineHeight: 1.5 }}>💬 {partner.message}</p>
                    )}

                    {/* Portal link — pas pour les Prestataires */}
                    {hasToken && partner.isActive && partner.type !== "Prestataire" && (
                      <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <code style={{ fontSize: 11, color: "#3b82f6", background: "rgba(59,130,246,0.1)", padding: "3px 8px", borderRadius: 6, maxWidth: 320, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }}>
                          {portalUrl}
                        </code>
                        <button onClick={() => copyPortalLink(partner.id)} style={{
                          padding: "3px 10px", borderRadius: 6, border: "1px solid rgba(59,130,246,0.3)",
                          background: "transparent", color: isCopied ? "#10b981" : "#3b82f6",
                          fontSize: 11, cursor: "pointer", fontWeight: 600, flexShrink: 0,
                        }}>
                          {isCopied ? "✅ Copié !" : "📋 Copier"}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, flexShrink: 0, alignItems: "flex-end" }}>
                    <button
                      onClick={() => toggleActive(partner.id, partner.isActive)}
                      disabled={acting === partner.id}
                      style={{
                        padding: "8px 18px", borderRadius: 8,
                        background: partner.isActive ? "rgba(239,68,68,0.15)" : "#10b981",
                        color: partner.isActive ? "#ef4444" : "#fff",
                        fontWeight: 700, fontSize: 12, cursor: "pointer",
                        border: partner.isActive ? "1px solid rgba(239,68,68,0.3)" : "none",
                      }}
                    >
                      {acting === partner.id ? "…" : partner.isActive ? "Désactiver" : "✅ Activer"}
                    </button>

                    {/* Géolocalisation & bannière */}
                    <button
                      onClick={() => {
                        if (expandedId === partner.id) { setExpandedId(null); return; }
                        setExpandedId(partner.id);
                        setGeoEdit({ address: partner.address || "", lat: partner.lat, lng: partner.lng, bannerUrl: partner.bannerUrl || "" });
                      }}
                      style={{ padding: "7px 14px", borderRadius: 8, fontSize: 11, border: "1px solid rgba(16,185,129,0.3)", background: "rgba(16,185,129,0.08)", color: "#10b981", cursor: "pointer", fontWeight: 600 }}
                    >
                      📍 Géoloc & bannière
                    </button>

                    {/* Portail uniquement pour Marchand et Restaurant */}
                    {partner.isActive && partner.type !== "Prestataire" && (
                      <button
                        onClick={() => hasToken ? copyPortalLink(partner.id) : generateToken(partner.id)}
                        disabled={acting === partner.id}
                        style={{
                          padding: "7px 14px", borderRadius: 8, fontSize: 11,
                          border: "1px solid rgba(59,130,246,0.3)",
                          background: "rgba(59,130,246,0.08)",
                          color: "#3b82f6", cursor: "pointer", fontWeight: 600,
                        }}
                      >
                        {acting === partner.id ? "…" : hasToken ? (isCopied ? "✅ Copié !" : "🔗 Copier lien portal") : "🔑 Générer lien portal"}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Formulaire géoloc + bannière */}
              {expandedId === partner.id && (
                <div style={{ border: "1px solid #f0ebe8", borderTop: "none", borderRadius: "0 0 14px 14px", padding: "16px 20px", background: "#fafaf8", marginBottom: 0 }}>
                  <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 13, color: "#1a1a1a", marginBottom: 12 }}>
                    📍 Géolocalisation & Bannière
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 600, color: "#6b6b6b", display: "block", marginBottom: 4 }}>Adresse précise (OpenStreetMap)</label>
                      <AddressPicker
                        value={geoEdit.address}
                        onChange={(addr, lat, lng) => setGeoEdit((g) => ({ ...g, address: addr, lat, lng }))}
                      />
                      {geoEdit.lat && <p style={{ fontSize: 11, color: "#10b981", marginTop: 4 }}>📍 {geoEdit.lat.toFixed(5)}, {geoEdit.lng?.toFixed(5)}</p>}
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 600, color: "#6b6b6b", display: "block", marginBottom: 4 }}>Bannière (URL — 1200×300px)</label>
                      <input value={geoEdit.bannerUrl} onChange={(e) => setGeoEdit((g) => ({ ...g, bannerUrl: e.target.value }))}
                        placeholder="https://…"
                        style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #f0ebe8", fontSize: 13, outline: "none" }} />
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => saveGeo(partner.id)} disabled={savingGeo}
                        style={{ padding: "8px 18px", borderRadius: 8, border: "none", background: "#10b981", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                        {savingGeo ? "…" : "💾 Enregistrer"}
                      </button>
                      <button onClick={() => setExpandedId(null)}
                        style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #f0ebe8", background: "#fff", fontSize: 12, cursor: "pointer", color: "#6b6b6b" }}>
                        Annuler
                      </button>
                    </div>
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
