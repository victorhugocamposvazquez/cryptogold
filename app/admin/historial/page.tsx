"use client";

import { css } from "@/lib/css";
import AdminSeedPanel from "@/components/admin/AdminSeedPanel";

export default function AdminHistorialPage() {
  return (
    <div>
      <h1 style={css("font:700 32px var(--font-hanken);margin:0 0 8px;letter-spacing:-0.03em")}>Generar histórico</h1>
      <p style={css("font:400 15px var(--font-hanken);color:#9A9AA0;margin:0 0 28px;max-width:640px")}>
        Crea o regenera el registro de 5.000 transferencias que alimenta el monitor público. Los datos incluyen wallets, fechas, redes e IDs CGD creíbles.
      </p>
      <AdminSeedPanel />
    </div>
  );
}
