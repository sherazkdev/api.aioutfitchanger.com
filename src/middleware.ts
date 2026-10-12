import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const API_PREFIX = "/api/v1";

function securityHeaders(res: NextResponse): NextResponse {
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  res.headers.set("X-DNS-Prefetch-Control", "off");
  if (process.env.NODE_ENV === "production") {
    res.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }
  return res;
}

function corsHeaders(req: NextRequest, res: NextResponse): NextResponse {
  const origin = req.headers.get("origin");
  const allowed = (process.env.API_CORS_ORIGINS ?? process.env.APP_URL ?? "")
    .split(",")
    .map((s) => s.trim().replace(/\/$/, ""))
    .filter(Boolean);

  if (!origin || allowed.length === 0) return res;

  const normalized = origin.replace(/\/$/, "");
  if (allowed.includes(normalized)) {
    res.headers.set("Access-Control-Allow-Origin", origin);
    res.headers.set("Vary", "Origin");
    res.headers.set("Access-Control-Allow-Credentials", "true");
    res.headers.set(
      "Access-Control-Allow-Headers",
      "Authorization, Content-Type, Accept, X-Requested-With"
    );
    res.headers.set("Access-Control-Allow-Methods", "GET, POST, PATCH, PUT, DELETE, OPTIONS");
  }
  return res;
}

export function middleware(req: NextRequest) {
  if (req.method === "TRACE" || req.method === "TRACK") {
    return new NextResponse(null, { status: 405 });
  }

  const isApi = req.nextUrl.pathname.startsWith(API_PREFIX);

  if (isApi && req.method === "OPTIONS") {
    let res = new NextResponse(null, { status: 204 });
    res = securityHeaders(res);
    res = corsHeaders(req, res);
    return res;
  }

  const res = securityHeaders(NextResponse.next());
  if (isApi) return corsHeaders(req, res);
  return res;
}

export const config = {
  matcher: ["/api/:path*", "/((?!_next/static|_next/image|favicon.ico).*)"],
};
