import { NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/cryptohost/admin-auth";
import { getTransfer } from "@/lib/cryptohost/service";

export const dynamic = "force-dynamic";

type Params = { params: { id: string } };

export async function GET(req: Request, { params }: Params) {
  const transfer = await getTransfer(params.id);
  if (!transfer) return NextResponse.json({ error: "not found" }, { status: 404 });

  const isAdmin = verifyAdminRequest(req);
  if (!isAdmin && transfer.status !== "confirmed") {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  return NextResponse.json({ transfer });
}
