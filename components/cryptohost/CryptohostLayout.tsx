"use client";

import CryptohostNav from "./CryptohostNav";
import { css } from "@/lib/css";

export default function CryptohostLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={css("min-height:100vh;background:#0D0D0D;color:#fff;display:flex")}>
      <CryptohostNav />
      <main style={css("flex:1;padding:32px 40px;overflow:auto;min-width:0")}>{children}</main>
    </div>
  );
}
