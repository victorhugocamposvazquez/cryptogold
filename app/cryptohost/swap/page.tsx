import Swap from "@/components/screens/Swap";
import { css } from "@/lib/css";

export default function CryptohostSwapPage() {
  return (
    <div>
      <div style={css("margin-bottom:24px")}>
        <p style={css("font:600 12px var(--font-mono);color:#C9A227;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 8px")}>Liquidación</p>
        <h1 style={css("font:700 32px var(--font-hanken);color:#fff;margin:0")}>Intercambiar</h1>
      </div>
      <div style={css("background:#fff;border-radius:20px;padding:8px;max-width:720px")}>
        <Swap />
      </div>
    </div>
  );
}
