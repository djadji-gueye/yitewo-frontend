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
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [viewPartner, setViewPartner] = useState<any>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const PAGE_SIZE = 10;
  const [geoEdit, setGeoEdit] = useState<{ address: string; lat?: number; lng?: number; bannerUrl: string }>({ address: "", bannerUrl: "" });
  const [savingGeo, setSavingGeo] = useState(false);

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
          address: geoEdit.address || undefined,
          lat: geoEdit.lat,
          lng: geoEdit.lng,
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
    const partner = partners.find((p) => p.id === partnerId);
    const portalBase = partner?.type === "Prestataire" ? "prestataire-portal" : "partner-portal";
    const url = `${window.location.origin}/${portalBase}/${token}`;
    navigator.clipboard?.writeText(url);
    setCopiedId(partnerId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const pendingCount = partners.filter((p) => !p.isActive).length;

  const filtered = partners.filter((p) => {
    const matchStatus = filter === "active" ? p.isActive : filter === "pending" ? !p.isActive : true;
    const matchType = typeFilter === "all" || p.type === typeFilter;
    const q = search.toLowerCase();
    const matchSearch = !q || p.name?.toLowerCase().includes(q) || p.contact?.includes(q) || p.city?.toLowerCase().includes(q);
    return matchStatus && matchType && matchSearch;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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

      {/* Filtres type + recherche */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
        {/* Filtre par type */}
        <div style={{ display: "flex", gap: 4, background: "#13131f", borderRadius: 10, padding: 3, border: "1px solid rgba(255,255,255,0.06)" }}>
          {["all", "Marchand", "Restaurant", "Prestataire", "Livreur", "Ouvrier"].map((t) => {
            const meta = TYPE_META[t] || { icon: "👥", color: "#888" };
            const cnt = t === "all" ? filtered.length : partners.filter((p) => p.type === t).length;
            return (
              <button key={t} onClick={() => { setTypeFilter(t); setPage(1); }} style={{
                padding: "6px 12px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 11,
                background: typeFilter === t ? (t === "all" ? "#E8380D" : meta.color + "33") : "transparent",
                color: typeFilter === t ? (t === "all" ? "#fff" : meta.color) : "#555",
                fontWeight: typeFilter === t ? 700 : 400,
                display: "flex", alignItems: "center", gap: 4,
              }}>
                {t === "all" ? "Tous" : <>{meta.icon} {t}</>}
                {cnt > 0 && <span style={{ background: "rgba(255,255,255,0.1)", borderRadius: 99, fontSize: 9, padding: "1px 5px" }}>{cnt}</span>}
              </button>
            );
          })}
        </div>

        {/* Recherche */}
        <div style={{ position: "relative", flex: 1, minWidth: 200, maxWidth: 340 }}>
          <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#555", fontSize: 13 }}>🔍</span>
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Rechercher par nom, numéro, ville…"
            style={{ width: "100%", padding: "8px 10px 8px 32px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)", background: "#13131f", color: "#fff", fontSize: 12, outline: "none", boxSizing: "border-box" as const }}
          />
          {search && (
            <button onClick={() => setSearch("")} style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#555", fontSize: 13 }}>✕</button>
          )}
        </div>
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
          {paginated.map((partner) => {
            const meta = TYPE_META[partner.type] || { icon: "👤", color: "#888" };
            const hasToken = !!tokens[partner.id];
            const isCopied = copiedId === partner.id;
            const portalBase = partner.type === "Prestataire" ? "prestataire-portal" : "partner-portal";
            const portalUrl = hasToken ? `${typeof window !== "undefined" ? window.location.origin : ""}/${portalBase}/${tokens[partner.id]}` : null;

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
                        {/* Badge sécurité Prestataire */}
                        {partner.type === "Prestataire" && (
                          <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: partner.profileImageUrl ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.15)", color: partner.profileImageUrl ? "#10b981" : "#ef4444" }}>
                            {partner.profileImageUrl ? "✓ Photo vérifiée" : "⚠️ Photo requise"}
                          </span>
                        )}
                      </div>
                      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", fontSize: 12, color: "#666" }}>
                        <span>📍 {partner.city}{partner.zone ? `, ${partner.zone}` : ""}</span>
                        <span>📞 {partner.contact}</span>
                        {partner.categories?.length > 0 && (
                          <span>🏷️ {partner.categories.map((c: any) => c.name).join(", ")}</span>
                        )}
                        {partner.createdAt && (
                          <span title="Date d'inscription">
                            📅 {new Date(partner.createdAt).toLocaleDateString("fr-SN", { day: "2-digit", month: "short", year: "numeric" })}
                          </span>
                        )}
                        {partner.updatedAt && partner.updatedAt !== partner.createdAt && (
                          <span title="Dernière mise à jour" style={{ color: "#10b981" }}>
                            🔄 {new Date(partner.updatedAt).toLocaleDateString("fr-SN", { day: "2-digit", month: "short", year: "numeric" })}
                          </span>
                        )}
                      </div>
                      {partner.message && (
                        <p style={{ fontSize: 12, color: "#555", marginTop: 6, lineHeight: 1.5 }}>💬 {partner.message}</p>
                      )}

                      {/* Portal link — tous types */}
                      {hasToken && partner.isActive && (
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
                        onClick={() => {
                          if (!partner.isActive && partner.type === "Prestataire" && !partner.profileImageUrl) {
                            alert("⚠️ Ce prestataire doit avoir une photo de profil vérifiée avant activation.");
                            return;
                          }
                          toggleActive(partner.id, partner.isActive);
                        }}
                        disabled={acting === partner.id || (!partner.isActive && partner.type === "Prestataire" && !partner.profileImageUrl)}
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

                      {/* Portail — tous types actifs */}
                      {partner.isActive && (
                        <button
                          onClick={() => hasToken ? copyPortalLink(partner.id) : generateToken(partner.id)}
                          disabled={acting === partner.id}
                          style={{
                            padding: "7px 14px", borderRadius: 8, fontSize: 11,
                            border: `1px solid ${partner.type === "Prestataire" ? "rgba(139,92,246,0.3)" : "rgba(59,130,246,0.3)"}`,
                            background: partner.type === "Prestataire" ? "rgba(139,92,246,0.08)" : "rgba(59,130,246,0.08)",
                            color: partner.type === "Prestataire" ? "#8b5cf6" : "#3b82f6",
                            cursor: "pointer", fontWeight: 600,
                          }}
                        >
                          {acting === partner.id ? "…" : hasToken ? (isCopied ? "✅ Copié !" : "🔗 Copier lien portail") : "🔑 Générer lien portail"}
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
                    {/* Sécurité Prestataire */}
                    {partner.type === "Prestataire" && (
                      <div style={{ background: "#fff3f0", border: "1px solid #fdd0c5", borderRadius: 10, padding: "12px 14px", marginBottom: 12 }}>
                        <p style={{ fontSize: 12, fontWeight: 700, color: "#E8380D", marginBottom: 8 }}>🔐 Vérification Prestataire — Obligatoire avant activation</p>
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ width: 52, height: 52, borderRadius: "50%", overflow: "hidden", border: `2px solid ${partner.profileImageUrl ? "#10b981" : "#ef4444"}`, background: "#f0f0f0", flexShrink: 0 }}>
                              {partner.profileImageUrl
                                ? <img src={partner.profileImageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                : <span style={{ fontSize: 20, display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>👤</span>}
                            </div>
                            <div>
                              <p style={{ fontSize: 12, fontWeight: 600, color: partner.profileImageUrl ? "#10b981" : "#ef4444" }}>
                                {partner.profileImageUrl ? "✓ Photo de profil uploadée" : "❌ Photo de profil obligatoire"}
                              </p>
                              <p style={{ fontSize: 11, color: "#888" }}>Photo réelle de la personne (selfie ou prise en temps réel)</p>
                              {!partner.profileImageUrl && (
                                <label style={{ display: "inline-block", marginTop: 4, padding: "4px 10px", borderRadius: 6, background: "#E8380D", color: "#fff", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
                                  📷 Uploader photo ID
                                  <input type="file" accept="image/*" style={{ display: "none" }}
                                    onChange={(e) => { if (e.target.files?.[0]) uploadPhoto(partner.id, e.target.files[0]); }} />
                                </label>
                              )}
                            </div>
                          </div>
                          <div style={{ fontSize: 11, color: "#888", padding: "6px 8px", background: "#fff", borderRadius: 6 }}>
                            📋 <strong>Checklist sécurité :</strong> Photo ID réelle · Photo du lieu de travail ou terrain · Coordonnées vérifiées
                          </div>
                          {!partner.profileImageUrl && (
                            <div style={{ padding: "8px 10px", background: "#fee2e2", borderRadius: 6, fontSize: 11, color: "#991b1b" }}>
                              ⛔ Ce prestataire ne peut pas être activé sans photo de profil vérifiée.
                            </div>
                          )}
                        </div>
                      </div>
                    )}
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: "flex", gap: 6, justifyContent: "center", marginTop: 24, alignItems: "center" }}>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            style={{ padding: "6px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)", background: "transparent", color: page === 1 ? "#333" : "#888", cursor: page === 1 ? "not-allowed" : "pointer", fontSize: 12 }}>
            ←
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button key={p} onClick={() => setPage(p)}
              style={{ width: 32, height: 32, borderRadius: 8, border: "none", background: page === p ? "#E8380D" : "rgba(255,255,255,0.06)", color: page === p ? "#fff" : "#666", cursor: "pointer", fontSize: 12, fontWeight: page === p ? 700 : 400 }}>
              {p}
            </button>
          ))}
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            style={{ padding: "6px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)", background: "transparent", color: page === totalPages ? "#333" : "#888", cursor: page === totalPages ? "not-allowed" : "pointer", fontSize: 12 }}>
            →
          </button>
          <span style={{ fontSize: 11, color: "#555", marginLeft: 8 }}>{filtered.length} partenaire{filtered.length > 1 ? "s" : ""} · Page {page}/{totalPages}</span>
        </div>
      )}
    </div>
  );
}