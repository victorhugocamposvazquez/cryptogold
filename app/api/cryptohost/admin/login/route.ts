import { NextResponse } from "next/server";
import { adminCookieOptions, adminPassword } from "@/lib/cryptohost/admin-auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: { password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  if (body.password !== adminPassword()) {
    return NextResponse.json({ error: "invalid credentials" }, { status: 401 });
  }

  const cookie = adminCookieOptions();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(cookie.name, cookie.value, {
    httpOnly: cookie.httpOnly,
    sameSite: cookie.sameSite,
    secure: cookie.secure,
    path: cookie.path,
    maxAge: cookie.maxAge,
  });
  return res;
}
