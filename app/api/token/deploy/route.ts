import { NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/cryptohost/admin-auth";
import { activateDeployment, deployToken, getDeploymentHistory, registerDeploymentFromTx } from "@/lib/token/service";
import { isTokenDeployerConfigured } from "@/lib/token/client";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!verifyAdminRequest(req)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  return NextResponse.json({
    deployments: await getDeploymentHistory(),
    deployerConfigured: isTokenDeployerConfigured(),
  });
}

export async function POST(req: Request) {
  if (!verifyAdminRequest(req)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await req.json();

    if (body.action === "activate") {
      const record = await activateDeployment(String(body.id ?? ""));
      if (!record) return NextResponse.json({ error: "Despliegue no encontrado" }, { status: 404 });
      return NextResponse.json({ ok: true, deployment: record });
    }

    if (body.action === "register") {
      const deployment = await registerDeploymentFromTx({
        txHash: String(body.txHash ?? ""),
        deployer: String(body.deployer ?? ""),
        name: String(body.name ?? ""),
        symbol: String(body.symbol ?? ""),
        maxSupply: String(body.maxSupply ?? ""),
        initialMint: body.initialMint ? String(body.initialMint) : undefined,
        treasury: body.treasury ? String(body.treasury) : undefined,
      });
      return NextResponse.json({ ok: true, deployment });
    }

    const deployment = await deployToken({
      name: String(body.name ?? ""),
      symbol: String(body.symbol ?? ""),
      maxSupply: String(body.maxSupply ?? ""),
      treasury: body.treasury ? String(body.treasury) : undefined,
      initialMint: body.initialMint ? String(body.initialMint) : undefined,
    });

    return NextResponse.json({ ok: true, deployment });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Deploy fallido";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
