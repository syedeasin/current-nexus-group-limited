import { cookies } from "next/headers";
import { SESSION_COOKIE, sessionMaxAgeSeconds } from "@/lib/jwt";

/**
 * Browsers drop a `Secure` cookie set over plain http, so a production server
 * that is still reached by IP without TLS sets COOKIE_SECURE="false" in .env.
 * Once HTTPS is in place, remove it (or set "true").
 */
function secureCookies(): boolean {
  const flag = process.env.COOKIE_SECURE?.trim().toLowerCase();
  if (flag === "true") return true;
  if (flag === "false") return false;
  return process.env.NODE_ENV === "production";
}

export async function setSessionCookie(token: string) {
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: secureCookies(),
    sameSite: "lax",
    path: "/",
    maxAge: sessionMaxAgeSeconds(),
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export async function readSessionCookie(): Promise<string | null> {
  const store = await cookies();
  return store.get(SESSION_COOKIE)?.value ?? null;
}
