"use client";

import { useState } from "react";
import { useCart } from "./CartProvider";
import LocationPicker, { LocationValue } from "./LocationPicker";
import { createOrder } from "@/lib/api";

type Step = "cart" | "contact" | "confirm" | "success" | "error";

export default function CartDrawer() {
  const { items, isOpen, setIsOpen, removeItem, updateQty, totalPrice, clearCart, partnerId } = useCart();

  const [location, setLocation] = useState<LocationValue>({ city: "Dakar", quarter: "", deliveryFee: 0 });
  const [step, setStep] = useState<Step>("cart");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState("");

  const grand = totalPrice;

  const resetFlow = () => {
    setStep("cart");
    setName("");
    setPhone("");
    setNote("");
  };

  const handleClose = () => {
    setIsOpen(false);
    if (step === "success") {
      clearCart();
      resetFlow();
    }
  };

  const handleOrder = async () => {
    if (!location.quarter || items.length === 0) return;
    setLoading(true);
    try {
      const res: any = await createOrder({
        city: location.city,
        quarter: location.quarter,
        deliveryFee: 0,
        totalPrice: grand,
        customerName: name || undefined,
        customerPhone: phone || undefined,
        note: note || undefined,
        partnerId: partnerId || undefined,
        items: items.map((i) => ({
          productId: i.isPartnerProduct ? undefined : String(i.id),
          partnerProductId: i.isPartnerProduct ? String(i.id) : undefined,
          quantity: i.quantity,
          unitPrice: i.price,
        })),
      });
      setOrderId(res.id);
      setStep("success");
    } catch {
      setStep("error");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div onClick={handleClose} style={{
        position: "fixed", inset: 0,
        background: "rgba(0,0,0,0.45)", zIndex: 200, backdropFilter: "blur(2px)",
      }} />

      {/* Drawer */}
      <div style={{
        position: "fixed", top: 0, right: 0, bottom: 0,
        width: "100%", maxWidth: 440,
        background: "#fff", zIndex: 201,
        display: "flex", flexDirection: "column",
        boxShadow: "-8px 0 40px rgba(0,0,0,0.15)",
      }}>
        {/* ── Header ───────────────────────────────── */}
        <div style={{
          padding: "18px 24px",
          borderBottom: "1px solid var(--border)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {step !== "cart" && step !== "success" && step !== "error" && (
              <button onClick={() => setStep(step === "contact" ? "cart" : "contact")}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", padding: 4 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  <path d="M19 12H5M12 5l-7 7 7 7" />
                </svg>
              </button>
            )}
            <span style={{ fontFamily: "Syne", fontWeight: 700, fontSize: 19 }}>
              {step === "cart" && "Mon panier"}
              {step === "contact" && "Vos coordonnées"}
              {step === "confirm" && "Confirmer"}
              {step === "success" && "Commande envoyée !"}
              {step === "error" && "Erreur"}
            </span>
          </div>
          <button onClick={handleClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* ── Step: Cart ───────────────────────────── */}
        {step === "cart" && (
          <>
            <div style={{ flex: 1, overflowY: "auto", padding: "16px 24px" }}>
              {items.length === 0 ? (
                <div style={{ textAlign: "center", marginTop: 64, color: "var(--muted)" }}>
                  <div style={{ fontSize: 52, marginBottom: 12 }}>🛒</div>
                  <p style={{ fontFamily: "Syne", fontWeight: 600, fontSize: 16 }}>Panier vide</p>
                  <p style={{ fontSize: 13, marginTop: 6 }}>Ajoutez des produits pour commencer</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {items.map((item) => (
                    <div key={item.id} style={{
                      display: "flex", gap: 12, alignItems: "center",
                      background: "var(--surface)", borderRadius: 12, padding: 10,
                      border: "1px solid var(--border)",
                    }}>
                      <img src={item.imageUrl} alt={item.name}
                        style={{ width: 56, height: 56, borderRadius: 8, objectFit: "cover", flexShrink: 0 }}
                        onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/56x56/f0ebe8/999?text=📦"; }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontWeight: 600, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</p>
                        <p style={{ color: "var(--brand)", fontWeight: 700, fontSize: 13 }}>
                          {(item.price * item.quantity).toLocaleString()} FCFA
                        </p>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                        <button onClick={() => updateQty(item.id, item.quantity - 1)} style={qtyBtn}>−</button>
                        <span style={{ fontSize: 13, fontWeight: 700, minWidth: 18, textAlign: "center" }}>{item.quantity}</span>
                        <button onClick={() => updateQty(item.id, item.quantity + 1)} style={qtyBtn}>+</button>
                      </div>
                      <button onClick={() => removeItem(item.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#ddd", padding: 4 }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                          <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" />
                        </svg>
                      </button>
                    </div>
                  ))}
                  <button onClick={clearCart} style={{ background: "none", border: "none", color: "var(--muted)", fontSize: 12, cursor: "pointer", textAlign: "left", padding: "2px 0", textDecoration: "underline" }}>
                    Vider le panier
                  </button>
                </div>
              )}

              {items.length > 0 && (
                <div style={{ marginTop: 24, borderTop: "1px solid var(--border)", paddingTop: 20 }}>
                  <p style={{ fontFamily: "Syne", fontWeight: 600, fontSize: 14, marginBottom: 14 }}>📍 Où livrer ?</p>
                  <LocationPicker value={location} onChange={setLocation} showFee={true} />
                </div>
              )}
            </div>

            {items.length > 0 && (
              <div style={{ padding: "16px 24px", borderTop: "1px solid var(--border)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 13, color: "var(--muted)" }}>
                  <span>Sous-total</span><span>{totalPrice.toLocaleString()} FCFA</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14, fontSize: 13, color: "var(--muted)" }}>

                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 17, fontWeight: 700, marginBottom: 16 }}>
                  <span>Total</span>
                  <span style={{ color: "var(--brand)" }}>{location.quarter ? grand.toLocaleString() : totalPrice.toLocaleString()} FCFA</span>
                </div>
                <button onClick={() => setStep("contact")} disabled={!location.quarter}
                  style={{
                    width: "100%", padding: "14px", borderRadius: 12, border: "none",
                    background: location.quarter ? "var(--brand)" : "#ccc",
                    color: "#fff", fontFamily: "Syne", fontWeight: 700, fontSize: 15,
                    cursor: location.quarter ? "pointer" : "not-allowed",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  }}>
                  Continuer → Coordonnées
                </button>
              </div>
            )}
          </>
        )}

        {/* ── Step: Contact ─────────────────────────── */}
        {step === "contact" && (
          <>
            <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
              <p style={{ color: "var(--muted)", fontSize: 13, marginBottom: 24, lineHeight: 1.6 }}>
                Facultatif mais recommandé — pour vous tenir informé de votre commande.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label style={labelStyle}>Votre prénom</label>
                  <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex : Moussa" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Téléphone / WhatsApp</label>
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Ex : 77 000 00 00" type="tel" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Note pour le livreur (optionnel)</label>
                  <textarea value={note} onChange={(e) => setNote(e.target.value)}
                    placeholder="Ex : Sonner 2 fois, bâtiment B..."
                    style={{ ...inputStyle, height: 80, resize: "none" }} />
                </div>
              </div>

              {/* Recap */}
              <div style={{ marginTop: 24, background: "var(--surface)", borderRadius: 12, padding: "14px 16px", border: "1px solid var(--border)" }}>
                <p style={{ fontFamily: "Syne", fontWeight: 600, fontSize: 13, marginBottom: 10 }}>Récapitulatif</p>
                <div style={{ fontSize: 13, color: "var(--muted)", display: "flex", flexDirection: "column", gap: 4 }}>
                  <span>📍 {location.quarter}, {location.city}</span>
                  <span>🛒 {items.length} article(s)</span>
                  <span style={{ color: "var(--brand)", fontWeight: 700, fontSize: 15, marginTop: 4 }}>
                    Total : {grand.toLocaleString()} FCFA
                  </span>
                </div>
              </div>
            </div>

            <div style={{ padding: "16px 24px", borderTop: "1px solid var(--border)" }}>
              <button onClick={handleOrder} disabled={loading}
                style={{
                  width: "100%", padding: "14px", borderRadius: 12, border: "none",
                  background: loading ? "#ccc" : "var(--green)",
                  color: "#fff", fontFamily: "Syne", fontWeight: 700, fontSize: 15,
                  cursor: loading ? "not-allowed" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                }}>
                {loading ? (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                      style={{ animation: "spin 1s linear infinite" }}>
                      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                    </svg>
                    Envoi en cours…
                  </>
                ) : (
                  <>✅ Confirmer la commande</>
                )}
              </button>
              <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
            </div>
          </>
        )}

        {/* ── Step: Success ─────────────────────────── */}
        {step === "success" && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px 24px", textAlign: "center" }}>
            <div style={{ fontSize: 64, marginBottom: 16, animation: "fadeUp 0.5s ease" }}>🎉</div>
            <h2 style={{ fontFamily: "Syne", fontWeight: 800, fontSize: 22, marginBottom: 10 }}>
              Commande enregistrée !
            </h2>
            <p style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.6, marginBottom: 8 }}>
              Votre commande a bien été reçue par notre équipe.
            </p>
            {orderId && (
              <div style={{ background: "var(--surface)", borderRadius: 10, padding: "10px 18px", marginBottom: 20, border: "1px solid var(--border)" }}>
                <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 2 }}>Numéro de commande</p>
                <p style={{ fontFamily: "Syne", fontWeight: 700, fontSize: 15, color: "var(--brand)" }}>
                  #{orderId.slice(-8).toUpperCase()}
                </p>
              </div>
            )}
            <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6, marginBottom: 28, maxWidth: 300 }}>
              Un livreur vous contactera sous peu.
              {phone && ` Vous serez notifié au ${phone}.`}
            </p>
            <button onClick={handleClose} style={{
              background: "var(--brand)", color: "#fff", border: "none",
              padding: "12px 32px", borderRadius: 99,
              fontFamily: "Syne", fontWeight: 700, fontSize: 14, cursor: "pointer",
            }}>
              Fermer
            </button>
          </div>
        )}

        {/* ── Step: Error ───────────────────────────── */}
        {step === "error" && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px 24px", textAlign: "center" }}>
            <div style={{ fontSize: 52, marginBottom: 16 }}>😕</div>
            <h2 style={{ fontFamily: "Syne", fontWeight: 700, fontSize: 20, marginBottom: 10 }}>Une erreur est survenue</h2>
            <p style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
              Impossible d'enregistrer la commande. Vérifiez votre connexion ou réessayez.
            </p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
              <button onClick={() => setStep("contact")} style={{
                background: "var(--brand)", color: "#fff", border: "none",
                padding: "11px 24px", borderRadius: 99,
                fontFamily: "Syne", fontWeight: 700, fontSize: 14, cursor: "pointer",
              }}>Réessayer</button>
              <a href={`https://wa.me/22177XXXXXXX?text=${encodeURIComponent("Bonjour, j'essaie de commander mais le site ne fonctionne pas.")}`}
                target="_blank" rel="noopener noreferrer"
                style={{
                  background: "var(--green-light)", color: "var(--green)", border: "1px solid #b8f0d8",
                  padding: "11px 24px", borderRadius: 99,
                  fontWeight: 700, fontSize: 14, textDecoration: "none",
                }}>
                📲 WhatsApp
              </a>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

const qtyBtn: React.CSSProperties = {
  width: 26, height: 26, borderRadius: 8, background: "var(--border)", border: "none",
  cursor: "pointer", fontWeight: 700, fontSize: 14,
  display: "flex", alignItems: "center", justifyContent: "center",
};
const labelStyle: React.CSSProperties = {
  fontSize: 13, fontWeight: 600, color: "var(--muted)", display: "block", marginBottom: 6,
};
const inputStyle: React.CSSProperties = {
  width: "100%", padding: "11px 14px", borderRadius: 10,
  border: "1px solid var(--border)", fontSize: 14,
  outline: "none", fontFamily: "DM Sans, sans-serif", background: "#fff",
};
