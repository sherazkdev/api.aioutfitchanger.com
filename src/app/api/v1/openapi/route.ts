import { mobileV1OpenApi } from "@/lib/openapi/mobile-v1-openapi";
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(mobileV1OpenApi, {
    headers: {
      "Cache-Control": "public, max-age=60",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
