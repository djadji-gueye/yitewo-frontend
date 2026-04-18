"use client";

import { useState, useRef, useCallback } from "react";

// ─── Config ───────────────────────────────────────────────
const BASE = process.env.NEXT_PUBLIC_URL_PROD || "http://localhost:3003";
const MAX_SIZE_MB  = 5;    // 5MB max — cohérent avec multer backend
const MAX_SIZE_B   = MAX_SIZE_MB * 1024 * 1024;

// Qualité réduite côté client avant envoi → économise le quota Cloudinary
const COMPRESS_WIDTH  = 1200; // px max
const COMPRESS_QUALITY = 0.82; // 82% qualité JPEG

export interface UploadResult {
  url:       string;  // URL Cloudinary finale
  publicId:  string;  // pour suppression future
}

export interface CloudinaryUploaderProps {
  value:     string[];                      // URLs actuelles
  onChange:  (urls: string[]) => void;
  token?:    string;                        // token portail partenaire (si besoin auth)
  folder?:   string;                        // dossier Cloudinary : products | partners | opportunities
  max?:      number;                        // nb max de photos
  label?:    string;
  aspect?:   "square" | "banner" | "free"; // ratio aperçu
  hint?:     string;
}

// ── Compression client avant upload ───────────────────────
async function compressImage(file: File): Promise<Blob> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      if (width > COMPRESS_WIDTH) {
        height = Math.round((height * COMPRESS_WIDTH) / width);
        width  = COMPRESS_WIDTH;
      }
      const canvas = document.createElement("canvas");
      canvas.width  = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => resolve(blob || file),
        "image/jpeg",
        COMPRESS_QUALITY
      );
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(file); };
    img.src = url;
  });
}

