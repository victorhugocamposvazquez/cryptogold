"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { css } from "@/lib/css";
import { Logo } from "@/components/ui";

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/transfers", label: "Transferencias" },
  { href: "/docs/status", label: "Estado público" },
  { href: "/", label: "← Sitio" },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div style={css("min-height:100vh;background:#0D0D0D;color:#fff;display:flex")}>
      <aside style={css("width:240px;border-right:1px solid rgba(255,255,255,0.08);padding:24px 16px;flex-shrink:0")}>
        <div style={css("display:flex;align-items:center;gap:10px;margin-bottom:32px")}>
          <Logo height={32} />
          <div>
            <div style={css("font:700 14px var(--font-hanken);letter-spacing:0.04em")}>CRYPTOHOST</div>
            <div style={css("font:400 11px var(--font-hanken);color:#9A9AA0")}>Backoffice</div>
          </div>
        </div>
        <nav style={css("display:flex;flex-direction:column;gap:4px")}>
          {NAV.map((item) => {
            const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href) && item.href !== "/";
            return (
              <Link
                key={item.href}
                href={item.href}
                style={css(
                  `display:block;padding:10px 12px;border-radius:10px;font:500 14px var(--font-hanken);text-decoration:none;color:${active ? "#0D0D0D" : "#C8C8CE"};background:${active ? "#C9A227" : "transparent"}`
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <main style={css("flex:1;padding:32px 40px;overflow:auto")}>{children}</main>
    </div>
  );
}
