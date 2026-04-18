"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import CloudinaryUploader from "@/components/CloudinaryUploader";

const BASE = process.env.NEXT_PUBLIC_URL_PROD || "http://localhost:3003";

const CATEGORIES_BY_TYPE: Record<string, { id: string; label: string; icon: string }[]> = {
  Restaurant: [
    { id: "plat", label: "Plats", icon: "🍽️" },
    { id: "entree", label: "Entrées", icon: "🥗" },
    { id: "boisson", label: "Boissons", icon: "🥤" },
    { id: "dessert", label: "Desserts", icon: "🍰" },
    { id: "snack", label: "Snacks", icon: "🥪" },
    { id: "special", label: "Spéciaux", icon: "⭐" },
  ],

  Marchand: [
    // Mode & Beauté
    { id: "cosmetique", label: "Cosmétique & Beauté", icon: "💄" },
    { id: "mode", label: "Mode & Vêtements", icon: "👗" },
    { id: "bijoux", label: "Bijouterie & Accessoires", icon: "💍" },
    // Alimentation
    { id: "viande", label: "Viandes & Poissons", icon: "🥩" },
    { id: "legumes", label: "Légumes & Fruits", icon: "🥦" },
    { id: "epicerie", label: "Épicerie sèche", icon: "🌾" },
    { id: "boisson", label: "Boissons", icon: "🥤" },
    { id: "laitier", label: "Produits laitiers", icon: "🥛" },
    { id: "boulangerie", label: "Boulangerie & Pâtisserie", icon: "🥖" },
    { id: "alimentation", label: "Alimentation générale", icon: "🛒" },
    // Tech & Telecom
    { id: "telecom", label: "Téléphonie & Telecom", icon: "📱" },
    { id: "informatique", label: "Informatique & High-Tech", icon: "💻" },
    { id: "electromenager", label: "Électroménager", icon: "🔌" },
    // Santé & Pharmacie
    { id: "pharmacie", label: "Pharmacie & Parapharmacie", icon: "💊" },
    // Maison & Construction
    { id: "quincaillerie", label: "Quincaillerie & BTP", icon: "🔨" },
    { id: "materiaux", label: "Matériaux de construction", icon: "🧱" },
    // Papeterie & Art
    { id: "librairie", label: "Librairie & Papeterie", icon: "📚" },
    { id: "artisanat", label: "Artisanat & Art", icon: "🎨" },
    // Commerce en gros
    { id: "grossiste", label: "Grossiste", icon: "📦" },
    // Autres
    { id: "hygiene", label: "Hygiène & Entretien", icon: "🧼" },
    { id: "divers", label: "Maison & Divers", icon: "🏠" },
  ],
};

// Génère une image via Pollinations.ai
function generateImageUrl(name: string) {
  const prompt = encodeURIComponent(`${name}, Sénégal, plat cuisine africaine, photographie professionnelle appétissante, fond blanc`);
  return `https://image.pollinations.ai/prompt/${prompt}?width=400&height=300&nologo=true`;
}

// Génère une description via Pollinations.ai text
async function generateDescription(name: string): Promise<string> {
  try {
    const prompt = encodeURIComponent(
      `Écris une description courte (2-3 phrases max, appétissante) pour ce plat ou produit sénégalais: "${name}". Réponds uniquement avec la description, sans titre ni introduction.`
    );
    const res = await fetch(`https://text.pollinations.ai/${prompt}`);
    const text = await res.text();
    return text.trim().slice(0, 200);
  } catch {
    return "";
  }
}

type FormMode = "add" | "edit" | null;

