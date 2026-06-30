import type { Metadata } from "next";
import Link from "next/link";
import { css } from "@/lib/css";
import CryptohostMonitor from "@/components/CryptohostMonitor";

export const metadata: Metadata = {
  title: "CRYPTOHOST — Monitor de liquidación | CryptoGold",
  description: "Registro en tiempo real de transferencias CRYPTOHOST. Más de 5 millones de operaciones históricas con trazabilidad CGD-ID.",
};

export default function CryptohostPage() {
  return (
    <main style={css("background:#0D0D0D;min-height:100vh;padding:32px 24px 64px")}>
      <div style={css("max-width:1200px;margin:0 auto")}>
        <Link href="/" style={css("font:500 13px var(--font-hanken);color:#9A7B0A;text-decoration:none")}>
          ← CryptoGold
        </Link>
        <div style={css("margin:20px 0 28px")}>
          <p style={css("font:600 12px var(--font-mono);color:#C9A227;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 8px")}>
            Infraestructura
          </p>
          <h1 style={css("font:700 40px var(--font-hanken);color:#fff;margin:0 0 10px;letter-spacing:-0.035em")}>CRYPTOHOST</h1>
          <p style={css("font:400 16px/1.6 var(--font-hanken);color:#9A9AA0;margin:0;max-width:640px")}>
            Motor de liquidación automatizada de CryptoGold. Aquí puedes consultar el registro de transferencias, estados de confirmación y actividad reciente del servicio.
          </p>
        </div>
        <CryptohostMonitor />
      </div>
    </main>
  );
}
