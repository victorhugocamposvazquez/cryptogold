"use client";

import { useCallback, useEffect, useState } from "react";
import { css } from "@/lib/css";
import type { NetworkConfigView } from "@/lib/network-profiles";

type Payload = {
  activeNetwork: "testnet" | "mainnet";
  switchEnv: string;
  profiles: Record<"testnet" | "mainnet", NetworkConfigView>;
  envTemplate: string;
};

export default function NetworkConfigPanel() {
  const [data, setData] = useState<Payload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/network", { credentials: "include" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Error cargando configuración");
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function copyTemplate() {
    if (!data?.envTemplate) return;
    await navigator.clipboard.writeText(data.envTemplate);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div>
      <div style={css("display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:28px;gap:16px;flex-wrap:wrap")}>
        <div>
          <h1 data-ops-h1 style={css("font:700 32px var(--font-hanken);margin:0 0 8px;letter-spacing:-0.03em")}>
            Red y entorno
          </h1>
          <p style={css("font:400 15px var(--font-hanken);color:#9A9AA0;margin:0;max-width:680px")}>
            Perfiles <strong style={css("color:#C8C8CE")}>testnet</strong> y <strong style={css("color:#C8C8CE")}>mainnet</strong> en paralelo.
            Cambia la red activa con una sola variable y configura cada perfil con sus propias claves.
          </p>
        </div>
        <button
          type="button"
          onClick={load}
          disabled={loading}
          style={css("appearance:none;cursor:pointer;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.12);color:#fff;border-radius:10px;padding:10px 16px;font:600 13px var(--font-hanken)")}
        >
          {loading ? "Actualizando…" : "Actualizar"}
        </button>
      </div>

      {error && (
        <div style={css("background:rgba(224,82,82,0.12);border:1px solid rgba(224,82,82,0.35);color:#ffb4b4;border-radius:12px;padding:14px 16px;margin-bottom:20px;font:500 14px var(--font-hanken)")}>
          {error}
        </div>
      )}

      {data && (
        <>
          <div style={css("background:rgba(201,162,39,0.1);border:1px solid rgba(201,162,39,0.35);border-radius:14px;padding:18px 20px;margin-bottom:24px")}>
            <div style={css("font:600 14px var(--font-hanken);color:#E8D48B;margin-bottom:8px")}>Red activa ahora</div>
            <div style={css("font:700 22px var(--font-hanken);color:#fff;margin-bottom:8px")}>
              {data.profiles[data.activeNetwork].label}
            </div>
            <p style={css("font:400 13px/1.55 var(--font-hanken);color:#C8C8CE;margin:0")}>
              Cambia con{" "}
              <code style={css("font-family:var(--font-mono);color:#C9A227")}>{data.switchEnv}=testnet</code> o{" "}
              <code style={css("font-family:var(--font-mono);color:#C9A227")}>mainnet</code> en{" "}
              <code style={css("font-family:var(--font-mono);color:#9A9AA0")}>.env.local</code> / Vercel → redeploy.
            </p>
          </div>

          <div data-2col style={css("display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:28px")}>
            <ProfileCard profile={data.profiles.testnet} />
            <ProfileCard profile={data.profiles.mainnet} />
          </div>

          <div style={css("background:#161616;border:1px solid rgba(255,255,255,0.08);border-radius:14px;padding:20px")}>
            <div style={css("display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:14px;flex-wrap:wrap")}>
              <div style={css("font:600 16px var(--font-hanken)")}>Plantilla .env (ambos perfiles)</div>
              <button
                type="button"
                onClick={copyTemplate}
                style={css("appearance:none;cursor:pointer;background:#C9A227;color:#0D0D0D;border:none;border-radius:8px;padding:8px 14px;font:600 12px var(--font-hanken)")}
              >
                {copied ? "Copiado" : "Copiar plantilla"}
              </button>
            </div>
            <pre style={css("margin:0;padding:16px;background:#0D0D0D;border-radius:10px;border:1px solid rgba(255,255,255,0.06);font:400 12px/1.55 var(--font-mono);color:#C8C8CE;overflow:auto;white-space:pre-wrap")}>
              {data.envTemplate}
            </pre>
          </div>
        </>
      )}
    </div>
  );
}

