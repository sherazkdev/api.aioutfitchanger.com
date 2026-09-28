import Link from "next/link";
import { HangerIcon } from "@/components/icons/HangerIcon";
import ThemeToggle from "@/components/ThemeToggle";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-page)]">
      <header className="flex h-[60px] items-center justify-between px-6 md:px-14">
        <Link href="/login" className="flex items-center gap-2.5 text-gray-900 dark:text-gray-100 transition-opacity hover:opacity-80 dark:text-gray-100">
          <HangerIcon className="h-5 w-5" />
          <span className="text-sm font-semibold">AI Wardrobe</span>
          <span className="text-gray-300 dark:text-gray-600 dark:text-gray-300">/</span>
          <span className="text-sm text-gray-500 dark:text-gray-400">Admin</span>
        </Link>
        <ThemeToggle className="h-9 w-9" />
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-8">
        <div className="w-full max-w-[420px]">{children}</div>
      </main>
      <footer className="flex items-center justify-between px-6 py-6 text-xs text-gray-400 md:px-14">
        <span>© 2026 AI Wardrobe</span>
        <div className="flex gap-6">
          <Link href="#" className="transition-colors hover:text-gray-600 dark:text-gray-300 dark:hover:text-gray-300">Privacy</Link>
          <Link href="#" className="transition-colors hover:text-gray-600 dark:text-gray-300 dark:hover:text-gray-300">Terms</Link>
        </div>
      </footer>
    </div>
  );
}
