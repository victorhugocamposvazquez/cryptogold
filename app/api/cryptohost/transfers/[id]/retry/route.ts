import { NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/cryptohost/admin-auth";
import { retryTransfer } from "@/lib/cryptohost/service";

export const dynamic = "force-dynamic";

type Params = { params: { id: string } };

export async function POST(req: Request, { params }: Params) {
  if (!verifyAdminRequest(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const transfer = await retryTransfer(params.id);
    return NextResponse.json({ ok: true, transfer });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "retry failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
