import { createHash, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const COOKIE = "ch_admin";

export function adminPassword(): string {
  return process.env.CRYPTOHOST_ADMIN_PASSWORD || "cryptohost-dev";
}

export function adminToken(): string {
  return createHash("sha256").update(`cryptohost:${adminPassword()}`).digest("hex");
}

export function verifyAdminToken(token: string | null | undefined): boolean {
  if (!token) return false;
  const expected = adminToken();
  try {
    const a = Buffer.from(token);
    const b = Buffer.from(expected);
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function verifyAdminRequest(req: Request): boolean {
  const header = req.headers.get("x-cryptohost-admin");
  if (verifyAdminToken(header)) return true;
  const cookie = cookies().get(COOKIE)?.value;
  return verifyAdminToken(cookie);
}

export function adminCookieOptions() {
  return {
    name: COOKIE,
    value: adminToken(),
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  };
}
