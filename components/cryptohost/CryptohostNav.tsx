"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { css } from "@/lib/css";
import { Logo } from "@/components/ui";

type NavItem = {
  href: string;
  label: string;
  admin?: boolean;
};

type NavSection = {
  title: string;
  items: NavItem[];
};

export const CRYPTOHOST_SECTIONS: NavSection[] = [
  {
    title: "Monitor",
    items: [
      { href: "/cryptohost", label: "Registro en vivo" },
      { href: "/docs/status", label: "Estado del servicio" },
      { href: "/docs/cryptohost", label: "Documentación" },
    ],
  },
  {
    title: "Operaciones",
    items: [
      { href: "/admin", label: "Panel de control", admin: true },
      { href: "/admin/transfers", label: "Transferencias", admin: true },
      { href: "/admin/transfers/new", label: "Nueva transferencia", admin: true },
      { href: "/admin/historial", label: "Generar histórico", admin: true },
    ],
  },
  {
    title: "Liquidación",
    items: [
      { href: "/comprar", label: "Comprar CGOLD" },
      { href: "/swap", label: "Intercambiar" },
    ],
  },
];

function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  if (href === "/admin/transfers") return pathname === "/admin/transfers";
  if (href === "/cryptohost") return pathname === "/cryptohost";
  return pathname === href || pathname.startsWith(href + "/");
}

export default function CryptohostNav() {
  const pathname = usePathname();

  return (
    <aside
      style={css(
        "width:252px;border-right:1px solid rgba(255,255,255,0.08);padding:24px 14px;flex-shrink:0;display:flex;flex-direction:column;gap:8px;position:sticky;top:0;height:100vh;overflow-y:auto;box-sizing:border-box"
      )}
    >
      <Link href="/cryptohost" style={css("display:flex;align-items:center;gap:10px;margin-bottom:20px;text-decoration:none")}>
        <Logo height={32} />
        <div>
          <div style={css("font:700 14px var(--font-hanken);letter-spacing:0.04em;color:#fff")}>CRYPTOHOST</div>
          <div style={css("font:400 11px var(--font-hanken);color:#9A9AA0")}>Centro de operaciones</div>
        </div>
      </Link>

      {CRYPTOHOST_SECTIONS.map((section) => (
        <div key={section.title} style={css("margin-bottom:8px")}>
          <div style={css("font:600 10px var(--font-mono);color:#6B6B76;text-transform:uppercase;letter-spacing:0.08em;padding:8px 12px 6px")}>
            {section.title}
          </div>
          <nav style={css("display:flex;flex-direction:column;gap:2px")}>
            {section.items.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={css(
                    `display:flex;align-items:center;justify-content:space-between;padding:10px 12px;border-radius:10px;font:500 13px var(--font-hanken);text-decoration:none;color:${active ? "#0D0D0D" : "#C8C8CE"};background:${active ? "#C9A227" : "transparent"}`
                  )}
                >
                  <span>{item.label}</span>
                  {item.admin && !active && (
                    <span style={css("font:600 9px var(--font-mono);color:#6B6B76;text-transform:uppercase")}>ops</span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      ))}

      <div style={css("margin-top:auto;padding-top:16px;border-top:1px solid rgba(255,255,255,0.08)")}>
        <Link
          href="/"
          style={css("display:block;padding:10px 12px;border-radius:10px;font:500 13px var(--font-hanken);text-decoration:none;color:#9A9AA0")}
        >
          ← Volver a CryptoGold
        </Link>
      </div>
    </aside>
  );
}
