"use client";

import NewTransferForm from "@/components/admin/NewTransferForm";
import { css } from "@/lib/css";

export default function AdminNewTransferPage() {
  return (
    <div>
      <h1 style={css("font:700 32px var(--font-hanken);margin:0 0 8px;letter-spacing:-0.03em")}>Nueva transferencia</h1>
      <p style={css("font:400 15px var(--font-hanken);color:#9A9AA0;margin:0 0 28px;max-width:560px")}>
        Crea una liquidación CRYPTOHOST manual. Se asigna un CGD-ID, se confirma al instante y aparece en el monitor público y en el registro.
      </p>
      <NewTransferForm />
    </div>
  );
}
