import { NextResponse } from "next/server";
import { getTokenStats } from "@/lib/token/service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const stats = await getTokenStats();
    return NextResponse.json({ stats });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error leyendo token";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
