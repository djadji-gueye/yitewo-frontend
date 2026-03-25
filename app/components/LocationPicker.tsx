"use client";

import { useState, useCallback } from "react";

const ZONES_BY_CITY: Record<string, string[]> = {
  "Saint-Louis": [
    "Île de Saint-Louis - Sud","Île de Saint-Louis - Nord","Guet Ndar","Santhiaba",
    "Sor Daga","Sor Diagne","Darou","Diamaguène","Ndioloffène","Ngallèle","Balacos",
    "Goxu Mbathie","Hydrobase","Cité Vauvert","Cité Niakh","Cité Fayçal","Cité Flamants",
    "Boudiouck","Leona","Cité Sotrac","Cité Tamsir","Cité Universitaire / UGB","Gandiol","Bango","Khor",
  ],
  Dakar: ["Ouest-Foire","Point E","Hann","Grand-Yoff","HLM","Mermoz","Almadies","Yoff"],
};

const HIGH_FEE = ["Cité Universitaire / UGB","Gandiol","Ngallèle","Bango","Cité Vauvert"];

// Bounding boxes approx pour détecter la ville via GPS
const CITY_BOUNDS: Record<string, { latMin: number; latMax: number; lngMin: number; lngMax: number }> = {
  "Dakar":       { latMin: 14.60, latMax: 14.80, lngMin: -17.55, lngMax: -17.30 },
  "Saint-Louis": { latMin: 15.90, latMax: 16.10, lngMin: -16.60, lngMax: -16.40 },
};

function detectCityFromCoords(lat: number, lng: number): string | null {
  for (const [city, b] of Object.entries(CITY_BOUNDS)) {
    if (lat >= b.latMin && lat <= b.latMax && lng >= b.lngMin && lng <= b.lngMax) {
      return city;
    }
  }
  return null;
}

