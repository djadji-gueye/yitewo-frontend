"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

const BASE = process.env.NEXT_PUBLIC_URL_PROD || "http://localhost:3003";

const DAYS = [
  { key: "lun", label: "Lundi" },
  { key: "mar", label: "Mardi" },
  { key: "mer", label: "Mercredi" },
  { key: "jeu", label: "Jeudi" },
  { key: "ven", label: "Vendredi" },
  { key: "sam", label: "Samedi" },
  { key: "dim", label: "Dimanche" },
];

const defaultHours = () => Object.fromEntries(
  DAYS.map((d) => [d.key, { open: true, from: "08:00", to: "18:00" }])
);

export default function DisponibilitesPage() {
  const params = useParams();
  const token = params?.token as string;

  const [hours, setHours] = useState<Record<string, { open: boolean; from: string; to: string }>>(defaultHours());
  const [disponibilite, setDisponibilite] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const DISPO_OPTIONS = ["Matin", "Après-midi", "Soir", "Weekend", "Urgences", "Sur rendez-vous"];

  useEffect(() => {
    if (!token) return;
    fetch(`${BASE}/partners/portal/${token}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.openingHours && typeof data.openingHours === "object") setHours(data.openingHours);
        if (data.disponibilite) {
          setDisponibilite(
            typeof data.disponibilite === "string"
              ? data.disponibilite.split(",").map((d: string) => d.trim()).filter(Boolean)
              : data.disponibilite
          );
        }
      })
      .finally(() => setLoading(false));
  }, [token]);

  const toggleDispo = (d: string) => {
    setDisponibilite((prev) => prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch(`${BASE}/partners/portal/${token}/profile`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ openingHours: hours, disponibilite: disponibilite.join(", ") }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch { /* silencieux */ }
    finally { setSaving(false); }
  };

  const inp: React.CSSProperties = { padding: "8px 10px", borderRadius: 8, border: "1px solid #f0ebe8", fontSize: 13, outline: "none", fontFamily: "DM Sans, sans-serif", background: "#fff", color: "#1a1a1a" };
  const card: React.CSSProperties = { background: "#fff", borderRadius: 16, border: "1px solid #f0ebe8", padding: "20px", marginBottom: 16 };

  if (loading) return <div style={{ textAlign: "center", padding: 60, color: "#aaa" }}>Chargement…</div>;

  return (
    <div style={{ maxWidth: 600, fontFamily: "DM Sans, sans-serif" }}>
      <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 22, color: "#1a1a1a", marginBottom: 6 }}>Disponibilités</h1>
      <p style={{ fontSize: 13, color: "#aaa", marginBottom: 24, lineHeight: 1.6 }}>
        Indiquez vos créneaux et horaires. Ces infos s'affichent sur votre profil public pour aider les clients à vous contacter au bon moment.
      </p>

      {/* Créneaux rapides */}
      <section style={card}>
        <h2 style={{ fontFamily: "Syne", fontWeight: 700, fontSize: 15, color: "#1a1a1a", marginBottom: 14 }}>Créneaux disponibles</h2>
        <p style={{ fontSize: 12, color: "#aaa", marginBottom: 14 }}>Sélectionnez tous ceux qui s'appliquent.</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {DISPO_OPTIONS.map((d) => {
            const active = disponibilite.includes(d);
            return (
              <button key={d} onClick={() => toggleDispo(d)} style={{
                padding: "8px 16px", borderRadius: 99, fontSize: 13, cursor: "pointer",
                border: `1.5px solid ${active ? "#E8380D" : "#f0ebe8"}`,
                background: active ? "#fff5f3" : "#fff",
                color: active ? "#E8380D" : "#6b6b6b",
                fontWeight: active ? 700 : 400, transition: "all 0.15s",
              }}>
                {active ? "✓ " : ""}{d}
              </button>
            );
          })}
        </div>
      </section>

      {/* Horaires par jour */}
      <section style={card}>
        <h2 style={{ fontFamily: "Syne", fontWeight: 700, fontSize: 15, color: "#1a1a1a", marginBottom: 6 }}>Horaires détaillés</h2>
        <p style={{ fontSize: 12, color: "#aaa", marginBottom: 16 }}>Configurez vos heures jour par jour.</p>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {DAYS.map((day) => {
            const h = hours[day.key] ?? { open: true, from: "08:00", to: "18:00" };
            return (
              <div key={day.key} style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "10px 14px", borderRadius: 12,
                background: h.open ? "#fff" : "#f9f9f9",
                border: `1px solid ${h.open ? "#f0ebe8" : "#ebebeb"}`,
              }}>
                {/* Toggle */}
                <div onClick={() => setHours((prev) => ({ ...prev, [day.key]: { ...h, open: !h.open } }))}
                  style={{ width: 40, height: 22, borderRadius: 99, flexShrink: 0, background: h.open ? "#E8380D" : "#d1d5db", position: "relative", cursor: "pointer", transition: "background 0.2s" }}>
                  <div style={{ position: "absolute", top: 2, left: h.open ? 20 : 2, width: 18, height: 18, borderRadius: "50%", background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.2)", transition: "left 0.2s" }} />
                </div>

                <span style={{ fontSize: 13, fontWeight: 600, minWidth: 72, color: h.open ? "#1a1a1a" : "#aaa" }}>{day.label}</span>

                {h.open ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
                    <input type="time" value={h.from}
                      onChange={(e) => setHours((prev) => ({ ...prev, [day.key]: { ...h, from: e.target.value } }))}
                      style={{ ...inp, flex: 1 }} />
                    <span style={{ fontSize: 12, color: "#aaa" }}>→</span>
                    <input type="time" value={h.to}
                      onChange={(e) => setHours((prev) => ({ ...prev, [day.key]: { ...h, to: e.target.value } }))}
                      style={{ ...inp, flex: 1 }} />
                  </div>
                ) : (
                  <span style={{ fontSize: 12, color: "#aaa", fontStyle: "italic" }}>Indisponible</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Raccourcis */}
        <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
          {[
            { label: "Lun–Ven", action: () => setHours(Object.fromEntries(DAYS.map((d) => [d.key, { open: !["sam","dim"].includes(d.key), from: "08:00", to: "18:00" }]))) },
            { label: "Lun–Sam", action: () => setHours(Object.fromEntries(DAYS.map((d) => [d.key, { open: d.key !== "dim", from: "08:00", to: "18:00" }]))) },
            { label: "7j/7", action: () => setHours(Object.fromEntries(DAYS.map((d) => [d.key, { open: true, from: "08:00", to: "18:00" }]))) },
          ].map(({ label, action }) => (
            <button key={label} onClick={action}
              style={{ fontSize: 11, padding: "5px 12px", borderRadius: 99, border: "1px solid #f0ebe8", background: "#fff", color: "#6b6b6b", cursor: "pointer" }}>
              {label}
            </button>
          ))}
        </div>
      </section>

      {/* Feedback + Save */}
      {saved && (
        <div style={{ background: "#d1fae5", border: "1px solid #a7f3d0", borderRadius: 10, padding: "10px 14px", marginBottom: 14, fontSize: 13, color: "#065f46" }}>
          ✅ Disponibilités mises à jour avec succès
        </div>
      )}

      <button onClick={handleSave} disabled={saving} style={{
        width: "100%", padding: "13px", borderRadius: 12, border: "none",
        background: saving ? "#f7f4f2" : "#E8380D", color: saving ? "#aaa" : "#fff",
        fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 15,
        cursor: saving ? "not-allowed" : "pointer",
      }}>
        {saving ? "Enregistrement…" : "💾 Enregistrer les disponibilités"}
      </button>
    </div>
  );
}
