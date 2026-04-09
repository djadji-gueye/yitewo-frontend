"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import LocationPicker, { LocationValue } from "@/components/LocationPicker";
import { createServiceRequest } from "@/lib/api";

const BASE = process.env.NEXT_PUBLIC_URL_PROD || "http://localhost:3003";

const SERVICES = [
  { name: "Ménage à domicile",   icon: "🧹", desc: "Nettoyage complet ou partiel de votre intérieur",   color: "#0369a1", bg: "#e0f2fe", grad: "linear-gradient(135deg,#0c4a6e,#0ea5e9)", tag: "Populaire" },
  { name: "Plombier",            icon: "🚰", desc: "Fuites, robinetterie, sanitaire, tuyauterie",        color: "#0f766e", bg: "#ccfbf1", grad: "linear-gradient(135deg,#134e4a,#0f9488)", tag: null },
  { name: "Électricien",         icon: "💡", desc: "Câblage, pannes électriques, installation",          color: "#b45309", bg: "#fef3c7", grad: "linear-gradient(135deg,#78350f,#d97706)", tag: null },
  { name: "Climatisation",       icon: "❄️", desc: "Installation, entretien et dépannage clim",          color: "#6d28d9", bg: "#ede9fe", grad: "linear-gradient(135deg,#4c1d95,#7c3aed)", tag: null },
  { name: "Bricoleur",           icon: "🔧", desc: "Petits travaux, montage meuble, réparations",        color: "#065f46", bg: "#d1fae5", grad: "linear-gradient(135deg,#064e3b,#059669)", tag: null },
  { name: "Garde d'enfants",     icon: "👶", desc: "Baby-sitter expérimentée à domicile",                color: "#be185d", bg: "#fce7f3", grad: "linear-gradient(135deg,#831843,#db2777)", tag: null },
  { name: "Jardinage",           icon: "🌿", desc: "Entretien jardin, taille haies, désherbage",         color: "#15803d", bg: "#dcfce7", grad: "linear-gradient(135deg,#14532d,#16a34a)", tag: null },
  { name: "Coiffeur à domicile", icon: "✂️", desc: "Coupe, coiffure, tresses à domicile",               color: "#c2410c", bg: "#ffedd5", grad: "linear-gradient(135deg,#7c2d12,#ea580c)", tag: "Nouveau" },
  { name: "Déménagement",        icon: "📦", desc: "Transport, emballage et installation",               color: "#1d4ed8", bg: "#dbeafe", grad: "linear-gradient(135deg,#1e3a8a,#2563eb)", tag: null },
  { name: "Cours particuliers",  icon: "📚", desc: "Soutien scolaire, langues, mathématiques",           color: "#7e22ce", bg: "#f3e8ff", grad: "linear-gradient(135deg,#581c87,#9333ea)", tag: null },
  { name: "Informatique",        icon: "💻", desc: "Dépannage PC, installation, réseau Wi-Fi",           color: "#0e7490", bg: "#cffafe", grad: "linear-gradient(135deg,#164e63,#0891b2)", tag: null },
  { name: "Urgence dépannage",   icon: "🚨", desc: "Intervention rapide toutes urgences 24h/7j",         color: "#991b1b", bg: "#fee2e2", grad: "linear-gradient(135deg,#7f1d1d,#dc2626)", tag: "Urgent" },
];

interface Provider {
  id: string; name: string; city: string; zone?: string;
  contact: string; serviceCategories?: string[];
  message?: string; profileImageUrl?: string;
}

const parseMessage = (msg?: string) => ({
  experience:    msg?.match(/Exp[ée]rience\s*:\s*([^|]+)/i)?.[1]?.trim(),
  disponibilite: msg?.match(/Disponibilit[ée]\s*:\s*([^|]+)/i)?.[1]?.trim(),
  bio:           msg?.match(/[Àa]\s*propos\s*:\s*(.+?)(?:\s*\|.*)?$/i)?.[1]?.trim(),
});

function StarStatic({ n }: { n: number }) {
  return <span style={{ color: "#f59e0b", fontSize: 12 }}>{"★".repeat(n)}{"☆".repeat(5-n)}</span>;
}

