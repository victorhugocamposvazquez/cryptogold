import { NextResponse } from "next/server";
import { getServiceStatus, listIncidents } from "@/lib/cryptohost/service";

export const dynamic = "force-dynamic";

export async function GET() {
  const status = await getServiceStatus();
  const incidents = await listIncidents(true);
  return NextResponse.json({ ...status, incidents });
}
