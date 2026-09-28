"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, History, Bell, PanelRight, Star, Menu, PanelLeft } from "lucide-react";
import { adminBreadcrumbs as breadcrumbs } from "@/lib/admin/breadcrumbs";
import { cn } from "@/lib/utils";
import ThemeToggle from "@/components/ThemeToggle";

function getCrumbs(pathname: string) {
  if (breadcrumbs[pathname]) return breadcrumbs[pathname];
  if (pathname.includes("/style-catalog/edit")) return breadcrumbs["/admin/style-catalog/edit"];
  if (pathname.includes("/categories/edit")) return breadcrumbs["/admin/categories/edit"];
  if (pathname.includes("/home-feed/edit")) return breadcrumbs["/admin/home-feed/edit"];
  if (pathname.includes("/wardrobe-categories/edit")) return breadcrumbs["/admin/wardrobe-categories/edit"];
  if (pathname.includes("/wardrobe-categories/add")) return breadcrumbs["/admin/wardrobe-categories/add"];
  if (pathname.includes("/try-on-jobs/details")) return breadcrumbs["/admin/try-on-jobs/details"];
  if (pathname.includes("/looks-history/details")) return breadcrumbs["/admin/looks-history/details"];
  if (pathname.startsWith("/admin/notifications/campaigns/")) return breadcrumbs["/admin/notifications/campaigns/details"];
  if (pathname === "/admin/notifications") return breadcrumbs["/admin/notifications"];
  if (/^\/admin\/users\/[^/]+$/.test(pathname)) return breadcrumbs["/admin/users/detail"];
  if (pathname === "/admin/app-content") return breadcrumbs["/admin/app-content"];
  if (pathname === "/admin/account") return breadcrumbs["/admin/account"];
  if (pathname === "/admin/token-management") return breadcrumbs["/admin/token-management"];
  if (pathname === "/admin/devices") return breadcrumbs["/admin/devices"];
  if (pathname === "/admin/system") return breadcrumbs["/admin/system"];
  if (pathname === "/admin/activity") return breadcrumbs["/admin/activity"];
  return ["Dashboard"];
}

export default function Header({
  onMenuClick,
  onToggleSidebar,
  sidebarCollapsed = false,
  onTogglePanel,
  panelOpen = true,
  showPanelToggle = false,
}: {
  onMenuClick?: () => void;
  onToggleSidebar?: () => void;
  sidebarCollapsed?: boolean;
  onTogglePanel?: () => void;
  panelOpen?: boolean;
  showPanelToggle?: boolean;
}) {
  const pathname = usePathname();
  const crumbs = getCrumbs(pathname);

  return (
    <header className="flex h-[var(--header-height)] shrink-0 items-center justify-between gap-3 border-b border-[var(--color-border)] bg-[var(--color-card)] px-4 lg:px-5">
      <div className="flex min-w-0 items-center gap-1">
        <button
          type="button"
          onClick={onMenuClick}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 dark:text-gray-400 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 lg:hidden"
          aria-label="Menu"
        >
          <Menu className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onToggleSidebar}
          className={cn(
            "hidden h-8 w-8 items-center justify-center rounded-lg transition-colors lg:flex",
            sidebarCollapsed
              ? "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100"
              : "text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
          )}
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <PanelLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-amber-500 dark:hover:bg-gray-800"
          aria-label="Favorite"
        >
          <Star className="h-3.5 w-3.5" />
        </button>
        <nav className="ml-0.5 flex min-w-0 items-center gap-1.5 truncate text-[13px] text-gray-500 dark:text-gray-400">
          {crumbs.map((crumb, i) => (
            <span key={`${crumb}-${i}`} className="flex items-center gap-1.5">
              {i > 0 && <span className="text-gray-300">/</span>}
              {i === crumbs.length - 1 ? (
                <span className="font-medium text-gray-900 dark:text-gray-100">{crumb}</span>
              ) : (
                <Link href="#" className="transition-colors hover:text-gray-700">{crumb}</Link>
              )}
            </span>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-0.5">
        <div className="mr-1 hidden h-9 items-center rounded-full border border-gray-200 bg-gray-50/90 px-3 dark:border-gray-700 dark:bg-gray-800/80 md:flex">
          <Search className="h-3.5 w-3.5 shrink-0 text-gray-400" />
          <input
            placeholder="Search"
            className="h-full w-24 border-0 bg-transparent px-2 text-[13px] text-gray-900 placeholder:text-gray-400 focus:outline-none dark:text-gray-100 lg:w-32"
          />
          <kbd className="rounded border border-gray-200 dark:border-gray-700 bg-[var(--color-card)] px-1.5 py-0.5 text-[10px] font-medium text-gray-400 dark:border-gray-600 dark:bg-gray-700">⌘/</kbd>
        </div>
        <ThemeToggle />
        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 dark:text-gray-400 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
          aria-label="History"
        >
          <History className="h-4 w-4" strokeWidth={1.75} />
        </button>
        <button
          type="button"
          className="relative flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 dark:text-gray-400 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" strokeWidth={1.75} />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-900" />
        </button>
        {showPanelToggle && (
          <button
            type="button"
            onClick={onTogglePanel}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
              panelOpen
                ? "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100"
                : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            )}
            aria-label={panelOpen ? "Hide panel" : "Show panel"}
          >
            <PanelRight className="h-4 w-4" strokeWidth={1.75} />
          </button>
        )}
      </div>
    </header>
  );
}
