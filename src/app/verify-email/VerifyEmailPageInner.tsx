"use client";

import { useSearchParams } from "next/navigation";
import VerifyEmailClient from "./VerifyEmailClient";

export default function VerifyEmailPageInner() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  return <VerifyEmailClient token={token} />;
}
