"use client";

import { useState, useCallback, useRef } from "react";

interface GeoSuggestion {
  display_name: string;
  lat: string;
  lon: string;
  address: any;
}

export interface LocationValue {
  city: string;
  quarter: string;
  deliveryFee: number;
}

interface Props {
  value: LocationValue;
  onChange: (v: LocationValue) => void;
  showFee?: boolean; // kept for API compat but ignored
}

export default function LocationPicker({ value, onChange }: Props) {
  const [query, setQuery] = useState(value.quarter ? `${value.quarter}, ${value.city}` : "");
  const [suggestions, setSuggestions] = useState<GeoSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(!!value.quarter);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const search = useCallback(async (q: string) => {
    if (q.length < 3) { setSuggestions([]); return; }
    setLoading(true);
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q + " Sénégal")}&format=json&addressdetails=1&limit=6&accept-language=fr&countrycodes=sn`;
      const res = await fetch(url, { headers: { "Accept-Language": "fr" } });
      setSuggestions(await res.json());
    } catch { setSuggestions([]); }
    finally { setLoading(false); }
  }, []);

  const handleInput = (val: string) => {
    setQuery(val);
    setSelected(false);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(val), 380);
  };

  const select = (s: GeoSuggestion) => {
    const addr = s.address;
    const city =
      addr.city || addr.town || addr.municipality ||
      addr.county || addr.state || "Sénégal";
    const quarter =
      addr.suburb || addr.neighbourhood || addr.quarter ||
      addr.village || addr.hamlet || addr.road ||
      addr.city_district || city;
    const label = [quarter !== city ? quarter : null, city].filter(Boolean).join(", ");
    setQuery(label);
    setSelected(true);
    setSuggestions([]);
    onChange({ city, quarter, deliveryFee: 0 });
  };

  const shortLabel = (s: GeoSuggestion) => {
    const a = s.address;
    const parts = [
      a.suburb || a.neighbourhood || a.quarter || a.road || a.village,
      a.city || a.town || a.municipality,
    ].filter(Boolean);
    return parts.length ? parts.join(", ") : s.display_name.split(",").slice(0, 2).join(", ");
  };

  return (
    <div ref={dropdownRef} style={{ position: "relative" }}>
      <div style={{ position: "relative" }}>
        <span style={{
          position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)",
          fontSize: 16, pointerEvents: "none", zIndex: 1,
        }}>📍</span>
        <input
          value={query}
          onChange={(e) => handleInput(e.target.value)}
          placeholder="Tapez votre quartier, ville… (ex: Mermoz, Thiès, Ziguinchor)"
          autoComplete="off"
          style={{
            width: "100%", padding: "12px 40px 12px 40px",
            borderRadius: 10, fontSize: 14, outline: "none",
            border: `1.5px solid ${selected ? "var(--green)" : "var(--border)"}`,
            background: selected ? "var(--green-light, #f0fdf6)" : "#fff",
            fontFamily: "DM Sans, sans-serif", boxSizing: "border-box",
            transition: "border-color 0.2s",
          }}
        />
        {loading && (
          <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: "#aaa" }}>⏳</span>
        )}
        {selected && !loading && (
          <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", fontSize: 14, color: "var(--green)" }}>✓</span>
        )}
        {query && !selected && !loading && (
          <button
            onClick={() => { setQuery(""); setSuggestions([]); setSelected(false); onChange({ city: "", quarter: "", deliveryFee: 0 }); }}
            style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 14, color: "#aaa" }}
          >✕</button>
        )}
      </div>

      {/* Suggestions dropdown */}
      {suggestions.length > 0 && (
        <div style={{
          position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0,
          background: "#fff", border: "1px solid var(--border, #e5e5e5)",
          borderRadius: 12, boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
          zIndex: 100, overflow: "hidden",
        }}>
          {suggestions.map((s, i) => (
            <button
              key={i}
              type="button"
              onClick={() => select(s)}
              style={{
                display: "block", width: "100%", textAlign: "left",
                padding: "11px 16px", background: "none", border: "none",
                borderBottom: i < suggestions.length - 1 ? "1px solid #f5f5f5" : "none",
                cursor: "pointer", fontSize: 13, color: "#1a1a1a",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#fafafa")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
            >
              <span style={{ fontWeight: 600 }}>📍 {shortLabel(s)}</span>
              <span style={{ display: "block", fontSize: 11, color: "#aaa", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {s.display_name}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* No results hint */}
      {query.length >= 3 && !loading && suggestions.length === 0 && !selected && (
        <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 6, paddingLeft: 2 }}>
          Aucun résultat — essayez un autre nom de quartier ou de ville.
        </p>
      )}
    </div>
  );
}