export default function CloudinaryUploader({
  value    = [],
  onChange,
  token,
  folder   = "products",
  max      = 5,
  label    = "Photos",
  aspect   = "free",
  hint,
}: CloudinaryUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [progress,  setProgress]  = useState(0);
  const [error,     setError]     = useState("");
  const [activeIdx, setActiveIdx] = useState(0);
  const [dragging,  setDragging]  = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // ── Upload via backend NestJS → Cloudinary ────────────
  const uploadFile = useCallback(async (file: File): Promise<string> => {
    if (file.size > MAX_SIZE_B) throw new Error(`Image trop lourde (max ${MAX_SIZE_MB}MB)`);

    // Compression avant envoi
    const compressed = await compressImage(file);
    const formData   = new FormData();
    formData.append("file", compressed, file.name);
    formData.append("folder", folder);
    if (token) formData.append("token", token);

    const endpoint = token
      ? `${BASE}/upload/partner`     // endpoint authentifié par token
      : `${BASE}/upload/public`;     // endpoint public (opportunités)

    const res = await fetch(endpoint, { method: "POST", body: formData });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.message || `Erreur upload (${res.status})`);
    }
    const data = await res.json();
    return data.url;
  }, [folder, token]);

  // ── Gestion fichiers ──────────────────────────────────
  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setError("");

    const remaining = max - value.length;
    if (remaining <= 0) { setError(`Maximum ${max} photo${max > 1 ? "s" : ""} atteint`); return; }

    const toUpload = Array.from(files).slice(0, remaining);
    setUploading(true);
    setProgress(0);

    const newUrls: string[] = [];
    for (let i = 0; i < toUpload.length; i++) {
      try {
        const url = await uploadFile(toUpload[i]);
        newUrls.push(url);
        setProgress(Math.round(((i + 1) / toUpload.length) * 100));
      } catch (e: any) {
        setError(e.message || "Erreur lors de l'upload");
      }
    }

    const updated = [...value, ...newUrls];
    onChange(updated);
    setActiveIdx(value.length);
    setUploading(false);
    setProgress(0);
  }, [max, value, uploadFile, onChange]);

  const removePhoto = (idx: number) => {
    const updated = value.filter((_, i) => i !== idx);
    onChange(updated);
    setActiveIdx(Math.max(0, idx - 1));
  };

  // ── Drag & Drop ───────────────────────────────────────
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  // ── Aspect ratio aperçu ───────────────────────────────
  const aspectStyle: React.CSSProperties = {
    square: { aspectRatio: "1/1",  maxHeight: 220 },
    banner: { aspectRatio: "4/1",  maxHeight: 120 },
    free:   { aspectRatio: "16/9", maxHeight: 260 },
  }[aspect];

  return (
    <div>
      {/* Label */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <label style={{ fontSize: 13, fontWeight: 600, color: "var(--muted)" }}>
          {label}
          {max > 1 && <span style={{ fontWeight: 400 }}> ({value.length}/{max})</span>}
        </label>
        <span style={{ fontSize: 11, color: "var(--muted)" }}>JPG · PNG · max {MAX_SIZE_MB}MB</span>
      </div>

      {/* Aperçu */}
      {value.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          {/* Image active */}
          <div style={{ borderRadius: 12, overflow: "hidden", background: "#f7f4f2", position: "relative", marginBottom: 8, ...aspectStyle }}>
            <img
              src={value[activeIdx] ?? value[0]}
              alt="Aperçu"
              style={{ width: "100%", height: "100%", objectFit: aspect === "free" ? "contain" : "cover", display: "block" }}
            />
            {/* Badges */}
            {max > 1 && (
              <div style={{ position: "absolute", top: 8, left: 8, background: "rgba(0,0,0,.55)", borderRadius: 99, padding: "3px 10px", fontSize: 11, color: "#fff", fontWeight: 600 }}>
                {activeIdx === 0 ? "🖼 Principale" : `Photo ${activeIdx + 1}`}
              </div>
            )}
            {/* Supprimer */}
            <button onClick={() => removePhoto(activeIdx)} style={{ position: "absolute", top: 8, right: 8, width: 28, height: 28, borderRadius: 99, background: "rgba(0,0,0,.6)", border: "none", color: "#fff", fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
          </div>

          {/* Miniatures (multi-photos uniquement) */}
          {max > 1 && value.length > 1 && (
            <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4, scrollbarWidth: "none" }}>
              {value.map((url, i) => (
                <button key={i} onClick={() => setActiveIdx(i)}
                  style={{ width: 56, height: 56, borderRadius: 8, overflow: "hidden", flexShrink: 0, border: `2px solid ${activeIdx === i ? "var(--brand)" : "transparent"}`, padding: 0, cursor: "pointer", background: "#f0f0f0", transition: "border .15s" }}>
                  <img src={url} alt={`Photo ${i + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Zone upload */}
      {value.length < max && (
        <div
          onDrop={onDrop}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onClick={() => !uploading && inputRef.current?.click()}
          style={{
            border: `1.5px dashed ${dragging ? "var(--brand)" : "var(--border)"}`,
            borderRadius: 12,
            padding: uploading ? "16px 12px" : "22px 16px",
            textAlign: "center",
            cursor: uploading ? "not-allowed" : "pointer",
            background: dragging ? "var(--brand-light)" : "#fafaf8",
            transition: "all .15s",
          }}
        >
          {uploading ? (
            <div>
              <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 8 }}>
                ⏳ Upload en cours… {progress}%
              </div>
              <div style={{ width: "100%", height: 4, background: "#f0ebe8", borderRadius: 99, overflow: "hidden" }}>
                <div style={{ height: "100%", background: "var(--brand)", borderRadius: 99, width: `${progress}%`, transition: "width .3s" }} />
              </div>
            </div>
          ) : (
            <>
              <div style={{ fontSize: 26, marginBottom: 6 }}>📸</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 2 }}>
                {value.length === 0
                  ? (max === 1 ? "Choisir une photo" : "Glisse tes photos ici")
                  : `Ajouter ${max - value.length} photo${max - value.length > 1 ? "s" : ""} de plus`}
              </div>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>
                ou <span style={{ color: "var(--brand)", fontWeight: 600 }}>cliquer pour sélectionner</span>
              </div>
            </>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple={max > 1}
        style={{ display: "none" }}
        onChange={(e) => handleFiles(e.target.files)}
        onClick={(e) => { (e.target as HTMLInputElement).value = ""; }}
      />

      {error && (
        <div style={{ marginTop: 8, fontSize: 12, color: "#ef4444", background: "#fee2e2", borderRadius: 8, padding: "6px 10px" }}>
          ❌ {error}
        </div>
      )}

      {hint && (
        <p style={{ fontSize: 11, color: "var(--muted)", marginTop: 6, lineHeight: 1.6 }}>{hint}</p>
      )}
    </div>
  );
}
