import type { Metadata } from "next";
import { Hanken_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/lib/store";
import SiteChrome from "@/components/SiteChrome";

const hanken = Hanken_Grotesk({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"], variable: "--font-hanken", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  title: "CryptoGold — Token respaldado en oro",
  description:
    "Adquiere CGOLD, el token de CryptoGold anclado al precio del oro. Compra con USDT, cripto o tarjeta. Multi-chain, sin custodia, respaldo tangible.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${hanken.variable} ${mono.variable}`}>
      <body>
        <AppProvider>
          <SiteChrome>{children}</SiteChrome>
        </AppProvider>
      </body>
    </html>
  );
}
