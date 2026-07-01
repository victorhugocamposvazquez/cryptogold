"use client";

import { useEffect, useState } from "react";
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
      { href: "/cryptohost/status", label: "Estado del servicio" },
      { href: "/cryptohost/documentacion", label: "Documentación" },
    ],
  },
  {
    title: "Token",
    items: [{ href: "/admin/token", label: "Gestión CGOLD", admin: true }],
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
      { href: "/cryptohost/comprar", label: "Comprar CGOLD" },
      { href: "/cryptohost/swap", label: "Intercambiar" },
    ],
  },
];

function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  if (href === "/admin/transfers") return pathname === "/admin/transfers";
  if (href === "/admin/token") return pathname === "/admin/token" || pathname.startsWith("/admin/token/");
  if (href === "/cryptohost") return pathname === "/cryptohost";
  return pathname === href || pathname.startsWith(href + "/");
}

function sectionHasActive(pathname: string, section: NavSection) {
  return section.items.some((item) => isActive(pathname, item.href));
}

function useMobileOpsNav() {
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 860px)");
    const update = () => setMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return mobile;
}

type Props = {
  onNavigate?: () => void;
  onClose?: () => void;
};

export default function CryptohostNav({ onNavigate, onClose }: Props) {
  const pathname = usePathname() ?? "";
  const mobile = useMobileOpsNav();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!mobile) {
      setCollapsed({});
      return;
    }
    setCollapsed(
      Object.fromEntries(
        CRYPTOHOST_SECTIONS.map((section) => [section.title, !sectionHasActive(pathname, section)])
      )
    );
  }, [pathname, mobile]);

  function toggleSection(title: string) {
    setCollapsed((prev) => ({ ...prev, [title]: !prev[title] }));
  }

  function handleNavigate() {
    onNavigate?.();
    onClose?.();
  }

  return (
    <aside
      data-ops-sidebar
      style={css(
        "width:252px;background:#0D0D0D;border-right:1px solid rgba(255,255,255,0.08);padding:24px 14px;flex-shrink:0;display:flex;flex-direction:column;gap:8px;position:sticky;top:0;height:100vh;overflow-y:auto;box-sizing:border-box"
      )}
    >
      <div data-ops-sidebar-header style={css("display:flex;align-items:flex-start;justify-content:space-between;gap:8px;margin-bottom:20px")}>
        <Link href="/cryptohost" onClick={handleNavigate} style={css("display:flex;align-items:center;gap:10px;text-decoration:none;min-width:0")}>
          <Logo height={32} />
          <div>
            <div style={css("font:700 14px var(--font-hanken);letter-spacing:0.04em;color:#fff")}>CRYPTOHOST</div>
            <div style={css("font:400 11px var(--font-hanken);color:#9A9AA0")}>Centro de operaciones</div>
          </div>
        </Link>
        <button
          type="button"
          data-ops-sidebar-close
          aria-label="Cerrar menú"
          onClick={onClose}
          style={css("appearance:none;cursor:pointer;background:rgba(255,255,255,0.08);border:none;border-radius:10px;width:36px;height:36px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:18px;flex-shrink:0")}
        >
          ×
        </button>
      </div>

      {CRYPTOHOST_SECTIONS.map((section) => {
        const isCollapsed = mobile && collapsed[section.title];
        const activeInSection = sectionHasActive(pathname, section);

        return (
          <div key={section.title} data-ops-section style={css("margin-bottom:8px")}>
            {mobile ? (
              <button
                type="button"
                data-ops-section-toggle
                aria-expanded={!isCollapsed}
                onClick={() => toggleSection(section.title)}
                style={css(
                  `width:100%;appearance:none;cursor:pointer;background:transparent;border:none;display:flex;align-items:center;justify-content:space-between;gap:8px;font:600 10px var(--font-mono);color:${activeInSection ? "#C9A227" : "#6B6B76"};text-transform:uppercase;letter-spacing:0.08em;padding:8px 12px 6px`
                )}
              >
                <span>{section.title}</span>
                <span data-ops-section-chevron data-collapsed={isCollapsed ? "true" : undefined} style={css("font-size:10px;line-height:1;transition:transform 0.2s ease")}>
                  ▾
                </span>
              </button>
            ) : (
              <div style={css("font:600 10px var(--font-mono);color:#6B6B76;text-transform:uppercase;letter-spacing:0.08em;padding:8px 12px 6px")}>
                {section.title}
              </div>
            )}
            <nav
              data-ops-section-body
              data-collapsed={isCollapsed ? "true" : undefined}
              style={css("display:flex;flex-direction:column;gap:2px")}
            >
              {section.items.map((item) => {
                const active = isActive(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={handleNavigate}
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
        );
      })}

      <div style={css("margin-top:auto;padding-top:16px;border-top:1px solid rgba(255,255,255,0.08)")}>
        <Link
          href="/"
          onClick={handleNavigate}
          style={css("display:block;padding:10px 12px;border-radius:10px;font:500 13px var(--font-hanken);text-decoration:none;color:#9A9AA0")}
        >
          ← Volver a CryptoGold
        </Link>
      </div>
    </aside>
  );
}
