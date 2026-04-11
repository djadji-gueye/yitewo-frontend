"use client";
import { useState, useCallback, useRef } from "react";

interface GeoSuggestion { display_name: string; lat: string; lon: string; address: any; }
interface Props {
  value: string;
  onChange: (address: string, lat?: number, lng?: number) => void;
}

export default function AddressPicker({ value, onChange }: Props) {
  const [query, setQuery]           = useState(value);
  const [suggestions, setSuggestions] = useState<GeoSuggestion[]>([]);
  const [loading, setLoading]       = useState(false);
  const [selected, setSelected]     = useState(!!value);
  const debRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback(async (q: string) => {
    if (q.length < 3) { setSuggestions([]); return; }
    setLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q + " Sénégal")}&format=json&addressdetails=1&limit=5&accept-language=fr&countrycodes=sn`,
        { headers: { "Accept-Language": "fr" } }
      );
      setSuggestions(await res.json());
    } catch { setSuggestions([]); }
    finally { setLoading(false); }
  }, []);

  const handleInput = (val: string) => {
    setQuery(val); setSelected(false);
    if (debRef.current) clearTimeout(debRef.current);
    debRef.current = setTimeout(() => search(val), 380);
  };

  const select = (s: GeoSuggestion) => {
    const a = s.address;
    const parts = [
      a.road || a.pedestrian,
      a.suburb || a.neighbourhood || a.quarter || a.village,
      a.city || a.town || a.municipality || a.county,
    ].filter(Boolean);
    const label = parts.join(", ");
    setQuery(label); setSuggestions([]); setSelected(true);
    onChange(label, parseFloat(s.lat), parseFloat(s.lon));
  };

  return (
    <div style={{ position: "relative" }}>
      <div style={{ position: "relative" }}>
        <input value={query} onChange={(e) => handleInput(e.target.value)}
          placeholder="Rechercher une adresse, rue, quartier…"
          style={{ width: "100%", padding: "10px 38px 10px 14px", borderRadius: 10, border: `1.5px solid ${selected ? "#10b981" : "#f0ebe8"}`, background: selected ? "#f0fdf6" : "#fff", fontSize: 14, outline: "none", fontFamily: "DM Sans, sans-serif", color: "#1a1a1a", transition: "border-color 0.2s", boxSizing: "border-box" as const }}
        />
        {loading && <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", fontSize: 12, color: "#aaa" }}>⏳</span>}
        {selected && !loading && <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", fontSize: 14, color: "#10b981" }}>✓</span>}
        {query && !selected && !loading && (
          <button onClick={() => { setQuery(""); setSuggestions([]); setSelected(false); onChange(""); }}
            style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 14, color: "#aaa" }}>✕</button>
        )}
      </div>
      {suggestions.length > 0 && (
        <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, background: "#fff", border: "1px solid #f0ebe8", borderRadius: 12, boxShadow: "0 8px 32px rgba(0,0,0,0.12)", zIndex: 200, overflow: "hidden" }}>
          {suggestions.map((s, i) => (
            <button key={i} type="button" onClick={() => select(s)}
              style={{ display: "block", width: "100%", textAlign: "left", padding: "11px 16px", background: "none", border: "none", borderBottom: i < suggestions.length - 1 ? "1px solid #f7f4f2" : "none", cursor: "pointer", fontSize: 13, color: "#1a1a1a" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#fafaf8")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
            >
              <span style={{ fontWeight: 600 }}>📍 {s.display_name.split(",").slice(0, 2).join(",")}</span>
              <span style={{ display: "block", fontSize: 11, color: "#aaa", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.display_name}</span>
            </button>
          ))}
        </div>
      )}
      {query.length >= 3 && !loading && suggestions.length === 0 && !selected && (
        <p style={{ fontSize: 12, color: "#aaa", marginTop: 6 }}>Aucun résultat — essayez un autre nom.</p>
      )}
    </div>
  );
}