export default function PartnerProductsPage() {
  const params = useParams();
  const token = params?.token as string;

  const [products, setProducts] = useState<any[]>([]);
  const [partner, setPartner] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<FormMode>(null);
  const [editing, setEditing] = useState<any>(null);
  const [filterCat, setFilterCat] = useState("");

  // Form state
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [viewProduct, setViewProduct] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [generatingDesc, setGeneratingDesc] = useState(false);
  const [generatingImg, setGeneratingImg] = useState(false);
  const [imagePreview, setImagePreview] = useState("");

  // Catégories dynamiques selon le type du partenaire
  const MEAL_CATEGORIES = CATEGORIES_BY_TYPE[partner?.type] ?? CATEGORIES_BY_TYPE["Restaurant"];

  const load = useCallback(async () => {
    if (!token) return;
    try {
      const [p, pr] = await Promise.all([
        fetch(`${BASE}/partners/portal/${token}`).then((r) => r.json()),
        fetch(`${BASE}/partner-products?token=${token}`).then((r) => r.json()).catch(() => []),
      ]);
      setPartner(p);
      setProducts(Array.isArray(pr) ? pr : pr?.data ?? []);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const resetForm = () => {
    setName(""); setPrice("");
    setCategory(CATEGORIES_BY_TYPE[partner?.type]?.[0]?.id ?? "plat");
    setDescription(""); setImageUrl(""); setImagePreview("");
    setImageUrls([]);
    setEditing(null); setMode(null);
  };

  const openEdit = (product: any) => {
    setEditing(product);
    setName(product.name);
    setPrice(String(product.price));
    setCategory(product.category || MEAL_CATEGORIES[0]?.id || "plat");
    setDescription(product.description || "");
    setImageUrl(product.imageUrl || "");
    setImagePreview(product.imageUrl || "");
    // Charger toutes les images existantes
    const allImgs = product.imageUrls?.length ? product.imageUrls : product.imageUrl ? [product.imageUrl] : [];
    setImageUrls(allImgs);
    setMode("edit");
  };

  const openAdd = () => {
    resetForm();
    setMode("add");
  };

  const handleGenerateDesc = async () => {
    if (!name.trim()) return;
    setGeneratingDesc(true);
    const desc = await generateDescription(name);
    setDescription(desc);
    setGeneratingDesc(false);
  };

  const handleGenerateImage = () => {
    if (!name.trim()) return;
    setGeneratingImg(true);
    const url = generateImageUrl(name);
    setImageUrl(url);
    setImagePreview(url);
    setGeneratingImg(false);
  };

  const handleSave = async () => {
    if (!name.trim() || !price) return;
    setSaving(true);
    try {
      const allImgs = imageUrls.length > 0 ? imageUrls : imageUrl ? [imageUrl] : [];
      const body = {
        name: name.trim(),
        price: Number(price),
        category,
        description: description || undefined,
        imageUrl: allImgs[0] || generateImageUrl(name),
        imageUrls: allImgs.length > 0 ? allImgs : undefined,
        token,
      };

      const url = mode === "edit" ? `${BASE}/partner-products/${editing.id}` : `${BASE}/partner-products`;
      const method = mode === "edit" ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        await load();
        resetForm();
      }
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id: string, current: boolean) => {
    await fetch(`${BASE}/partner-products/${id}/toggle`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !current, token }),
    });
    setProducts((prev) => prev.map((p) => p.id === id ? { ...p, isActive: !current } : p));
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce produit ?")) return;
    await fetch(`${BASE}/partner-products/${id}?token=${token}`, { method: "DELETE" });
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const filtered = products.filter((p) => !filterCat || p.category === filterCat);

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 22, color: "#1a1a1a", marginBottom: 4 }}>
            Mes produits
          </h1>
          <p style={{ fontSize: 13, color: "#aaa" }}>
            {products.filter((p) => p.isActive).length} actif(s) · {products.length} total
          </p>
        </div>
        <button onClick={openAdd} style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "11px 22px", borderRadius: 99, border: "none",
          background: "#E8380D", color: "#fff",
          fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 14, cursor: "pointer",
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Ajouter un produit
        </button>
      </div>

      {/* Category filter */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
        <button onClick={() => setFilterCat("")} style={filterPill(!filterCat)}>Tous</button>
        {MEAL_CATEGORIES.map((cat) => (
          <button key={cat.id} onClick={() => setFilterCat(cat.id)} style={filterPill(filterCat === cat.id)}>
            {cat.icon} {cat.label}
          </button>
        ))}
      </div>

      {/* Products grid */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "60px", color: "#aaa" }}>Chargement…</div>
      ) : filtered.length === 0 ? (
        <div style={{
          background: "#fff", borderRadius: 16, border: "1px solid #f0ebe8",
          padding: "60px 24px", textAlign: "center",
        }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📦</div>
          <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 600, fontSize: 18, color: "#1a1a1a", marginBottom: 8 }}>
            {filterCat ? "Aucun produit dans cette catégorie" : "Aucun produit encore"}
          </p>
          <p style={{ fontSize: 13, color: "#aaa", marginBottom: 20 }}>
            Ajoutez vos premiers produits pour les rendre visibles aux clients
          </p>
          <button onClick={openAdd} style={{
            padding: "11px 28px", borderRadius: 99, border: "none",
            background: "#E8380D", color: "#fff",
            fontWeight: 700, fontSize: 14, cursor: "pointer",
          }}>
            + Ajouter un produit
          </button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
          {filtered.map((product) => {
            const cat = MEAL_CATEGORIES.find((c) => c.id === product.category);
            const productImgs = product.imageUrls?.length ? product.imageUrls : product.imageUrl ? [product.imageUrl] : [];
            return (
              <div key={product.id} style={{
                background: "#fff", borderRadius: 16,
                border: "1px solid #f0ebe8",
                overflow: "hidden",
                opacity: product.isActive ? 1 : 0.6,
                transition: "transform 0.2s, box-shadow 0.2s",
              }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.transform = "translateY(-3px)";
                  (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 24px rgba(0,0,0,0.08)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
                  (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
                }}
              >
                {/* Image — cliquable pour popup */}
                <div
                  onClick={() => setViewProduct(product)}
                  style={{ height: 150, overflow: "hidden", position: "relative", background: "#fafaf8", cursor: "pointer" }}
                >
                  <img
                    src={productImgs[0] || generateImageUrl(product.name)}
                    alt={product.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://image.pollinations.ai/prompt/${encodeURIComponent(product.name + ", food photography")}?width=400&height=300&nologo=true`;
                    }}
                  />
                  {/* Indicateur multi-photos */}
                  {productImgs.length > 1 && (
                    <span style={{ position: "absolute", bottom: 8, right: 8, background: "rgba(0,0,0,0.6)", color: "#fff", fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 99 }}>
                      📷 {productImgs.length}
                    </span>
                  )}
                  {/* Category badge */}
                  <span style={{
                    position: "absolute", top: 8, left: 8,
                    background: "rgba(255,255,255,0.92)", backdropFilter: "blur(4px)",
                    padding: "3px 10px", borderRadius: 99, fontSize: 11, fontWeight: 600, color: "#6b6b6b",
                  }}>
                    {cat?.icon} {cat?.label}
                  </span>
                  {/* Active toggle */}
                  <button
                    onClick={() => handleToggle(product.id, product.isActive)}
                    style={{
                      position: "absolute", top: 8, right: 8,
                      padding: "3px 10px", borderRadius: 99, border: "none",
                      background: product.isActive ? "rgba(16,185,129,0.9)" : "rgba(0,0,0,0.5)",
                      color: "#fff", fontSize: 10, fontWeight: 700, cursor: "pointer",
                    }}
                  >
                    {product.isActive ? "● Actif" : "○ Masqué"}
                  </button>
                </div>

                {/* Info */}
                <div style={{ padding: "14px 16px" }}>
                  <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 14, color: "#1a1a1a", marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {product.name}
                  </h3>
                  {product.description && (
                    <p style={{ fontSize: 12, color: "#aaa", lineHeight: 1.4, marginBottom: 8, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {product.description}
                    </p>
                  )}
                  <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 16, color: "#E8380D", marginBottom: 12 }}>
                    {product.price?.toLocaleString()} <span style={{ fontSize: 11, fontWeight: 500 }}>FCFA</span>
                  </p>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => openEdit(product)} style={{
                      flex: 1, padding: "7px", borderRadius: 8,
                      border: "1px solid #f0ebe8", background: "#fff",
                      color: "#6b6b6b", fontSize: 12, cursor: "pointer", fontWeight: 500,
                    }}>
                      ✏️ Modifier
                    </button>
                    <button onClick={() => handleDelete(product.id)} style={{
                      padding: "7px 10px", borderRadius: 8,
                      border: "1px solid #fee2e2", background: "#fff",
                      color: "#ef4444", fontSize: 12, cursor: "pointer",
                    }}>
                      🗑
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Popup détail produit ── */}
      {viewProduct && (() => {
        const vpImgs = viewProduct.imageUrls?.length ? viewProduct.imageUrls : viewProduct.imageUrl ? [viewProduct.imageUrl] : [];
        const vpCat = MEAL_CATEGORIES.find((c: any) => c.id === viewProduct.category);
        return (
          <>
            <div onClick={() => setViewProduct(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 200, backdropFilter: "blur(3px)" }} />
            <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", background: "#fff", borderRadius: 20, width: "100%", maxWidth: 440, zIndex: 201, maxHeight: "88vh", overflowY: "auto", boxShadow: "0 24px 64px rgba(0,0,0,0.2)" }}>
              {/* Galerie photos */}
              {vpImgs.length > 0 && (
                <div>
                  {/* Photo principale */}
                  <GalleryViewer images={vpImgs} />
                </div>
              )}
              {vpImgs.length === 0 && (
                <div style={{ height: 200, background: "#fafaf8", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <img src={generateImageUrl(viewProduct.name)} alt={viewProduct.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              )}
              {/* Info */}
              <div style={{ padding: "20px 20px 24px" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 10 }}>
                  <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 20, color: "#1a1a1a", lineHeight: 1.2 }}>{viewProduct.name}</h2>
                  <button onClick={() => setViewProduct(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#aaa", fontSize: 20, flexShrink: 0, padding: 4 }}>✕</button>
                </div>
                {vpCat && (
                  <span style={{ display: "inline-block", fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 99, background: "#f0ebe8", color: "#6b6b6b", marginBottom: 10 }}>
                    {vpCat.icon} {vpCat.label}
                  </span>
                )}
                {viewProduct.description && (
                  <p style={{ fontSize: 14, color: "#555", lineHeight: 1.7, marginBottom: 14 }}>{viewProduct.description}</p>
                )}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 22, color: "#E8380D" }}>
                    {viewProduct.price?.toLocaleString()} <span style={{ fontSize: 12, fontWeight: 500 }}>FCFA</span>
                  </span>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => { setViewProduct(null); openEdit(viewProduct); }} style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid #f0ebe8", background: "#fff", color: "#6b6b6b", fontSize: 13, cursor: "pointer", fontWeight: 500 }}>✏️ Modifier</button>
                  </div>
                </div>
              </div>
            </div>
          </>
        );
      })()}

      {/* ── Add/Edit Modal ── */}
      {mode && (
        <>
          <div onClick={resetForm} style={{
            position: "fixed", inset: 0,
            background: "rgba(0,0,0,0.4)", zIndex: 100,
            backdropFilter: "blur(2px)",
          }} />
          <div style={{
            position: "fixed", top: "50%", left: "50%",
            transform: "translate(-50%, -50%)",
            background: "#fff", borderRadius: 20,
            padding: "28px", width: "100%", maxWidth: 500,
            zIndex: 101, maxHeight: "90vh", overflowY: "auto",
            boxShadow: "0 24px 64px rgba(0,0,0,0.15)",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
              <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 20, color: "#1a1a1a" }}>
                {mode === "add" ? "Ajouter un produit" : "Modifier le produit"}
              </h3>
              <button onClick={resetForm} style={{ background: "none", border: "none", cursor: "pointer", color: "#aaa", fontSize: 20, padding: 4 }}>✕</button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

              {/* Name */}
              <div>
                <label style={lbl}>Nom du produit *</label>
                <input
                  value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="Ex : Thiéboudienne, Yassa poulet…"
                  style={inp}
                />
              </div>

              {/* Price + Category */}
              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <label style={lbl}>Prix (FCFA) *</label>
                  <input
                    type="number" value={price} onChange={(e) => setPrice(e.target.value)}
                    placeholder="Ex : 2500"
                    style={inp}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={lbl}>Catégorie</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} style={inp}>
                    {MEAL_CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>{c.icon} {c.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description with AI */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <label style={{ ...lbl, marginBottom: 0 }}>Description</label>
                  <button
                    onClick={handleGenerateDesc}
                    disabled={!name.trim() || generatingDesc}
                    style={{
                      display: "flex", alignItems: "center", gap: 5,
                      padding: "4px 10px", borderRadius: 99,
                      border: "1px solid #e0f2fe", background: "#f0f9ff",
                      color: "#0369a1", fontSize: 11, fontWeight: 600,
                      cursor: name.trim() ? "pointer" : "not-allowed",
                      opacity: name.trim() ? 1 : 0.5,
                    }}
                  >
                    {generatingDesc ? "⏳ Génération…" : "✨ Générer avec l'IA"}
                  </button>
                </div>
                <textarea
                  value={description} onChange={(e) => setDescription(e.target.value)}
                  placeholder="Description du produit (optionnel — l'IA peut la générer)"
                  style={{ ...inp, height: 80, resize: "none" }}
                />
              </div>

              {/* Image with AI */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <label style={{ ...lbl, marginBottom: 0 }}>Image</label>
                  <button
                    onClick={handleGenerateImage}
                    disabled={!name.trim() || generatingImg}
                    style={{
                      display: "flex", alignItems: "center", gap: 5,
                      padding: "4px 10px", borderRadius: 99,
                      border: "1px solid #fce7f3", background: "#fdf4ff",
                      color: "#be185d", fontSize: 11, fontWeight: 600,
                      cursor: name.trim() ? "pointer" : "not-allowed",
                      opacity: name.trim() ? 1 : 0.5,
                    }}
                  >
                    {generatingImg ? "⏳…" : "🎨 Générer avec l'IA"}
                  </button>
                </div>

                {/* Image preview */}
                {imagePreview && (
                  <div style={{ marginBottom: 10, borderRadius: 10, overflow: "hidden", height: 140, background: "#fafaf8" }}>
                    <img
                      src={imagePreview}
                      alt="Preview"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      onLoad={() => setGeneratingImg(false)}
                    />
                  </div>
                )}

                <input
                  value={imageUrl} onChange={(e) => { setImageUrl(e.target.value); setImagePreview(e.target.value); }}
                  placeholder="URL de l'image (optionnel)"
                  style={inp}
                />
                <p style={{ fontSize: 11, color: "#aaa", marginTop: 4 }}>
                  💡 Si vide, une image IA sera générée automatiquement · Max 1 image par produit
                </p>
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                <button onClick={resetForm} style={{
                  flex: 1, padding: "12px", borderRadius: 10,
                  border: "1px solid #f0ebe8", background: "#fff",
                  color: "#6b6b6b", cursor: "pointer", fontWeight: 500,
                }}>
                  Annuler
                </button>
                <button
                  onClick={handleSave}
                  disabled={!name.trim() || !price || saving}
                  style={{
                    flex: 2, padding: "12px", borderRadius: 10, border: "none",
                    background: name.trim() && price ? "#E8380D" : "#f0ebe8",
                    color: name.trim() && price ? "#fff" : "#aaa",
                    fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 14,
                    cursor: name.trim() && price ? "pointer" : "not-allowed",
                  }}
                >
                  {saving ? "Enregistrement…" : mode === "add" ? "Ajouter le produit" : "Enregistrer"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ── Galerie photos défilable dans le popup ────────────────
function GalleryViewer({ images }: { images: string[] }) {
  const [idx, setIdx] = useState(0);
  if (!images.length) return null;
  return (
    <div style={{ position: "relative" }}>
      {/* Image principale */}
      <div style={{ height: 260, background: "#fafaf8", overflow: "hidden", borderRadius: "20px 20px 0 0", position: "relative" }}>
        <img
          src={images[idx]}
          alt={`Photo ${idx + 1}`}
          style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
        />
        {/* Chevrons navigation */}
        {images.length > 1 && idx > 0 && (
          <button onClick={() => setIdx(idx - 1)} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", width: 32, height: 32, borderRadius: 99, background: "rgba(0,0,0,0.5)", border: "none", color: "#fff", fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>‹</button>
        )}
        {images.length > 1 && idx < images.length - 1 && (
          <button onClick={() => setIdx(idx + 1)} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", width: 32, height: 32, borderRadius: 99, background: "rgba(0,0,0,0.5)", border: "none", color: "#fff", fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>›</button>
        )}
        {/* Compteur */}
        {images.length > 1 && (
          <div style={{ position: "absolute", bottom: 10, right: 10, background: "rgba(0,0,0,0.55)", color: "#fff", fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 99 }}>
            {idx + 1} / {images.length}
          </div>
        )}
      </div>
      {/* Miniatures */}
      {images.length > 1 && (
        <div style={{ display: "flex", gap: 8, padding: "10px 16px", background: "#fafaf8", overflowX: "auto", scrollbarWidth: "none" }}>
          {images.map((url, i) => (
            <button key={i} onClick={() => setIdx(i)} style={{ width: 52, height: 52, borderRadius: 8, overflow: "hidden", flexShrink: 0, border: `2px solid ${idx === i ? "#E8380D" : "transparent"}`, padding: 0, cursor: "pointer", background: "#f0f0f0", transition: "border .15s" }}>
              <img src={url} alt={`Miniature ${i + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function filterPill(active: boolean): React.CSSProperties {
  return {
    padding: "6px 16px", borderRadius: 99, fontSize: 12, cursor: "pointer",
    border: "1px solid " + (active ? "#E8380D" : "#f0ebe8"),
    background: active ? "#fff5f3" : "#fff",
    color: active ? "#E8380D" : "#6b6b6b",
    fontWeight: active ? 700 : 400, transition: "all 0.18s",
    whiteSpace: "nowrap" as const,
  };
}

const lbl: React.CSSProperties = {
  fontSize: 12, fontWeight: 600, color: "#6b6b6b",
  display: "block", marginBottom: 6,
};
const inp: React.CSSProperties = {
  width: "100%", padding: "10px 14px", borderRadius: 10,
  border: "1px solid #f0ebe8", fontSize: 14, outline: "none",
  fontFamily: "DM Sans, sans-serif", background: "#fff",
  transition: "border-color 0.2s",
};