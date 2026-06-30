"use client";

import { memo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { css } from "@/lib/css";
import { fmtUSD, ACCENT, NEG } from "@/lib/format";
import { TOKEN_SYMBOL } from "@/lib/brand";
import { useApp } from "@/lib/store";
import { useMarket } from "@/lib/market";
import { Hov, Logo, BrandMark } from "./ui";

const NAV: [string, string][] = [
  ["/", "Inicio"],
  ["/mercado", "Mercado"],
  ["/comprar", "Comprar"],
  ["/swap", "Swap"],
  ["/cartera", "Cartera"],
];

const NavLinks = memo(function NavLinks() {
  const pathname = usePathname();
  return (
    <nav data-nav style={css("display:flex;gap:2px")}>
      {NAV.map(([href, label]) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            prefetch
            style={css(
              "text-decoration:none;background:" +
                (active ? "#F2F2F3" : "transparent") +
                ";color:" +
                (active ? "#0D0D0D" : "#6B6B76") +
                ";font:500 14px/1 var(--font-hanken);padding:9px 14px;border-radius:10px;letter-spacing:-0.01em"
            )}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
});

function PriceChip() {
  const { price, change, goldSpot, goldChange } = useMarket();
  const pos = change >= 0;
  const changeStr = (pos ? "+" : "") + change.toFixed(2) + "%";
  const changeColor = pos ? ACCENT : NEG;
  const goldPos = goldChange >= 0;

  return (
    <div data-pricechip style={css("display:flex;align-items:center;gap:8px")}>
      <div style={css("display:flex;align-items:center;gap:8px;padding:7px 12px;border:1px solid #ECECEC;border-radius:999px")}>
        <span style={css("font:500 11px var(--font-mono);color:#9A9AA0")}>XAU</span>
        <span style={css("font:600 12px var(--font-mono);color:#0D0D0D")}>{fmtUSD(goldSpot)}</span>
        <span style={{ ...css("font:600 11px var(--font-mono)"), color: goldPos ? ACCENT : NEG }}>{(goldPos ? "+" : "") + goldChange.toFixed(2) + "%"}</span>
      </div>
      <div style={css("display:flex;align-items:center;gap:8px;padding:7px 12px;border:1px solid #ECECEC;border-radius:999px")}>
        <span style={css("width:6px;height:6px;border-radius:50%;background:" + ACCENT)} />
        <span style={css("font:500 12px var(--font-mono);color:#8A8A94")}>{TOKEN_SYMBOL}</span>
        <span style={css("font:600 13px var(--font-mono);color:#0D0D0D")}>{fmtUSD(price)}</span>
        <span style={{ ...css("font:600 12px var(--font-mono)"), color: changeColor }}>{changeStr}</span>
      </div>
    </div>
  );
}

function WalletActions() {
  const app = useApp();

  if (app.connected) {
    return (
      <Link
        href="/cartera"
        prefetch
        data-wallet-link
        style={css("text-decoration:none;cursor:pointer;display:flex;align-items:center;gap:8px;padding:8px 14px;border:1px solid #ECECEC;background:#fff;border-radius:999px;max-width:100%")}
      >
        <span style={css("width:7px;height:7px;border-radius:50%;background:" + ACCENT)} />
        <span style={css("font:500 13px var(--font-mono);color:#0D0D0D")}>{app.address}</span>
      </Link>
    );
  }

  return (
    <Hov
      as="button"
      type="button"
      data-wallet-btn
      onClick={app.openWallet}
      style="appearance:none;cursor:pointer;background:#0D0D0D;color:#fff;border:none;border-radius:999px;padding:10px 18px;font:600 14px var(--font-hanken);letter-spacing:-0.01em"
      hover="background:#000"
    >
      Conectar wallet
    </Hov>
  );
}

export default function Header() {
  return (
    <header style={css("position:sticky;top:0;z-index:50;background:rgba(255,255,255,0.82);backdrop-filter:saturate(180%) blur(14px);-webkit-backdrop-filter:saturate(180%) blur(14px);border-bottom:1px solid #ECECEC")}>
      <div data-header-inner style={css("max-width:1200px;margin:0 auto;padding:0 24px;height:64px;display:flex;align-items:center;justify-content:space-between;gap:20px")}>
        <Link href="/" prefetch style={css("text-decoration:none;display:flex;align-items:center;gap:10px")}>
          <Logo />
          <span data-brand-mark><BrandMark /></span>
        </Link>

        <NavLinks />

        <div style={css("display:flex;align-items:center;gap:10px")}>
          <PriceChip />
          <WalletActions />
        </div>
      </div>
    </header>
  );
}
