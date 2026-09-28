import DashboardShell from "@/components/dashboard/DashboardShell";
import AdminAuthGate from "@/components/auth/AdminAuthGate";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthGate>
      <DashboardShell>{children}</DashboardShell>
    </AdminAuthGate>
  );
}