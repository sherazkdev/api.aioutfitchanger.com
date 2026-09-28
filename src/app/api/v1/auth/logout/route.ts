import { connectMongo } from "@/lib/server/db";
import { revokeRefreshByHash } from "@/lib/server/auth/tokens";
import { jsonOk } from "@/lib/server/http";

export async function POST(req: Request) {
  const cookie = req.headers.get("cookie") ?? "";
  const cookieMatch = cookie.match(/refresh_token=([^;]+)/);
  const body = (await req.json().catch(() => ({}))) as { refresh_token?: string };
  const raw = body.refresh_token ?? cookieMatch?.[1];

  if (raw) {
    try {
      await connectMongo();
      await revokeRefreshByHash(decodeURIComponent(raw));
    } catch {
      /* ignore */
    }
  }

  const res = jsonOk({ logged_out: true });
  res.cookies.set("refresh_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/v1/auth",
    maxAge: 0,
  });
  return res;
}
