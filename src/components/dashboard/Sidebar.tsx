"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid, Shirt, LayoutTemplate, FolderOpen, Sparkles, Clock, Users,
  FileText, Settings, ChevronDown, Bell, Smartphone, Shield, UserCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BrandLogo } from "@/components/icons/BrandLogo";
import { SnowuiLogo } from "@/components/icons/SnowuiLogo";

const mainNav = [
  { label: "Overview", href: "/admin/overview", icon: LayoutGrid },
  { label: "Style Catalog", href: "/admin/style-catalog", icon: Shirt, children: [{ label: "Categories", href: "/admin/categories" }] },
  { label: "Home Feed", href: "/admin/home-feed", icon: LayoutTemplate },
  { label: "Wardrobe Categories", href: "/admin/wardrobe-categories", icon: FolderOpen },
  { label: "Try-On Jobs", href: "/admin/try-on-jobs", icon: Sparkles },
  { label: "Looks / History", href: "/admin/looks-history", icon: Clock },
  { label: "Users", href: "/admin/users", icon: Users },
];

const settingsNav = [
  { label: "App Content", href: "/admin/app-content", icon: FileText },
  { label: "Admin Account", href: "/admin/account", icon: UserCircle },
  { label: "Token management", href: "/admin/token-management", icon: Shield },
  {
    label: "Notifications",
    href: "/admin/notifications",
    icon: Bell,
    children: [{ label: "Device Registry", href: "/admin/devices" }],
  },
  {
    label: "System status",
    href: "/admin/system",
    icon: Settings,
    children: [{ label: "Activity log", href: "/admin/activity" }],
  },
];

function isActive(pathname: string, href: string) {
  if (href === "/admin/overview") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Sidebar({
  collapsed = false,
  onNavigate,
}: {
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  const linkClass = (active: boolean, indented = false) =>
    cn(
      "group relative flex items-center rounded-lg py-2 text-[13px] transition-all",
      collapsed ? "lg:justify-center lg:px-2 gap-2.5 px-3" : "gap-2.5 px-3",
      indented && "ml-7",
      active
        ? "bg-gray-100/90 font-medium text-gray-900 dark:bg-gray-800/90 dark:text-gray-100"
        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800/50 dark:hover:text-gray-100"
    );

  return (
    <aside
      className={cn(
        "flex h-full flex-col overflow-hidden border-r border-[var(--color-border)] bg-[var(--color-card)] transition-[width] duration-300 ease-in-out",
        collapsed
          ? "w-[var(--sidebar-width)] lg:w-[var(--sidebar-collapsed-width)]"
          : "w-[var(--sidebar-width)]"
      )}
    >
      <div className={cn("flex h-[var(--header-height)] shrink-0 items-center border-b border-transparent", collapsed ? "justify-center px-2" : "gap-3 px-4")}>
        <BrandLogo size="sm" />
        <span className={cn("truncate text-[15px] font-semibold tracking-tight text-gray-900 dark:text-gray-100", collapsed && "lg:hidden")}>
          AI Wardrobe
        </span>
      </div>

      <nav className="flex-1 overflow-x-hidden overflow-y-auto px-2 py-2 lg:px-3">
        <p className={cn("mb-2 px-3 text-[11px] font-medium tracking-wide text-gray-400", collapsed && "lg:hidden")}>Dashboard</p>
        <div className="space-y-0.5">
          {mainNav.map((item) => {
            const active = isActive(pathname, item.href);
            const Icon = item.icon;
            const childActive = item.children?.some((c) => pathname.startsWith(c.href));
            return (
              <div key={item.label}>
                <Link href={item.href} onClick={onNavigate} title={collapsed ? item.label : undefined} className={linkClass(active || !!childActive)}>
                  {(active || childActive) && !collapsed && (
                    <span className="absolute -left-3 top-1/2 h-[22px] w-[3px] -translate-y-1/2 rounded-full bg-gray-900 dark:bg-gray-100" />
                  )}
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className={cn("flex-1 truncate", collapsed && "lg:hidden")}>{item.label}</span>
                  {item.children && <ChevronDown className={cn("h-3.5 w-3.5 shrink-0 text-gray-400", collapsed && "lg:hidden")} />}
                </Link>
                {item.children?.map((child) => (
                  <Link key={child.href} href={child.href} onClick={onNavigate} className={cn(linkClass(pathname.startsWith(child.href), true), collapsed && "lg:hidden")}>
                    {child.label}
                  </Link>
                ))}
              </div>
            );
          })}
        </div>

        <p className={cn("mb-2 mt-6 px-3 text-[11px] font-medium tracking-wide text-gray-400", collapsed && "lg:hidden")}>Settings</p>
        <div className="space-y-0.5">
          {settingsNav.map((item) => {
            const Icon = item.icon;
            const active = isActive(pathname, item.href);
            const childActive = item.children?.some((c) => pathname.startsWith(c.href));
            return (
              <div key={item.label}>
                <Link href={item.href} onClick={onNavigate} className={linkClass(active || !!childActive)}>
                  {(active || childActive) && !collapsed && (
                    <span className="absolute -left-3 top-1/2 h-[22px] w-[3px] -translate-y-1/2 rounded-full bg-gray-900 dark:bg-gray-100" />
                  )}
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className={cn("truncate", collapsed && "lg:hidden")}>{item.label}</span>
                </Link>
                {item.children?.map((child) => (
                  <Link key={child.href} href={child.href} onClick={onNavigate} className={cn(linkClass(pathname.startsWith(child.href), true), collapsed && "lg:hidden")}>
                    <Smartphone className="mr-1 inline h-3.5 w-3.5" />
                    {child.label}
                  </Link>
                ))}
              </div>
            );
          })}
        </div>
      </nav>

      <div className={cn("shrink-0 border-t border-gray-100 py-4 dark:border-gray-800", collapsed ? "flex justify-center px-2" : "px-4")}>
        <div className={cn(collapsed && "lg:hidden")}>
          <SnowuiLogo />
          <p className="mt-2 text-[10px] text-gray-400">© 2026 AI Wardrobe</p>
        </div>
      </div>
    </aside>
  );
}