async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=fr`,
      { headers: { "User-Agent": "Yitewo/1.0" } }
    );
    const data = await res.json();
    const suburb =
      data?.address?.suburb ||
      data?.address?.neighbourhood ||
      data?.address?.quarter ||
      data?.address?.city_district ||
      "";
    return suburb;
  } catch {
    return "";
  }
}

export interface LocationValue {
  city: string;
  quarter: string;
  deliveryFee: number;
}

interface Props {
  value: LocationValue;
  onChange: (v: LocationValue) => void;
  showFee?: boolean;
}

type GeoStatus = "idle" | "loading" | "success" | "denied" | "out_of_zone";

export default function LocationPicker({ value, onChange, showFee = true }: Props) {
  const [geoStatus, setGeoStatus] = useState<GeoStatus>("idle");
  const [manual, setManual] = useState(false);
  const [detectedInfo, setDetectedInfo] = useState("");

  const setLocation = useCallback(
    (city: string, quarter: string) => {
      const fee = HIGH_FEE.includes(quarter) ? 1000 : 500;
      onChange({ city, quarter, deliveryFee: fee });
    },
    [onChange]
  );

  const handleGeolocate = useCallback(async () => {
    if (!navigator.geolocation) {
      setManual(true);
      return;
    }
    setGeoStatus("loading");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const city = detectCityFromCoords(latitude, longitude);

        if (!city) {
          setGeoStatus("out_of_zone");
          setManual(true);
          return;
        }

        // Try to match suburb via Nominatim
        const suburb = await reverseGeocode(latitude, longitude);
        const zones = ZONES_BY_CITY[city];

        // Try fuzzy match
        const matched = zones.find((z) =>
          z.toLowerCase().includes(suburb.toLowerCase()) ||
          suburb.toLowerCase().includes(z.toLowerCase().split(" ")[0])
        );

        setGeoStatus("success");
        setDetectedInfo(suburb || city);
        if (matched) {
          setLocation(city, matched);
        } else {
          // City detected but quarter not matched → show manual quarter picker
          onChange({ city, quarter: "", deliveryFee: 0 });
          setManual(true);
        }
      },
      () => {
        setGeoStatus("denied");
        setManual(true);
      },
      { timeout: 8000 }
    );
  }, [onChange, setLocation]);

  const zones = ZONES_BY_CITY[value.city] || [];

  return (
    <div>
      {/* GPS Button — shown when not yet located */}
      {geoStatus === "idle" && !manual && (
        <div style={{ textAlign: "center", marginBottom: 12 }}>
          <button
            onClick={handleGeolocate}
            style={{
              display: "inline-flex", alignItems: "center", gap: 10,
              padding: "12px 24px", borderRadius: 99,
              background: "var(--brand)", color: "#fff",
              border: "none", fontWeight: 700, fontSize: 14,
              cursor: "pointer", fontFamily: "Syne, sans-serif",
              boxShadow: "0 4px 16px rgba(232,56,13,0.25)",
              transition: "transform 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.03)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M1 12h4M19 12h4"/>
              <circle cx="12" cy="12" r="10" strokeDasharray="2 4"/>
            </svg>
            Me localiser automatiquement
          </button>
          <p style={{ marginTop: 8, fontSize: 12, color: "var(--muted)" }}>
            ou{" "}
            <button
              onClick={() => setManual(true)}
              style={{ background: "none", border: "none", color: "var(--brand)", fontWeight: 600, cursor: "pointer", fontSize: 12 }}
            >
              choisir manuellement
            </button>
          </p>
        </div>
      )}

      {/* Loading */}
      {geoStatus === "loading" && (
        <div style={{
          display: "flex", alignItems: "center", gap: 10, justifyContent: "center",
          padding: "14px", borderRadius: 12, background: "var(--brand-light)",
          marginBottom: 12, fontSize: 14, color: "var(--brand)",
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
            style={{ animation: "spin 1s linear infinite" }}>
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
          </svg>
          <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
          Localisation en cours…
        </div>
      )}

      {/* Success banner */}
      {geoStatus === "success" && value.quarter && (
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "12px 16px", borderRadius: 12,
          background: "var(--green-light)", border: "1px solid #b8f0d8",
          marginBottom: 12, fontSize: 13,
        }}>
          <span style={{ fontSize: 18 }}>📍</span>
          <div style={{ flex: 1 }}>
            <span style={{ fontWeight: 600, color: "var(--green)" }}>Zone détectée : </span>
            <span>{value.quarter}, {value.city}</span>
            {showFee && (
              <span style={{ marginLeft: 8, color: "var(--muted)", fontSize: 12 }}>
                — Livraison {value.deliveryFee.toLocaleString()} FCFA
              </span>
            )}
          </div>
          <button
            onClick={() => { setManual(true); setGeoStatus("idle"); }}
            style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: 12, textDecoration: "underline" }}
          >
            Modifier
          </button>
        </div>
      )}

      {/* Out of zone warning */}
      {geoStatus === "out_of_zone" && (
        <div style={{
          padding: "12px 16px", borderRadius: 12,
          background: "#fff8e6", border: "1px solid #fcd34d",
          marginBottom: 12, fontSize: 13, color: "#92400e",
        }}>
          ⚠️ Localisation non reconnue. Choisissez votre ville manuellement.
        </div>
      )}

      {/* Denied warning */}
      {geoStatus === "denied" && (
        <div style={{
          padding: "12px 16px", borderRadius: 12,
          background: "#fff8e6", border: "1px solid #fcd34d",
          marginBottom: 12, fontSize: 13, color: "#92400e",
        }}>
          📵 Localisation refusée. Choisissez votre zone manuellement.
        </div>
      )}

      {/* Manual picker */}
      {(manual || (geoStatus === "success" && !value.quarter)) && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {/* City toggle */}
          <div style={{ display: "flex", gap: 8 }}>
            {Object.keys(ZONES_BY_CITY).map((c) => (
              <button
                key={c}
                onClick={() => onChange({ city: c, quarter: "", deliveryFee: 0 })}
                style={{
                  flex: 1, padding: "9px",
                  borderRadius: 10, fontSize: 13, cursor: "pointer",
                  border: "2px solid " + (value.city === c ? "var(--brand)" : "var(--border)"),
                  background: value.city === c ? "var(--brand-light)" : "#fff",
                  color: value.city === c ? "var(--brand)" : "var(--muted)",
                  fontWeight: value.city === c ? 700 : 400,
                  transition: "all 0.18s",
                }}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Quarter dropdown */}
          <select
            value={value.quarter}
            onChange={(e) => setLocation(value.city, e.target.value)}
            style={{
              width: "100%", padding: "11px 14px", borderRadius: 10,
              border: "1px solid var(--border)", fontSize: 13,
              background: "#fff", outline: "none",
              color: value.quarter ? "var(--text)" : "var(--muted)",
            }}
          >
            <option value="">Choisir votre quartier…</option>
            {zones.map((q) => (
              <option key={q} value={q}>
                {q}{showFee ? ` — ${HIGH_FEE.includes(q) ? "1 000" : "500"} FCFA` : ""}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