export default function ServicesPage() {
  const [tab, setTab]                 = useState<"services" | "providers">("services");
  const [step, setStep]               = useState<"list"|"form"|"loading"|"success"|"error">("list");
  const [service, setService]         = useState<typeof SERVICES[0] | null>(null);
  const [drawerOpen, setDrawerOpen]   = useState(false);
  const [location, setLocation]       = useState<LocationValue>({ city: "Dakar", quarter: "", deliveryFee: 0 });
  const [description, setDescription] = useState("");
  const [name, setName]               = useState("");
  const [phone, setPhone]             = useState("");
  const [providers, setProviders]     = useState<Provider[]>([]);
  const [providersLoading, setProvidersLoading] = useState(false);
  const [filterCat, setFilterCat]     = useState<string | null>(null);
  const [search, setSearch]           = useState("");

  useEffect(() => {
    if (tab === "providers") {
      setProvidersLoading(true);
      fetch(`${BASE}/partners/public/active`)
        .then((r) => r.json())
        .then(setProviders)
        .catch(() => setProviders([]))
        .finally(() => setProvidersLoading(false));
    }
  }, [tab]);

  const openForm = (s: typeof SERVICES[0]) => { setService(s); setDrawerOpen(true); setStep("form"); };
  const closeDrawer = () => { setDrawerOpen(false); setTimeout(() => { if (step !== "success") setStep("list"); }, 300); };

  const handleSend = async () => {
    if (!service || !location.quarter) return;
    setStep("loading");
    try {
      await createServiceRequest({ service: service.name, city: location.city, quarter: location.quarter, description: description || undefined, customerName: name || undefined, customerPhone: phone || undefined });
      setStep("success");
    } catch { setStep("error"); }
  };

  const resetForm = () => { setService(null); setDescription(""); setName(""); setPhone(""); setLocation({ city: "Dakar", quarter: "", deliveryFee: 0 }); setStep("list"); setDrawerOpen(false); };

  const cats = [...new Set(providers.flatMap((p) => p.serviceCategories || []))];
  const filteredProviders = providers
    .filter((p) => !filterCat || p.serviceCategories?.includes(filterCat))
    .filter((p) => !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.zone?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ background: "var(--surface)", minHeight: "100vh", fontFamily: "DM Sans, sans-serif" }}>

      {/* HERO */}
      <div style={{ background: "linear-gradient(135deg, #0d3320 0%, #1A9E5F 100%)", padding: "44px 20px 0", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -60, right: -60, width: 260, height: 260, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
        <div style={{ maxWidth: 900, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.12)", borderRadius: 99, padding: "5px 14px", marginBottom: 16 }}>
            <span>⚡</span>
            <span style={{ color: "#d1fae5", fontSize: 12, fontWeight: 500 }}>Professionnels vérifiés · Intervention rapide</span>
          </div>
          <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "clamp(26px,5vw,40px)", color: "#fff", marginBottom: 10, lineHeight: 1.2 }}>
            Services à domicile
          </h1>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 15, lineHeight: 1.6, maxWidth: 520, marginBottom: 32 }}>
            Des professionnels qualifiés disponibles rapidement chez vous partout au Sénégal.
          </p>
          {/* Tabs */}
          <div style={{ display: "flex", gap: 4 }}>
            {[{ key: "services", label: "🔍 Trouver un service" }, { key: "providers", label: `👷 Nos prestataires${providers.length > 0 ? ` (${providers.length})` : ""}` }].map((t) => (
              <button key={t.key} onClick={() => setTab(t.key as any)} style={{ padding: "12px 22px", borderRadius: "10px 10px 0 0", border: "none", cursor: "pointer", fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 13, transition: "all 0.2s", background: tab === t.key ? "#fff" : "rgba(255,255,255,0.12)", color: tab === t.key ? "var(--text)" : "rgba(255,255,255,0.75)" }}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 16px 80px" }}>

        {/* ── SERVICES TAB ── */}
        {tab === "services" && (
          <>
            {/* Stats bar */}
            <div style={{ display: "flex", gap: 20, marginBottom: 28, flexWrap: "wrap" }}>
              {[
                { icon: "⚡", label: "Intervention en moins de 2h", color: "#0369a1" },
                { icon: "✅", label: "Prestataires vérifiés", color: "#065f46" },
                { icon: "📞", label: "Suivi en temps réel", color: "#6d28d9" },
              ].map((s) => (
                <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--muted)" }}>
                  <span style={{ fontSize: 16 }}>{s.icon}</span>
                  <span style={{ fontWeight: 500 }}>{s.label}</span>
                </div>
              ))}
            </div>

            <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 18, color: "var(--text)", marginBottom: 20 }}>
              Quel service vous faut-il ?
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14 }}>
              {SERVICES.map((s) => (
                <button key={s.name} onClick={() => openForm(s)} className="product-card" style={{ background: "#fff", borderRadius: 18, border: "1px solid var(--border)", overflow: "hidden", cursor: "pointer", textAlign: "left", padding: 0, display: "flex", flexDirection: "column" }}>
                  <div style={{ height: 86, background: s.grad, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", position: "relative", overflow: "hidden" }}>
                    <div style={{ position: "absolute", top: -30, right: -30, width: 100, height: 100, borderRadius: "50%", background: "rgba(255,255,255,0.1)" }} />
                    <span style={{ fontSize: 36 }}>{s.icon}</span>
                    {s.tag && <span style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase" as const, padding: "4px 10px", borderRadius: 99, background: "rgba(255,255,255,0.2)", color: "#fff" }}>{s.tag}</span>}
                  </div>
                  <div style={{ padding: "14px 16px 16px" }}>
                    <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 14, color: "var(--text)", marginBottom: 4 }}>{s.name}</p>
                    <p style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.5, marginBottom: 12 }}>{s.desc}</p>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 99, background: s.bg, color: s.color, fontSize: 11, fontWeight: 700 }}>Demander →</div>
                  </div>
                </button>
              ))}
            </div>

            {/* CTA Prestataire */}
            <div style={{ marginTop: 48, background: "linear-gradient(135deg, #0d3320, #1A9E5F)", borderRadius: 20, padding: "28px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
              <div>
                <p style={{ fontFamily: "Syne", fontWeight: 800, fontSize: 18, color: "#fff", marginBottom: 6 }}>Vous êtes prestataire de services ?</p>
                <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 13, lineHeight: 1.6 }}>Rejoignez notre réseau et recevez des missions près de chez vous.</p>
              </div>
              <Link href="/partners" style={{ padding: "12px 24px", borderRadius: 10, background: "#fff", color: "#0d3320", fontFamily: "Syne", fontWeight: 700, fontSize: 13, textDecoration: "none", whiteSpace: "nowrap" as const, flexShrink: 0 }}>
                Devenir prestataire →
              </Link>
            </div>
          </>
        )}

        {/* ── PROVIDERS TAB ── */}
        {tab === "providers" && (
          <>
            {/* Search + filters */}
            <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
              <input value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="🔍 Rechercher un prestataire…"
                style={{ flex: "1 1 200px", padding: "10px 14px", borderRadius: 10, border: "1px solid var(--border)", fontSize: 13, outline: "none", background: "#fff" }} />
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flex: "100%", gap: 8, flexWrap: "wrap" }}>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  <button onClick={() => setFilterCat(null)} style={pillStyle(!filterCat)}>Tous</button>
                  {cats.map((c) => <button key={c} onClick={() => setFilterCat(c)} style={pillStyle(filterCat === c)}>{c}</button>)}
                </div>
                {providers.length > 0 && <span style={{ fontSize: 12, color: "var(--muted)" }}>{filteredProviders.length} prestataire{filteredProviders.length > 1 ? "s" : ""}</span>}
              </div>
            </div>

            {providersLoading ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
                {[...Array(4)].map((_, i) => (
                  <div key={i} style={{ background: "#fff", borderRadius: 20, border: "1px solid var(--border)", overflow: "hidden", animation: "pulse 1.5s ease-in-out infinite", animationDelay: `${i*0.12}s` }}>
                    <div style={{ height: 88, background: "#f0f0f0" }} />
                    <div style={{ padding: "40px 18px 18px" }}>
                      <div style={{ width: "60%", height: 16, borderRadius: 6, background: "#f0f0f0", marginBottom: 8 }} />
                      <div style={{ width: "40%", height: 13, borderRadius: 6, background: "#f5f5f5", marginBottom: 16 }} />
                      <div style={{ width: "100%", height: 36, borderRadius: 10, background: "#f0f0f0" }} />
                    </div>
                  </div>
                ))}
                <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}`}</style>
              </div>
            ) : filteredProviders.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 20px", background: "#fff", borderRadius: 20, border: "1px solid var(--border)" }}>
                <div style={{ fontSize: 52, marginBottom: 14 }}>👷</div>
                <p style={{ fontFamily: "Syne", fontWeight: 700, fontSize: 18, color: "var(--text)", marginBottom: 8 }}>
                  {search ? "Aucun résultat" : "Aucun prestataire pour l'instant"}
                </p>
                <p style={{ color: "var(--muted)", fontSize: 13, lineHeight: 1.7, maxWidth: 340, margin: "0 auto 24px" }}>
                  {search ? "Essayez un autre nom ou service." : "Nos prestataires seront bientôt visibles ici."}
                </p>
                <Link href="/partners" style={{ padding: "11px 22px", borderRadius: 10, background: "var(--green)", color: "#fff", fontFamily: "Syne", fontWeight: 700, fontSize: 13, textDecoration: "none" }}>
                  Devenir prestataire
                </Link>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
                {filteredProviders.map((p) => {
                  const parsed = parseMessage(p.message);
                  return <ProviderCard key={p.id} provider={p} {...parsed} />;
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* DRAWER */}
      <div onClick={closeDrawer} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 40, opacity: drawerOpen ? 1 : 0, pointerEvents: drawerOpen ? "auto" : "none", transition: "opacity 0.3s", backdropFilter: "blur(2px)" }} />
      <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: "min(480px,100vw)", background: "#fff", zIndex: 50, transform: drawerOpen ? "translateX(0)" : "translateX(100%)", transition: "transform 0.35s cubic-bezier(0.4,0,0.2,1)", display: "flex", flexDirection: "column", boxShadow: "-8px 0 40px rgba(0,0,0,0.15)" }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 14, flexShrink: 0 }}>
          <button onClick={closeDrawer} style={{ width: 36, height: 36, borderRadius: 99, background: "var(--surface)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 16, color: "var(--muted)", flexShrink: 0 }}>←</button>
          {service && (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: service.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{service.icon}</div>
              <div>
                <p style={{ fontFamily: "Syne", fontWeight: 700, fontSize: 15, color: "var(--text)" }}>{service.name}</p>
                <p style={{ fontSize: 11, color: "var(--muted)" }}>Remplissez le formulaire ci-dessous</p>
              </div>
            </div>
          )}
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
          {step === "success" ? (
            <div style={{ textAlign: "center", padding: "40px 20px" }}>
              <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
              <h2 style={{ fontFamily: "Syne", fontWeight: 800, fontSize: 22, marginBottom: 10 }}>Demande envoyée !</h2>
              <p style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.7, marginBottom: 28 }}>
                Votre demande de <strong>{service?.name}</strong> à <strong>{location.quarter}, {location.city}</strong> a bien été reçue. Un professionnel vous contactera rapidement.
              </p>
              <button onClick={resetForm} style={{ padding: "12px 32px", borderRadius: 99, border: "none", background: "var(--green)", color: "#fff", fontFamily: "Syne", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
                Faire une autre demande
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div>
                <p style={sTitle}>📍 Votre localisation *</p>
                <LocationPicker value={location} onChange={setLocation} showFee={false} />
              </div>
              <div>
                <p style={sTitle}>👤 Vos coordonnées</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Votre prénom" style={inp} />
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Téléphone / WhatsApp" type="tel" style={inp} />
                </div>
              </div>
              <div>
                <p style={sTitle}>📝 Décrivez votre besoin</p>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Précisez le problème, l'urgence, l'accès…" style={{ ...inp, height: 100, resize: "vertical", width: "100%", boxSizing: "border-box" as const }} />
              </div>
              {step === "error" && <div style={{ background: "#fee2e2", borderRadius: 10, padding: "12px 14px", fontSize: 13, color: "#991b1b" }}>❌ Une erreur est survenue. Veuillez réessayer.</div>}
            </div>
          )}
        </div>
        {step !== "success" && (
          <div style={{ padding: "16px 24px", borderTop: "1px solid var(--border)", flexShrink: 0, background: "#fff" }}>
            {!location.quarter && <p style={{ fontSize: 12, color: "var(--muted)", textAlign: "center", marginBottom: 10 }}>📍 Sélectionnez votre zone pour continuer</p>}
            <button onClick={handleSend} disabled={!location.quarter || step === "loading"} style={{ width: "100%", padding: "15px", borderRadius: 12, border: "none", background: location.quarter ? "var(--green)" : "#ccc", color: "#fff", fontFamily: "Syne", fontWeight: 700, fontSize: 15, cursor: location.quarter ? "pointer" : "not-allowed" }}>
              {step === "loading" ? "Envoi en cours…" : "Envoyer la demande ✓"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function ProviderCard({ provider, bio, experience, disponibilite }: { provider: Provider; bio?: string; experience?: string; disponibilite?: string }) {
  const initials = provider.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  const hue  = [...provider.name].reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;
  const hue2 = (hue + 70) % 360;

  return (
    <div className="product-card" style={{ background: "#fff", borderRadius: 20, border: "1px solid var(--border)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
      {/* Cover */}
      <div style={{ height: 88, background: `linear-gradient(135deg,hsl(${hue},55%,18%) 0%,hsl(${hue2},65%,38%) 100%)`, position: "relative", flexShrink: 0 }}>
        <div style={{ position: "absolute", top: -30, right: -30, width: 110, height: 110, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
        <span style={{ position: "absolute", top: 12, right: 12, fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 99, background: "rgba(255,255,255,0.18)", color: "#fff", backdropFilter: "blur(4px)" }}>✓ Vérifié</span>
      </div>

      {/* Avatar */}
      <div style={{ width: 68, height: 68, borderRadius: "50%", border: "3px solid #fff", overflow: "hidden", marginTop: -34, marginLeft: 18, position: "relative", zIndex: 1, boxShadow: "0 4px 16px rgba(0,0,0,0.18)", background: "#f0f0f0", flexShrink: 0 }}>
        <img
          src={provider.profileImageUrl || `https://api.dicebear.com/7.x/personas/svg?seed=${encodeURIComponent(provider.name)}&backgroundColor=b6e3f4,c0aede&size=120`}
          alt={provider.name} width={68} height={68}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          onError={(e) => {
            const el = e.currentTarget as HTMLImageElement;
            el.style.display = "none";
            const p = el.parentElement as HTMLElement;
            p.style.background = `linear-gradient(135deg,hsl(${hue},50%,30%),hsl(${hue2},60%,45%))`;
            p.innerHTML = `<span style="font-family:Syne,sans-serif;font-weight:800;font-size:20px;color:#fff;display:flex;align-items:center;justify-content:center;width:100%;height:100%">${initials}</span>`;
          }}
        />
      </div>

      {/* Info */}
      <div style={{ padding: "10px 18px 18px", flex: 1, display: "flex", flexDirection: "column" }}>
        <p style={{ fontFamily: "Syne", fontWeight: 800, fontSize: 15, color: "var(--text)", marginBottom: 2 }}>{provider.name}</p>
        <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 8 }}>📍 {provider.zone ? `${provider.zone}, ` : ""}{provider.city}</p>

        {experience && (
          <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 99, background: "#ede9fe", color: "#6d28d9", display: "inline-flex", alignItems: "center", gap: 4, marginBottom: 8, width: "fit-content" }}>
            🎓 {experience} d&apos;expérience
          </span>
        )}

        {bio && <p style={{ fontSize: 12, color: "#555", lineHeight: 1.6, marginBottom: 8, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{bio}</p>}

        {disponibilite && (
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 8 }}>
            {disponibilite.split(",").map((d) => d.trim()).filter(Boolean).map((d) => (
              <span key={d} style={{ fontSize: 10, fontWeight: 600, padding: "3px 9px", borderRadius: 99, background: "#fef3c7", color: "#b45309" }}>🕐 {d}</span>
            ))}
          </div>
        )}

        {provider.serviceCategories && provider.serviceCategories.length > 0 && (
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 16, flex: 1 }}>
            {provider.serviceCategories.slice(0, 3).map((c) => (
              <span key={c} style={{ fontSize: 10, fontWeight: 600, padding: "3px 9px", borderRadius: 99, background: "#d1fae5", color: "#065f46" }}>{c}</span>
            ))}
            {provider.serviceCategories.length > 3 && <span style={{ fontSize: 10, color: "var(--muted)", padding: "3px 0" }}>+{provider.serviceCategories.length - 3}</span>}
          </div>
        )}

        <a href={`https://wa.me/${provider.contact.replace(/[\s+]/g, "")}`} target="_blank" rel="noreferrer"
          style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "10px 16px", borderRadius: 11, background: "#25D366", color: "#fff", fontFamily: "Syne", fontWeight: 700, fontSize: 12, textDecoration: "none", marginTop: "auto" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          Contacter
        </a>
      </div>
    </div>
  );
}

function pillStyle(active: boolean): React.CSSProperties {
  return { padding: "6px 14px", borderRadius: 99, fontSize: 12, cursor: "pointer", border: `2px solid ${active ? "var(--green)" : "var(--border)"}`, background: active ? "var(--green-light)" : "#fff", color: active ? "var(--green)" : "var(--muted)", fontWeight: active ? 700 : 400 };
}
const sTitle: React.CSSProperties = { fontFamily: "Syne, sans-serif", fontWeight: 600, fontSize: 13, color: "var(--muted)", marginBottom: 10 };
const inp: React.CSSProperties = { width: "100%", padding: "12px 14px", borderRadius: 10, border: "1px solid var(--border)", fontSize: 14, outline: "none", fontFamily: "DM Sans, sans-serif", background: "var(--surface)", boxSizing: "border-box" as const };
