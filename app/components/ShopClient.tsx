"use client";

import { useState, useMemo, useEffect, useRef, lazy, Suspense } from "react";
import { useCart } from "./CartProvider";
import dynamic from "next/dynamic";

const FollowButton = dynamic(() => import("./FollowButton"), { ssr: false });
const ReviewsSection = dynamic(() => import("./ReviewsSection"), { ssr: false });

interface Product {
  id?: number | string;
  name: string;
  price: number;
  imageUrl: string;
  imageUrls?: string[];
  description?: string;
  category?: { id?: number | string; name: string };
  isPartnerProduct?: boolean;
}

interface Partner {
  id: string;
  name: string;
  city: string;
  slug?: string;
  contact: string;
  bannerUrl?: string;
}

const ZONES_BY_CITY: Record<string, string[]> = {
  "Saint-Louis": [
    "Île de Saint-Louis - Sud", "Île de Saint-Louis - Nord", "Guet Ndar", "Santhiaba",
    "Sor Daga", "Sor Diagne", "Darou", "Diamaguène", "Ndioloffène", "Ngallèle", "Balacos",
    "Goxu Mbathie", "Hydrobase", "Cité Vauvert", "Cité Niakh", "Cité Fayçal", "Cité Flamants",
    "Boudiouck", "Leona", "Cité Sotrac", "Cité Tamsir", "Cité Universitaire / UGB", "Gandiol", "Bango", "Khor",
  ],
  Dakar: ["Ouest-Foire", "Point E", "Hann", "Grand-Yoff", "HLM", "Mermoz", "Almadies", "Yoff"],
};

function ProductSkeleton() {
  return (
    <div style={{ background: "#fff", borderRadius: "var(--radius-card)", overflow: "hidden", border: "1px solid var(--border)" }}>
      <div className="skeleton" style={{ height: 180 }} />
      <div style={{ padding: 16 }}>
        <div className="skeleton" style={{ height: 16, borderRadius: 8, marginBottom: 8 }} />
        <div className="skeleton" style={{ height: 14, width: "60%", borderRadius: 8, marginBottom: 16 }} />
        <div className="skeleton" style={{ height: 36, borderRadius: 99 }} />
      </div>
    </div>
  );
}

