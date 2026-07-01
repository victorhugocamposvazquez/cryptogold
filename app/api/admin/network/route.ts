import { NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/cryptohost/admin-auth";
import {
  buildEnvTemplate,
  getActiveNetwork,
  resolveNetworkConfigView,
  type BnbNetwork,
} from "@/lib/network-config.server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!verifyAdminRequest(req)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const active = getActiveNetwork();
  const profiles: Record<BnbNetwork, Awaited<ReturnType<typeof resolveNetworkConfigView>>> = {
    testnet: await resolveNetworkConfigView("testnet"),
    mainnet: await resolveNetworkConfigView("mainnet"),
  };

  return NextResponse.json({
    activeNetwork: active,
    switchEnv: "NEXT_PUBLIC_BNB_NETWORK",
    profiles,
    envTemplate: buildEnvTemplate(active),
  });
}