function ProfileCard({ profile }: { profile: NetworkConfigView }) {
  return (
    <div
      style={css(
        `background:#161616;border-radius:14px;padding:20px;border:1px solid ${profile.active ? "rgba(201,162,39,0.45)" : "rgba(255,255,255,0.08)"}`
      )}
    >
      <div style={css("display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:16px")}>
        <div style={css("font:600 17px var(--font-hanken);color:#fff")}>{profile.label}</div>
        {profile.active ? (
          <span style={css("font:600 10px var(--font-mono);color:#26A17B;background:rgba(38,161,123,0.12);padding:4px 8px;border-radius:999px")}>
            ACTIVA
          </span>
        ) : (
          <span style={css("font:600 10px var(--font-mono);color:#6B6B76")}>inactiva</span>
        )}
      </div>

      <Row label="Chain ID" value={String(profile.chainId)} />
      <Row label="RPC" value={profile.rpcUrl} mono />
      <Row label="Contrato" value={profile.contractAddress ?? "—"} mono />
      {profile.active && profile.contractSource && (
        <Row label="Fuente contrato" value={profile.contractSource === "env" ? "env" : "registro admin"} />
      )}
      <Row label="Treasury" value={profile.treasuryAddress ?? "—"} mono />
      <Row label="Clave owner" value={profile.ownerKeyConfigured ? "✓ configurada" : "✗ falta"} ok={profile.ownerKeyConfigured} />
      <Row label="Clave deployer" value={profile.deployerKeyConfigured ? "✓ configurada" : "✗ falta"} ok={profile.deployerKeyConfigured} />

      {profile.faucet && (
        <a href={profile.faucet} target="_blank" rel="noopener noreferrer" style={css("display:inline-block;margin-top:14px;font:600 12px var(--font-hanken);color:#C9A227;text-decoration:none")}>
          Faucet tBNB →
        </a>
      )}

      <div style={css("margin-top:18px;padding-top:16px;border-top:1px solid rgba(255,255,255,0.06)")}>
        <div style={css("font:600 11px var(--font-hanken);color:#6B6B76;text-transform:uppercase;letter-spacing:0.04em;margin-bottom:10px")}>
          Variables clave
        </div>
        <EnvKey name={profile.envKeys.contract} />
        <EnvKey name={profile.envKeys.rpc} />
        <EnvKey name={profile.envKeys.treasuryScoped} hint={`fallback: ${profile.envKeys.treasury}`} />
        <EnvKey name={profile.envKeys.ownerKeyScoped} hint={`fallback: ${profile.envKeys.ownerKey}`} />
        <EnvKey name={profile.envKeys.deployerKeyScoped} hint={`fallback: ${profile.envKeys.deployerKey}`} />
      </div>
    </div>
  );
}

function Row({ label, value, mono, ok }: { label: string; value: string; mono?: boolean; ok?: boolean }) {
  const color = ok === false ? "#ffb4b4" : ok === true ? "#9dffd0" : "#C8C8CE";
  return (
    <div style={css("margin-bottom:10px")}>
      <div style={css("font:500 10px var(--font-hanken);color:#6B6B76;text-transform:uppercase;letter-spacing:0.04em;margin-bottom:3px")}>{label}</div>
      <div style={css(`font:400 13px var(--font-hanken);color:${color};${mono ? "font-family:var(--font-mono);font-size:11px;word-break:break-all" : ""}`)}>{value}</div>
    </div>
  );
}

function EnvKey({ name, hint }: { name: string; hint?: string }) {
  return (
    <div style={css("margin-bottom:6px")}>
      <code style={css("font:400 11px var(--font-mono);color:#C9A227")}>{name}</code>
      {hint && <span style={css("font:400 10px var(--font-hanken);color:#6B6B76;margin-left:8px")}>{hint}</span>}
    </div>
  );
}
