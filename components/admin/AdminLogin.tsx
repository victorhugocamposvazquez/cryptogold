"use client";

import { useState } from "react";
import { css } from "@/lib/css";
import { Logo } from "@/components/ui";
import { OPS_CENTER_NAME, OPS_CENTER_TAGLINE } from "@/lib/brand";

export default function AdminLogin({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/cryptohost/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        setError("Contraseña incorrecta");
        return;
      }
      onSuccess();
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={css("min-height:100vh;background:#0D0D0D;display:flex;align-items:center;justify-content:center;padding:24px")}>
      <form
        onSubmit={submit}
        style={css("width:100%;max-width:380px;background:#161616;border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:32px")}
      >
        <div style={css("display:flex;align-items:center;gap:12px;margin-bottom:24px")}>
          <Logo height={36} />
          <div>
            <div style={css("font:700 18px var(--font-hanken);color:#fff")}>{OPS_CENTER_NAME}</div>
            <div style={css("font:400 13px var(--font-hanken);color:#9A9AA0")}>{OPS_CENTER_TAGLINE}</div>
          </div>
        </div>
        <label style={css("display:block;font:500 13px var(--font-hanken);color:#C8C8CE;margin-bottom:8px")}>Contraseña</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          style={css("width:100%;box-sizing:border-box;background:#0D0D0D;border:1px solid rgba(255,255,255,0.12);border-radius:10px;padding:12px 14px;font:400 15px var(--font-hanken);color:#fff;margin-bottom:16px")}
        />
        {error && <p style={css("font:400 13px var(--font-hanken);color:#E05252;margin:0 0 12px")}>{error}</p>}
        <button
          type="submit"
          disabled={loading}
          style={css("width:100%;background:#C9A227;color:#0D0D0D;border:none;border-radius:10px;padding:14px;font:600 15px var(--font-hanken);cursor:pointer")}
        >
          {loading ? "Entrando…" : "Entrar al backoffice"}
        </button>
      </form>
    </div>
  );
}
