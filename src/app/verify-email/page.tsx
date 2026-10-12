import { Suspense } from "react";
import VerifyEmailPageInner from "./VerifyEmailPageInner";

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-gray-500">Loading…</div>}>
      <VerifyEmailPageInner />
    </Suspense>
  );
}
