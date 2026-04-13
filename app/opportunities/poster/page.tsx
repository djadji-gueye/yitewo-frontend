"use client";

import { useState } from "react";
import Link from "next/link";
import { submitOpportunity } from "@/lib/api";

const CATS = [
  { value: "IMMOBILIER", label: "Immobilier", icon: "🏠", desc: "Terrain, maison, location…" },
  { value: "EMPLOI", label: "Emploi", icon: "💼", desc: "Recrutement, mission, CDD…" },
  { value: "SERVICE", label: "Service", icon: "🔧", desc: "Prestation, artisan, pro…" },
  { value: "COMMERCE", label: "Commerce", icon: "🛒", desc: "Vente, boutique, produit…" },
  { value: "FORMATION", label: "Formation", icon: "📚", desc: "Cours, atelier, coaching…" },
];

const MAX_PHOTOS = 5;
type Status = "form" | "loading" | "success" | "error";

export default function PosterPage() {
  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [contact, setContact] = useState("");
  const [status, setStatus] = useState<Status>("form");
  const [errorMsg, setErrorMsg] = useState("");

  // ── Multi-photos ──────────────────────────────────────────
  const [imageUrls, setImageUrls] = useState<string[]>([""]);
  const [imageErrors, setImageErrors] = useState<boolean[]>([false]);
  const [activePhoto, setActivePhoto] = useState(0);

  const addPhotoField = () => {
    if (imageUrls.length >= MAX_PHOTOS) return;
    setImageUrls([...imageUrls, ""]);
    setImageErrors([...imageErrors, false]);
  };

  const removePhoto = (i: number) => {
    const urls = imageUrls.filter((_, idx) => idx !== i);
    const errs = imageErrors.filter((_, idx) => idx !== i);
    setImageUrls(urls.length ? urls : [""]);
    setImageErrors(errs.length ? errs : [false]);
    setActivePhoto(Math.min(activePhoto, Math.max(0, urls.length - 1)));
  };

  const updateUrl = (i: number, val: string) => {
    const urls = [...imageUrls]; urls[i] = val;
    const errs = [...imageErrors]; errs[i] = false;
    setImageUrls(urls);
    setImageErrors(errs);
  };

  const markError = (i: number) => {
    const errs = [...imageErrors]; errs[i] = true;
    setImageErrors(errs);
  };

  const validUrls = imageUrls.filter((u, i) => u.trim() && !imageErrors[i]);

  const canSend = !!(category && title.trim() && location.trim() && description.trim() && contact.trim());

  const handleSend = async () => {
    if (!canSend) return;
    setStatus("loading");
    try {
      await submitOpportunity({
        title: title.trim(),
        category,
        location: location.trim(),
        description: description.trim(),
        price: price.trim() || undefined,
        contact: contact.trim(),
        imageUrl: validUrls[0] || undefined,
        imageUrls: validUrls.length > 0 ? validUrls : undefined,
      });
      setStatus("success");
    } catch (e: any) {
      setErrorMsg(e?.message || "Une erreur est survenue. Réessayez.");
      setStatus("error");
    }
  };

  // ── Success ───────────────────────────────────────────────
  if (status === "success") {
    return (
      <div style={{ background: "var(--surface)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        <div style={{ background: "#fff", borderRadius: 24, padding: "48px 36px", textAlign: "center", maxWidth: 480, width: "100%", border: "1px solid var(--border)" }}>
          <div style={{ width: 80, height: 80, borderRadius: "50%", background: "linear-gradient(135deg, #d1fae5, #a7f3d0)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, margin: "0 auto 24px" }}>✅</div>
          <h2 style={{ fontFamily: "Syne", fontWeight: 800, fontSize: 24, marginBottom: 12 }}>Annonce soumise !</h2>
          <p style={{ color: "var(--muted)", fontSize: 13, lineHeight: 1.6, marginBottom: 28 }}>
            Vous avez fourni <strong>{contact}</strong> comme contact — notre équipe vous contactera sous 24h.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/opportunities" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "var(--brand)", color: "#fff", padding: "12px 24px", borderRadius: 99, textDecoration: "none", fontWeight: 700, fontSize: 14 }}>
              Voir les annonces
            </Link>
            <button onClick={() => { setStatus("form"); setTitle(""); setCategory(""); setLocation(""); setPrice(""); setDescription(""); setContact(""); setImageUrls([""]); setImageErrors([false]); setActivePhoto(0); }}
              style={{ background: "none", border: "2px solid var(--border)", padding: "12px 24px", borderRadius: 99, fontWeight: 600, fontSize: 14, cursor: "pointer", color: "var(--muted)" }}>
              Nouvelle annonce
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "var(--surface)", minHeight: "100vh" }}>

      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #0a0a1a 0%, #1a1a3e 60%, #2d2d8f 100%)", padding: "40px 20px 48px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -50, right: -50, width: 220, height: 220, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
        <div style={{ maxWidth: 700, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <Link href="/opportunities" style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.12)", borderRadius: 99, padding: "6px 14px", marginBottom: 18, textDecoration: "none", color: "rgba(255,255,255,0.8)", fontSize: 13 }}>
            ← Retour aux annonces
          </Link>
          <h1 style={{ fontFamily: "Syne", fontWeight: 800, fontSize: "clamp(24px, 4vw, 36px)", color: "#fff", marginBottom: 8 }}>Publier une annonce</h1>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 14 }}>Votre annonce sera publiée après validation par notre équipe.</p>
            <span style={{ background: "rgba(255,200,50,0.2)", border: "1px solid rgba(255,200,50,0.3)", color: "#fcd34d", fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 99 }}>⏱ Validation sous 24h</span>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "32px 20px 80px" }}>

        {/* Steps */}
        <div style={{ display: "flex", marginBottom: 24, background: "#fff", borderRadius: 12, border: "1px solid var(--border)", overflow: "hidden" }}>
          {[{ n: "1", label: "Catégorie", done: !!category }, { n: "2", label: "Détails", done: !!(title && location) }, { n: "3", label: "Contact", done: !!contact }].map((s, i, arr) => (
            <div key={s.n} style={{ flex: 1, padding: "10px 4px", textAlign: "center", borderRight: i < arr.length - 1 ? "1px solid var(--border)" : "none", background: s.done ? "var(--green-light)" : "#fff" }}>
              <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 22, height: 22, borderRadius: "50%", background: s.done ? "var(--green)" : "var(--border)", color: s.done ? "#fff" : "var(--muted)", fontSize: 11, fontWeight: 700, marginBottom: 3 }}>{s.done ? "✓" : s.n}</span>
              <p style={{ fontSize: 11, color: s.done ? "var(--green)" : "var(--muted)", fontWeight: s.done ? 600 : 400 }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Catégorie */}
        <div style={card}>
          <p style={sectionTitle}>1. Catégorie *</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: 10 }}>
            {CATS.map((cat) => {
              const active = category === cat.value;
              return (
                <button key={cat.value} onClick={() => setCategory(cat.value)} style={{ padding: "14px 8px", borderRadius: 12, textAlign: "center", border: "2px solid " + (active ? "var(--brand)" : "var(--border)"), background: active ? "var(--brand-light)" : "#fff", cursor: "pointer", transition: "all 0.18s" }}>
                  <div style={{ fontSize: 26, marginBottom: 4 }}>{cat.icon}</div>
                  <p style={{ fontSize: 12, fontWeight: active ? 700 : 500, color: active ? "var(--brand)" : "var(--text)", marginBottom: 2 }}>{cat.label}</p>
                  <p style={{ fontSize: 10, color: "var(--muted)", lineHeight: 1.3 }}>{cat.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Détails */}
        <div style={card}>
          <p style={sectionTitle}>2. Détails de l'annonce</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            <Field label="Titre *" hint="Soyez précis et accrocheur">
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex : Terrain à vendre – Hydrobase 500m²" style={inputStyle} maxLength={100} />
              <p style={{ fontSize: 11, color: "var(--muted)", textAlign: "right", marginTop: 4 }}>{title.length}/100</p>
            </Field>

            <Field label="Localisation *" hint="Quartier, ville">
              <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Ex : Saint-Louis, Sor Daga" style={inputStyle} />
            </Field>

            <Field label="Prix / Budget" hint="Laissez vide si non applicable">
              <input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Ex : 5 000 000 FCFA  ou  Prix à négocier" style={inputStyle} />
            </Field>

            <Field label="Description *" hint="Minimum 30 caractères recommandés">
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Décrivez votre annonce en détail…" style={{ ...inputStyle, height: 130, resize: "vertical" }} />
              <p style={{ fontSize: 11, color: description.length < 30 ? "var(--brand)" : "var(--green)", textAlign: "right", marginTop: 4 }}>
                {description.length} caractères{description.length < 30 ? " (minimum 30 recommandé)" : " ✓"}
              </p>
            </Field>

            {/* ── Galerie photos ──────────────────────────── */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: "var(--muted)" }}>
                  Photos <span style={{ fontWeight: 400, fontSize: 11 }}>({imageUrls.filter(u => u.trim()).length}/{MAX_PHOTOS})</span>
                </label>
                <span style={{ fontSize: 11, color: "var(--muted)" }}>Optionnel · jusqu'à {MAX_PHOTOS}</span>
              </div>

              {/* Aperçu galerie */}
              {validUrls.length > 0 && (
                <div style={{ marginBottom: 12 }}>
                  {/* Cover */}
                  <div style={{ borderRadius: 12, overflow: "hidden", background: "#f7f4f2", position: "relative", marginBottom: 8, aspectRatio: "16/9", maxHeight: 280 }}>
                    <img
                      src={validUrls[activePhoto] ?? validUrls[0]}
                      alt="Aperçu"
                      style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
                    />
                    <div style={{ position: "absolute", top: 8, left: 8, background: "rgba(0,0,0,0.55)", borderRadius: 99, padding: "3px 10px", fontSize: 11, color: "#fff", fontWeight: 600 }}>
                      {activePhoto === 0 ? "🖼 Photo principale" : `Photo ${activePhoto + 1}`}
                    </div>
                  </div>
                  {/* Miniatures swipeable */}
                  {validUrls.length > 1 && (
                    <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4, scrollbarWidth: "none" }}>
                      {validUrls.map((url, i) => (
                        <button key={i} onClick={() => setActivePhoto(i)}
                          style={{ width: 60, height: 60, borderRadius: 8, overflow: "hidden", flexShrink: 0, border: `2px solid ${activePhoto === i ? "var(--brand)" : "transparent"}`, padding: 0, cursor: "pointer", background: "#f0f0f0", transition: "border 0.15s" }}>
                          <img src={url} alt={`Miniature ${i + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Champs URL */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {imageUrls.map((url, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <div style={{ flex: 1, position: "relative" }}>
                      <input
                        value={url}
                        onChange={(e) => updateUrl(i, e.target.value)}
                        placeholder={i === 0 ? "Photo principale (https://…)" : `Photo ${i + 1} (https://…)`}
                        style={{ ...inputStyle, paddingRight: url.trim() && !imageErrors[i] ? 36 : 14 }}
                      />
                      {/* Vérif silencieuse */}
                      {url.trim() && !imageErrors[i] && (
                        <img src={url} alt="" style={{ display: "none" }} onError={() => markError(i)} />
                      )}
                      {url.trim() && !imageErrors[i] && (
                        <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: "var(--green)", fontSize: 14, pointerEvents: "none" }}>✓</span>
                      )}
                      {url.trim() && imageErrors[i] && (
                        <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: "#ef4444", fontSize: 14, pointerEvents: "none" }}>✕</span>
                      )}
                    </div>
                    {imageUrls.length > 1 && (
                      <button onClick={() => removePhoto(i)}
                        style={{ width: 34, height: 34, borderRadius: 8, border: "1px solid #fecaca", background: "#fee2e2", color: "#ef4444", cursor: "pointer", fontSize: 14, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Bouton ajouter */}
              {imageUrls.length < MAX_PHOTOS && (
                <button onClick={addPhotoField}
                  style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 6, padding: "9px 14px", borderRadius: 8, border: "1.5px dashed var(--border)", background: "#fff", color: "var(--muted)", fontSize: 12, fontWeight: 600, cursor: "pointer", width: "100%", justifyContent: "center", transition: "border-color 0.15s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--brand)")}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
                >
                  + Ajouter une photo ({imageUrls.length}/{MAX_PHOTOS})
                </button>
              )}

              <div style={{ marginTop: 10, padding: "10px 12px", background: "var(--surface)", borderRadius: 8, fontSize: 11, color: "var(--muted)", lineHeight: 1.7 }}>
                <strong style={{ color: "var(--text)" }}>💡 Obtenir un lien photo :</strong><br />
                • <strong>Imgur.com</strong> : glissez votre photo → clic droit → "Copier l'adresse de l'image"<br />
                • <strong>Google Photos</strong> : ouvrir la photo → ⋮ → Partager → Créer un lien<br />
                <span style={{ color: "#ef4444" }}>⚠️ Liens WhatsApp (blob:https://…) non supportés</span>
              </div>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div style={card}>
          <p style={sectionTitle}>3. Votre contact *</p>
          <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 12, lineHeight: 1.5 }}>Ce numéro sera communiqué aux personnes intéressées par votre annonce.</p>
          <input value={contact} onChange={(e) => setContact(e.target.value)} placeholder="Ex : 221 77 000 00 00" type="tel" style={inputStyle} />
        </div>

        {status === "error" && (
          <div style={{ background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: 12, padding: "12px 16px", marginBottom: 16, fontSize: 13, color: "#991b1b" }}>
            ❌ {errorMsg}
          </div>
        )}

        <button onClick={handleSend} disabled={!canSend || status === "loading"}
          style={{ width: "100%", padding: "16px", borderRadius: 14, border: "none", background: canSend ? "var(--brand)" : "#ccc", color: "#fff", fontFamily: "Syne", fontWeight: 700, fontSize: 15, cursor: canSend ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, transition: "background 0.2s" }}>
          {status === "loading" ? (
            <><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: "spin 1s linear infinite" }}><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" /></svg>Envoi en cours…</>
          ) : (
            <><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>Soumettre pour validation</>
          )}
        </button>
        <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>

        {!canSend && (
          <p style={{ textAlign: "center", color: "var(--muted)", fontSize: 12, marginTop: 10 }}>
            {!category ? "👆 Choisissez une catégorie" : !title ? "✍️ Ajoutez un titre" : !location ? "📍 Indiquez la localisation" : !description ? "📝 Rédigez une description" : !contact ? "📞 Ajoutez votre contact" : ""}
          </p>
        )}
      </div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
        <label style={{ fontSize: 13, fontWeight: 600, color: "var(--muted)" }}>{label}</label>
        {hint && <span style={{ fontSize: 11, color: "var(--muted)" }}>{hint}</span>}
      </div>
      {children}
    </div>
  );
}

const card: React.CSSProperties = { background: "#fff", borderRadius: 16, border: "1px solid var(--border)", padding: "20px 24px", marginBottom: 16 };
const sectionTitle: React.CSSProperties = { fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 15, marginBottom: 16, color: "var(--text)" };
const inputStyle: React.CSSProperties = { width: "100%", padding: "11px 14px", borderRadius: 10, border: "1px solid var(--border)", fontSize: 14, outline: "none", fontFamily: "DM Sans, sans-serif", background: "#fff", boxSizing: "border-box" as const };
