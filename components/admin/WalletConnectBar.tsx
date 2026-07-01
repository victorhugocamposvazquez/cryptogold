"use client";

import { css } from "@/lib/css";
import { useAdminWallet } from "@/hooks/useAdminWallet";

type Props = {
  ownerAddress?: string | null;
  compact?: boolean;
};

function shortAddr(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export default function WalletConnectBar({ ownerAddress, compact }: Props) {
  const {
    address,
    isConnected,
    isConnecting,
    isCorrectChain,
    isSwitchPending,
    targetChainLabel,
    connectWallet,
    connectError,
    disconnect,
    switchToTargetChain,
    isOwner,
  } = useAdminWallet();

  const ownerOk = isOwner(ownerAddress);

  return (
    <div
      style={css(
        `background:#161616;border:1px solid rgba(201,162,39,0.25);border-radius:14px;padding:${compact ? "14px 16px" : "16px 20px"};margin-bottom:20px;display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap`
      )}
    >
      <div style={css("min-width:0")}>
        <div style={css("font:600 13px var(--font-hanken);color:#E8D48B;margin-bottom:4px")}>
          Wallet recomendada · MetaMask
        </div>
        <div style={css("font:400 12px/1.5 var(--font-hanken);color:#9A9AA0")}>
          {!isConnected
            ? "Conecta tu wallet para firmar deploy y mint sin claves privadas en Vercel."
            : isCorrectChain
              ? `Conectada · ${shortAddr(address!)} · ${targetChainLabel}${ownerAddress ? (ownerOk ? " · eres owner" : " · no eres owner") : ""}`
              : `Red incorrecta · cambia a ${targetChainLabel}`}
          {connectError && (
            <div style={css("margin-top:8px;color:#ffb4b4")}>
              {connectError.message.includes("MetaMask") || connectError.message.includes("Provider")
                ? "MetaMask no responde. Reinicia la extensión (icono → Restart MetaMask) y recarga la página."
                : connectError.message}
            </div>
          )}
        </div>
      </div>

      <div style={css("display:flex;gap:8px;flex-wrap:wrap")}>
        {!isConnected ? (
          <button
            type="button"
            onClick={connectWallet}
            disabled={isConnecting}
            style={css("appearance:none;cursor:pointer;background:#C9A227;color:#0D0D0D;border:none;border-radius:10px;padding:10px 16px;font:600 13px var(--font-hanken)")}
          >
            {isConnecting ? "Conectando…" : "Conectar wallet"}
          </button>
        ) : (
          <>
            {!isCorrectChain && (
              <button
                type="button"
                onClick={() => switchToTargetChain()}
                disabled={isSwitchPending}
                style={css("appearance:none;cursor:pointer;background:#C9A227;color:#0D0D0D;border:none;border-radius:10px;padding:10px 16px;font:600 13px var(--font-hanken)")}
              >
                {isSwitchPending ? "Cambiando red…" : `Usar ${targetChainLabel}`}
              </button>
            )}
            <button
              type="button"
              onClick={() => disconnect()}
              style={css("appearance:none;cursor:pointer;background:transparent;border:1px solid rgba(255,255,255,0.15);color:#C8C8CE;border-radius:10px;padding:10px 16px;font:600 13px var(--font-hanken)")}
            >
              Desconectar
            </button>
          </>
        )}
      </div>
    </div>
  );
}
