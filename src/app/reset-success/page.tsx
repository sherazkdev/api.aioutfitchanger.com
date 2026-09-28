import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import AuthLayout from "@/components/auth/AuthLayout";
import Button from "@/components/ui/Button";

export default function ResetSuccessPage() {
  return (
    <AuthLayout>
      <div className="card p-8 sm:p-10">
        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-green-50"><CheckCircle2 className="h-5 w-5 text-green-600" /></div>
        <h1 className="text-xl font-semibold">Password reset successful</h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Your password has been updated. Sign in with your new password to continue.</p>
        <Link href="/login" className="mt-6 block"><Button className="w-full" size="lg">Back to sign in</Button></Link>
      </div>
    </AuthLayout>
  );
}
