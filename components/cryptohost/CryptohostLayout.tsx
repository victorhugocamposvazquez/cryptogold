"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import CryptohostNav from "./CryptohostNav";
import { css } from "@/lib/css";
import { Logo } from "@/components/ui";

const BOTTOM_TABS = [
  { href: "/cryptohost", label: "Monitor", match: (p: string) => p === "/cryptohost" },
  { href: "/admin", label: "Admin", match: (p: string) => p.startsWith("/admin") },
  { href: "/cryptohost/comprar", label: "Comprar", match: (p: string) => p === "/cryptohost/comprar" || p === "/cryptohost/swap" },
];

function pageTitle(pathname: string) {
  if (pathname === "/cryptohost") return "Monitor";
  if (pathname.startsWith("/cryptohost/status")) return "Estado";
  if (pathname.startsWith("/cryptohost/documentacion")) return "Docs";
  if (pathname.startsWith("/cryptohost/comprar")) return "Comprar";
  if (pathname.startsWith("/cryptohost/swap")) return "Swap";
  if (pathname === "/admin") return "Panel";
  if (pathname.startsWith("/admin/transfers/new")) return "Nueva op.";
  if (pathname.startsWith("/admin/transfers")) return "Transferencias";
  if (pathname.startsWith("/admin/historial")) return "Histórico";
  return "CRYPTOHOST";
}

export default function CryptohostLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "";
  const [open, setOpen] = useState(false);
  const title = pageTitle(pathname);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const closeMenu = () => setOpen(false);
  const toggleMenu = () => setOpen((prev) => !prev);

  return (
    <div data-ops-shell data-ops-open={open ? "true" : undefined} style={css("min-height:100vh;background:#0D0D0D;color:#fff;display:flex")}>
      <button
        type="button"
        data-ops-overlay
        aria-label="Cerrar menú"
        onClick={closeMenu}
      />

      <CryptohostNav onNavigate={closeMenu} onClose={closeMenu} />

      <div style={css("flex:1;display:flex;flex-direction:column;min-width:0")}>
        <header data-ops-topbar>
          <button
            type="button"
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={open}
            onClick={toggleMenu}
            style={css("appearance:none;cursor:pointer;background:rgba(255,255,255,0.08);border:none;border-radius:10px;width:40px;height:40px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:18px")}
          >
            {open ? "×" : "☰"}
          </button>
          <Link href="/cryptohost" style={css("display:flex;align-items:center;gap:8px;text-decoration:none;min-width:0")}>
            <Logo height={26} />
            <span style={css("font:700 14px var(--font-hanken);color:#fff;letter-spacing:0.03em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis")}>
              {title}
            </span>
          </Link>
          <Link
            href="/"
            style={css("font:500 12px var(--font-hanken);color:#9A9AA0;text-decoration:none;white-space:nowrap;padding:8px 10px;border-radius:8px;background:rgba(255,255,255,0.06)")}
          >
            Salir
          </Link>
        </header>

        <main data-ops-main style={css("flex:1;padding:32px 40px;overflow:auto;min-width:0")}>{children}</main>

        <nav data-ops-bottom aria-label="Navegación CRYPTOHOST">
          {BOTTOM_TABS.map((tab) => {
            const active = tab.match(pathname);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                style={{
                  ...css("text-decoration:none;text-align:center;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;font:600 11px var(--font-hanken);padding:6px 4px"),
                  color: active ? "#C9A227" : "#8A8A94",
                }}
              >
                <span style={css(`width:5px;height:5px;border-radius:50%;background:${active ? "#C9A227" : "transparent"}`)} />
                {tab.label}
              </Link>
            );
          })}
          <button
            type="button"
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={open}
            onClick={toggleMenu}
            style={css(`appearance:none;cursor:pointer;background:transparent;border:none;text-align:center;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;font:600 11px var(--font-hanken);padding:6px 4px;color:${open ? "#C9A227" : "#8A8A94"}`)}
          >
            <span style={css("font-size:14px;line-height:1")}>{open ? "×" : "⋯"}</span>
            {open ? "Cerrar" : "Más"}
          </button>
        </nav>
      </div>
    </div>
  );
}
