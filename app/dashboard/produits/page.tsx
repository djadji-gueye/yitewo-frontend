"use client";

import { useState, useEffect, useCallback } from "react";

const BASE = process.env.NEXT_PUBLIC_URL_PROD || "http://localhost:3003";
function authFetch(path: string, options?: RequestInit) {
  const token = typeof window !== "undefined" ? localStorage.getItem("yitewo_token") : "";
  return fetch(`${BASE}${path}`, {
    ...options,
    headers: { Authorization: `Bearer ${token}`, ...options?.headers },
  });
}

export default function ProduitsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const [p, c] = await Promise.all([
        authFetch("/products").then((r) => r.json()),
        authFetch("/categories").then((r) => r.json()),
      ]);
      setProducts(Array.isArray(p) ? p : []);
      setCategories(Array.isArray(c) ? c : []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    try {
      const form = new FormData();
      if (editing._name)  form.append("name",  editing._name);
      if (editing._price) form.append("price", editing._price);
      if (editing._catId) form.append("categoryId", editing._catId);
      if (editing._file)  form.append("image", editing._file);

      await fetch(`${BASE}/products/${editing.id}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${localStorage.getItem("yitewo_token")}` },
        body: form,
      });
      setEditing(null);
      await load();
    } finally {
      setSaving(false);
    }
  };

  const filtered = products.filter((p) => {
    const matchCat = !filter || p.category?.id === filter || p.category?.name === filter;
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div style={{ padding: "28px", maxWidth: 1100, margin: "0 auto" }}>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 22, color: "#fff" }}>
          Produits <span style={{ fontSize: 14, color: "#555", fontWeight: 400 }}>({filtered.length})</span>
        </h1>
        <button onClick={load} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "6px 12px", color: "#888", fontSize: 12, cursor: "pointer" }}>
          ↻ Actualiser
        </button>
      </div>

      {/* Search + filter */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un produit…"
          style={{ flex: "1 1 200px", padding: "9px 14px", borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#fff", fontSize: 13, outline: "none" }} />
        <select value={filter} onChange={(e) => setFilter(e.target.value)}
          style={{ padding: "9px 14px", borderRadius: 8, background: "#13131f", border: "1px solid rgba(255,255,255,0.08)", color: "#888", fontSize: 13, outline: "none" }}>
          <option value="">Toutes catégories</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px", color: "#444" }}>Chargement…</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
          {filtered.map((product) => (
            <div key={product.id} style={{ background: "#13131f", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, overflow: "hidden" }}>
              <div style={{ height: 120, overflow: "hidden", position: "relative" }}>
                <img src={product.imageUrl} alt={product.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/200x120/1a1a1a/444?text=📦"; }} />
                <div style={{ position: "absolute", top: 8, left: 8 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: "rgba(0,0,0,0.6)", color: "#aaa" }}>
                    {product.category?.name}
                  </span>
                </div>
              </div>
              <div style={{ padding: "12px 14px" }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: "#ddd", marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {product.name}
                </p>
                <p style={{ fontSize: 14, fontWeight: 800, color: "#E8380D", fontFamily: "Syne, sans-serif", marginBottom: 10 }}>
                  {product.price?.toLocaleString()} FCFA
                </p>
                <button onClick={() => setEditing({ ...product, _name: product.name, _price: product.price, _catId: product.categoryId })}
                  style={{ width: "100%", padding: "6px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.08)", background: "transparent", color: "#888", fontSize: 11, cursor: "pointer", transition: "all 0.18s" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#E8380D"; (e.currentTarget as HTMLButtonElement).style.color = "#E8380D"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.08)"; (e.currentTarget as HTMLButtonElement).style.color = "#888"; }}>
                  ✏️ Modifier
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit modal */}
      {editing && (
        <>
          <div onClick={() => setEditing(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 100 }} />
          <div style={{
            position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
            background: "#13131f", border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 16, padding: "28px", width: "100%", maxWidth: 420, zIndex: 101,
            boxShadow: "0 32px 80px rgba(0,0,0,0.6)",
          }}>
            <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 18, color: "#fff", marginBottom: 20 }}>
              Modifier : {editing.name}
            </h3>
            <form onSubmit={handleUpdate} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={labelStyle}>Nom</label>
                <input value={editing._name} onChange={(e) => setEditing({ ...editing, _name: e.target.value })} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Prix (FCFA)</label>
                <input type="number" value={editing._price} onChange={(e) => setEditing({ ...editing, _price: e.target.value })} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Catégorie</label>
                <select value={editing._catId} onChange={(e) => setEditing({ ...editing, _catId: e.target.value })}
                  style={{ ...inputStyle, background: "#1a1a2e" }}>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Nouvelle image (optionnel)</label>
                <input type="file" accept="image/*" onChange={(e) => setEditing({ ...editing, _file: e.target.files?.[0] })}
                  style={{ ...inputStyle, padding: "8px" }} />
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                <button type="button" onClick={() => setEditing(null)} style={{ flex: 1, padding: "11px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "#888", cursor: "pointer" }}>
                  Annuler
                </button>
                <button type="submit" disabled={saving} style={{ flex: 1, padding: "11px", borderRadius: 10, border: "none", background: "#E8380D", color: "#fff", fontFamily: "Syne, sans-serif", fontWeight: 700, cursor: "pointer" }}>
                  {saving ? "…" : "Enregistrer"}
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}

const labelStyle: React.CSSProperties = { fontSize: 12, color: "#666", display: "block", marginBottom: 6, fontWeight: 500 };
const inputStyle: React.CSSProperties = { width: "100%", padding: "10px 14px", borderRadius: 10, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", fontSize: 13, outline: "none", fontFamily: "DM Sans, sans-serif" };
