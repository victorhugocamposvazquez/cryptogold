import type { Metadata } from "next";
import { css } from "@/lib/css";
import CryptohostMonitor from "@/components/CryptohostMonitor";
import { OPS_CENTER_NAME } from "@/lib/brand";

export const metadata: Metadata = {
  title: `${OPS_CENTER_NAME} — Monitor de liquidación`,
  description: `Registro en tiempo real de transferencias ${OPS_CENTER_NAME}. Más de 5 millones de operaciones históricas con trazabilidad CGD-ID.`,
};

export default function CryptohostPage() {
  return (
    <div>
      <div style={css("margin-bottom:28px")}>
        <p style={css("font:600 12px var(--font-mono);color:#C9A227;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 8px")}>
          Monitor
        </p>
        <h1 data-ops-page-title style={css("font:700 36px var(--font-hanken);color:#fff;margin:0 0 10px;letter-spacing:-0.035em")}>Registro en vivo</h1>
        <p data-ops-page-sub style={css("font:400 15px/1.6 var(--font-hanken);color:#9A9AA0;margin:0;max-width:640px")}>
          Transferencias procesadas por {OPS_CENTER_NAME} con trazabilidad CGD-ID. Usa el menú lateral para operaciones, liquidaciones e histórico.
        </p>
      </div>
      <CryptohostMonitor />
    </div>
  );
}
