"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Marquee from "@/components/Marquee";
import Footer from "@/components/Footer";
import { MobileNav, MobileCta } from "@/components/MobileNav";
import { WalletModal, ProviderModal, SuccessModal, Toast } from "@/components/Modals";

export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isOpsZone = pathname?.startsWith("/admin") || pathname?.startsWith("/cryptohost");
  const compactPad = pathname === "/comprar" || pathname === "/swap";

  if (isOpsZone) {
    return <>{children}</>;
  }

  return (
    <>
      <div data-pad data-pad-compact={compactPad ? "true" : undefined} style={{ minHeight: "100vh", background: "#fff" }}>
        <Header />
        <Marquee />
        {children}
        <Footer />
        <MobileCta />
        <MobileNav />
      </div>
      <WalletModal />
      <ProviderModal />
      <SuccessModal />
      <Toast />
    </>
  );
}
