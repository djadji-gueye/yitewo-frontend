"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_URL_PROD}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || "Email ou mot de passe incorrect");
      }
      const data = await res.json();
      localStorage.setItem("yitewo_token", data.accessToken);
      router.replace("/dashboard");
    } catch (err: any) {
      setError(err?.message || "Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", background: "#0d0d14",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 20, fontFamily: "DM Sans, sans-serif",
    }}>
      <div style={{
        position: "fixed", inset: 0, zIndex: 0,
        backgroundImage: "radial-gradient(circle at 20% 50%, rgba(232,56,13,0.08) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(45,45,143,0.12) 0%, transparent 50%)",
      }} />
      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 400 }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 32, color: "#fff", marginBottom: 8 }}>
            yite<span style={{ color: "#E8380D" }}>wo</span>
          </div>
          <p style={{ color: "#555", fontSize: 13, letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 500 }}>
            Dashboard Admin
          </p>
        </div>

        <div style={{
          background: "#13131f", border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 20, padding: "36px 32px",
          boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
        }}>
          <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 22, color: "#fff", marginBottom: 6 }}>
            Connexion
          </h1>
          <p style={{ color: "#555", fontSize: 13, marginBottom: 28 }}>Accès réservé à l'équipe Yitewo</p>

          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={labelStyle}>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@yitewo.sn" required style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "#E8380D")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")} />
            </div>
            <div>
              <label style={labelStyle}>Mot de passe</label>
              <div style={{ position: "relative" }}>
                <input type={showPass ? "text" : "password"} value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" required
                  style={{ ...inputStyle, paddingRight: 44 }}
                  onFocus={(e) => (e.target.style.borderColor = "#E8380D")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")} />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{
                  position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer", color: "#555",
                }}>
                  {showPass
                    ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>
            </div>

            {error && (
              <div style={{ background: "rgba(232,56,13,0.12)", border: "1px solid rgba(232,56,13,0.3)", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#ff8a70" }}>
                ❌ {error}
              </div>
            )}

            <button type="submit" disabled={loading || !email || !password} style={{
              padding: "13px", borderRadius: 10, border: "none",
              background: (email && password) ? "#E8380D" : "#2a2a2a",
              color: "#fff", fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 15,
              cursor: (email && password) ? "pointer" : "not-allowed",
              marginTop: 4, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              transition: "all 0.2s",
            }}>
              {loading ? "Connexion…" : "Se connecter"}
            </button>
          </form>
        </div>
        <p style={{ textAlign: "center", color: "#333", fontSize: 12, marginTop: 24 }}>
          © {new Date().getFullYear()} Yitewo — Accès sécurisé
        </p>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  fontSize: 12, fontWeight: 600, color: "#666", display: "block",
  marginBottom: 8, letterSpacing: "0.05em", textTransform: "uppercase",
};
const inputStyle: React.CSSProperties = {
  width: "100%", padding: "12px 16px", borderRadius: 10,
  background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
  color: "#fff", fontSize: 14, outline: "none", fontFamily: "DM Sans, sans-serif",
  transition: "border-color 0.2s",
};