export default function ShopClient({
  partner,
}: {
  phone?: string;
  partner?: Partner | null;
}) {
  const { addItem, items, setIsOpen, setPartnerId } = useCart();
  const [promo, setPromo] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewProduct, setViewProduct] = useState<Product | null>(null);
  const [city, setCity] = useState("Dakar");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [search, setSearch] = useState("");
  const [addedMap, setAddedMap] = useState<Record<string, boolean>>({});
  const pillsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const BASE = process.env.NEXT_PUBLIC_URL_PROD;

    if (partner?.slug) {
      // Partenaire spécifique → charger ses produits
      fetch(`${BASE}/partners/${partner.slug}/products`)
        .then((r) => r.json())
        .then((data) => {
          // data = { partner, products }
          const rawProducts = Array.isArray(data) ? data : (data?.products ?? []);
          // Stocker l'ID du partenaire dans le contexte panier
          if (data?.partner?.id) setPartnerId(data.partner.id);
          // Normalise les produits partenaire au format Product
          const list: Product[] = rawProducts.map((p: any) => ({
            id: p.id,
            name: p.name,
            price: p.price,
            imageUrl: p.imageUrl || `https://image.pollinations.ai/prompt/${encodeURIComponent(p.name + ", Sénégal, cuisine africaine, photographie professionnelle")}?width=400&height=300&nologo=true`,
            imageUrls: p.imageUrls || [],
            description: p.description || "",
            category: { id: p.category, name: p.category || "Plats" },
            isPartnerProduct: true,
          }));
          setProducts(list);
          const first = list?.[0]?.category?.name;
          if (first) setSelectedCategory(first);
        })
        .catch(console.error)
        .finally(() => setLoading(false));

      // Fetch active promo for this partner
      const BASE2 = process.env.NEXT_PUBLIC_URL_PROD;
      fetch(`${BASE2}/social/promos/${partner.slug}`)
        .then((r) => r.ok ? r.json() : null)
        .then((p) => { if (p?.id && new Date(p.endsAt) > new Date()) setPromo(p); })
        .catch(() => { });
    } else {
      // Catalogue général Yitewo
      fetch(`${BASE}/products`)
        .then((r) => r.json())
        .then((data) => {
          const list = Array.isArray(data) ? data : data?.data ?? [];
          setProducts(list);
          const first = list?.[0]?.category?.name;
          if (first) setSelectedCategory(first);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [partner?.slug]);

  const categories = useMemo(() => {
    return Array.from(
      new Set(products.map((p) => p.category?.name).filter(Boolean) as string[])
    );
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCat = !selectedCategory || p.category?.name === selectedCategory;
      const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [products, selectedCategory, search]);

  const handleAdd = (product: Product) => {
    const key = String(product.id || product.name);
    addItem({
      id: product.id || product.name,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      category: product.category?.name,
      isPartnerProduct: product.isPartnerProduct ?? false,
    });
    setAddedMap((prev) => ({ ...prev, [key]: true }));
    setTimeout(() => setAddedMap((prev) => ({ ...prev, [key]: false })), 1200);
  };

  const cartQty = (product: Product) => {
    const id = product.id || product.name;
    return items.find((i) => i.id === id)?.quantity ?? 0;
  };

  return (
    <div style={{ background: "var(--surface)", minHeight: "100vh" }}>

      {/* Header — bannière en background si elle existe, sinon dégradé */}
      <div style={{
        position: "relative",
        overflow: "hidden",
        minHeight: 160,
      }}>
        {/* Background : vraie bannière ou dégradé */}
        {partner?.bannerUrl ? (
          <img
            src={partner.bannerUrl}
            alt="bannière"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        ) : (
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, #1a0500 0%, #c22d09 100%)" }} />
        )}

        {/* Overlay sombre pour lisibilité — plus fort si bannière */}
        <div style={{
          position: "absolute", inset: 0,
          background: partner?.bannerUrl
            ? "linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.65) 100%)"
            : "rgba(0,0,0,0.1)",
        }} />

        {/* Cercle déco (seulement sans bannière) */}
        {!partner?.bannerUrl && (
          <div style={{ position: "absolute", top: -50, right: -50, width: 220, height: 220, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
        )}

        {/* Contenu */}
        <div style={{ position: "relative", zIndex: 1, maxWidth: 900, margin: "0 auto", padding: "32px 20px 36px" }}>
          <h1 style={{
            fontFamily: "Syne", fontWeight: 800,
            fontSize: "clamp(22px, 4vw, 36px)", color: "#fff", marginBottom: 6,
            textShadow: partner?.bannerUrl ? "0 2px 8px rgba(0,0,0,0.5)" : "none",
          }}>
            {partner ? partner.name : "Nos produits"}
          </h1>
          <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 14, marginBottom: partner ? 14 : 0, textShadow: "0 1px 4px rgba(0,0,0,0.4)" }}>
            {partner ? `📍 ${partner.city || city}` : `Boutique à ${city}`}
          </p>

          {/* Promo */}
          {promo && (
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.3)",
              borderRadius: 99, padding: "6px 16px", marginBottom: 12,
              fontSize: 13, color: "#fff", fontWeight: 700, backdropFilter: "blur(4px)",
            }}>
              🔥 {promo.title}
              {promo.discount && <span style={{ background: "#E8380D", borderRadius: 99, padding: "1px 8px", fontSize: 11 }}>-{promo.discount}%</span>}
            </div>
          )}

          {/* Suivre */}
          {partner?.slug && (
            <div>
              <FollowButton slug={partner.slug} partnerName={partner.name} />
            </div>
          )}
        </div>
      </div>

      <div style={{ maxWidth: 1140, margin: "0 auto", padding: "24px 20px" }}>

        {/* Controls row */}
        <div style={{
          display: "flex", gap: 12, alignItems: "center",
          flexWrap: "wrap", marginBottom: 24,
        }}>
          {/* Search */}
          <div style={{
            position: "relative", flex: "1 1 220px", maxWidth: 340,
          }}>
            <svg
              style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }}
              width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
            >
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un produit…"
              style={{
                width: "100%", padding: "10px 14px 10px 38px",
                borderRadius: 99, border: "1px solid var(--border)",
                background: "#fff", fontSize: 14, outline: "none",
              }}
            />
          </div>

          {/* City toggle */}
          <div style={{ display: "flex", gap: 6 }}>
            {Object.keys(ZONES_BY_CITY).map((c) => (
              <button
                key={c}
                onClick={() => setCity(c)}
                style={{
                  padding: "9px 18px", borderRadius: 99,
                  border: "2px solid " + (city === c ? "var(--brand)" : "var(--border)"),
                  background: city === c ? "var(--brand)" : "#fff",
                  color: city === c ? "#fff" : "var(--muted)",
                  fontWeight: 600, fontSize: 13, cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Cart summary pill */}
          <button
            onClick={() => setIsOpen(true)}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "9px 18px", borderRadius: 99,
              background: "var(--brand-light)", border: "1px solid #fdd0c5",
              color: "var(--brand)", fontWeight: 600, fontSize: 13, cursor: "pointer",
              marginLeft: "auto",
            }}
          >
            🛒 Voir le panier
            {items.length > 0 && (
              <span style={{
                background: "var(--brand)", color: "#fff",
                borderRadius: "99px", fontSize: 11, fontWeight: 800,
                padding: "1px 7px",
              }}>
                {items.reduce((s, i) => s + i.quantity, 0)}
              </span>
            )}
          </button>
        </div>

        {/* Category pills */}
        <div className="pills-scroll" ref={pillsRef} style={{ marginBottom: 28 }}>
          <button
            onClick={() => setSelectedCategory("")}
            style={pillStyle(selectedCategory === "")}
          >
            Tous
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={pillStyle(selectedCategory === cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: 20,
        }}>
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <ProductSkeleton key={i} />)
            : filteredProducts.map((product, i) => {
              const key = String(product.id || product.name);
              const qty = cartQty(product);
              const justAdded = addedMap[key];

              return (
                <div
                  key={key}
                  className={`product-card fade-up delay-${Math.min((i % 6) + 1, 6)}`}
                  style={{
                    background: "#fff",
                    borderRadius: "var(--radius-card)",
                    overflow: "hidden",
                    border: "1px solid var(--border)",
                    boxShadow: "var(--shadow-card)",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <div style={{ position: "relative", overflow: "hidden" }} onClick={() => setViewProduct(product)}>
                    <img
                      src={(product.imageUrls?.[0]) || product.imageUrl}
                      alt={product.name}
                      style={{ width: "100%", height: 180, objectFit: "cover", display: "block", transition: "transform 0.3s", cursor: "pointer" }}
                      onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/400x300/f0ebe8/aaa?text=Produit"; }}
                      onMouseEnter={(e) => { (e.target as HTMLImageElement).style.transform = "scale(1.06)"; }}
                      onMouseLeave={(e) => { (e.target as HTMLImageElement).style.transform = "scale(1)"; }}
                    />
                    {(product.imageUrls?.length ?? 0) > 1 && (
                      <span style={{ position: "absolute", bottom: 8, right: 8, background: "rgba(0,0,0,0.6)", color: "#fff", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99 }}>
                        📷 {product.imageUrls!.length}
                      </span>
                    )}
                    {product.category?.name && (
                      <span
                        className="tag"
                        style={{
                          position: "absolute", top: 10, left: 10,
                          background: "rgba(255,255,255,0.92)",
                          color: "var(--muted)",
                          backdropFilter: "blur(4px)",
                        }}
                      >
                        {product.category.name}
                      </span>
                    )}
                    {qty > 0 && (
                      <span
                        style={{
                          position: "absolute", top: 10, right: 10,
                          background: "var(--green)", color: "#fff",
                          borderRadius: 99, fontSize: 11, fontWeight: 800,
                          padding: "3px 9px",
                        }}
                      >
                        {qty} dans le panier
                      </span>
                    )}
                  </div>

                  <div style={{ padding: "14px 16px 16px", flex: 1, display: "flex", flexDirection: "column" }}>
                    <h3
                      onClick={() => setViewProduct(product)}
                      style={{ fontFamily: "Syne", fontWeight: 700, fontSize: 15, marginBottom: 4, lineHeight: 1.3, cursor: "pointer" }}
                    >
                      {product.name}
                    </h3>
                    {product.description && (
                      <p style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.5, marginBottom: 6, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as any, overflow: "hidden" }}>
                        {product.description}
                      </p>
                    )}
                    <p style={{ color: "var(--brand)", fontWeight: 700, fontSize: 16, marginBottom: 14, marginTop: "auto", paddingTop: 6 }}>
                      {product.price.toLocaleString()} <span style={{ fontSize: 12, fontWeight: 500 }}>FCFA</span>
                    </p>

                    <button
                      onClick={() => handleAdd(product)}
                      style={{
                        width: "100%", padding: "10px",
                        borderRadius: 99, border: "none",
                        background: justAdded ? "var(--green)" : "var(--brand)",
                        color: "#fff",
                        fontFamily: "Syne", fontWeight: 700, fontSize: 14,
                        cursor: "pointer",
                        transition: "background 0.3s, transform 0.15s",
                        transform: justAdded ? "scale(0.98)" : "scale(1)",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                      }}
                    >
                      {justAdded ? (
                        <>✓ Ajouté</>
                      ) : (
                        <>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                          </svg>
                          Ajouter au panier
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
        </div>

        {/* Empty state */}
        {!loading && filteredProducts.length === 0 && (
          <div style={{ textAlign: "center", padding: "64px 20px", color: "var(--muted)" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
            <p style={{ fontFamily: "Syne", fontWeight: 600, fontSize: 18, marginBottom: 8 }}>
              Aucun produit trouvé
            </p>
            <p style={{ fontSize: 14 }}>Essayez une autre catégorie ou recherche</p>
          </div>
        )}

        {/* Reviews section — only on partner pages */}
        {partner?.slug && (
          <ReviewsSection slug={partner.slug} partnerName={partner.name || ""} />
        )}
      </div>

      {/* ── Popup détail produit ── */}
      {viewProduct && (() => {
        const imgs = (viewProduct.imageUrls?.length ? viewProduct.imageUrls : [viewProduct.imageUrl]).filter(Boolean);
        return (
          <>
            <div onClick={() => setViewProduct(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 200, backdropFilter: "blur(3px)" }} />
            <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", background: "#fff", borderRadius: 20, width: "calc(100% - 32px)", maxWidth: 440, zIndex: 201, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 24px 64px rgba(0,0,0,0.2)" }}>
              <ProductGallery images={imgs} />
              <div style={{ padding: "18px 20px 24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 10 }}>
                  <h2 style={{ fontFamily: "Syne", fontWeight: 800, fontSize: 20, color: "var(--text)", lineHeight: 1.2 }}>{viewProduct.name}</h2>
                  <button onClick={() => setViewProduct(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#aaa", fontSize: 20, flexShrink: 0 }}>✕</button>
                </div>
                {viewProduct.category?.name && (
                  <span style={{ display: "inline-block", fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 99, background: "var(--brand-light)", color: "var(--brand)", marginBottom: 10 }}>
                    {viewProduct.category.name}
                  </span>
                )}
                {viewProduct.description && (
                  <p style={{ fontSize: 14, color: "#555", lineHeight: 1.7, marginBottom: 16 }}>{viewProduct.description}</p>
                )}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                  <span style={{ fontFamily: "Syne", fontWeight: 800, fontSize: 22, color: "var(--brand)" }}>
                    {viewProduct.price.toLocaleString()} <span style={{ fontSize: 12, fontWeight: 500 }}>FCFA</span>
                  </span>
                  <button
                    onClick={() => { handleAdd(viewProduct); setViewProduct(null); }}
                    style={{ flex: 1, maxWidth: 200, padding: "12px 20px", borderRadius: 99, border: "none", background: "var(--brand)", color: "#fff", fontFamily: "Syne", fontWeight: 700, fontSize: 14, cursor: "pointer" }}
                  >
                    + Ajouter au panier
                  </button>
                </div>
              </div>
            </div>
          </>
        );
      })()}
    </div>
  );
}

// ── Galerie défilable popup ───────────────────────────────
function ProductGallery({ images }: { images: string[] }) {
  const [idx, setIdx] = useState(0);
  if (!images.length) return null;
  return (
    <div style={{ position: "relative" }}>
      <div style={{ height: 260, background: "#fafaf8", overflow: "hidden", borderRadius: "20px 20px 0 0", position: "relative" }}>
        <img src={images[idx]} alt={`Photo ${idx + 1}`} style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }} />
        {images.length > 1 && idx > 0 && (
          <button onClick={() => setIdx(idx - 1)} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", width: 34, height: 34, borderRadius: 99, background: "rgba(0,0,0,0.5)", border: "none", color: "#fff", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>‹</button>
        )}
        {images.length > 1 && idx < images.length - 1 && (
          <button onClick={() => setIdx(idx + 1)} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", width: 34, height: 34, borderRadius: 99, background: "rgba(0,0,0,0.5)", border: "none", color: "#fff", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>›</button>
        )}
        {images.length > 1 && (
          <div style={{ position: "absolute", bottom: 10, right: 10, background: "rgba(0,0,0,0.55)", color: "#fff", fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 99 }}>
            {idx + 1} / {images.length}
          </div>
        )}
      </div>
      {images.length > 1 && (
        <div style={{ display: "flex", gap: 8, padding: "10px 14px", background: "#fafaf8", overflowX: "auto", scrollbarWidth: "none" }}>
          {images.map((url, i) => (
            <button key={i} onClick={() => setIdx(i)} style={{ width: 52, height: 52, borderRadius: 8, overflow: "hidden", flexShrink: 0, border: `2px solid ${idx === i ? "var(--brand)" : "transparent"}`, padding: 0, cursor: "pointer", background: "#f0f0f0", transition: "border .15s" }}>
              <img src={url} alt={`Photo ${i + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function pillStyle(active: boolean): React.CSSProperties {
  return {
    flexShrink: 0,
    padding: "8px 18px",
    borderRadius: 99,
    border: "2px solid " + (active ? "var(--brand)" : "var(--border)"),
    background: active ? "var(--brand)" : "#fff",
    color: active ? "#fff" : "var(--text)",
    fontWeight: active ? 600 : 400,
    fontSize: 13,
    cursor: "pointer",
    transition: "all 0.18s",
    whiteSpace: "nowrap" as const,
  };
}
