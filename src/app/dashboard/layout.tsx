import { DashboardHeader, SidebarNav } from "@/features/dashboard";
import { requireAuth } from "@/lib/session";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAuth();

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader
        userName={session.user.name}
        userEmail={session.user.email}
      />
      <div className="flex">
        {/* Desktop sidebar */}
        <aside className="hidden w-64 shrink-0 border-r bg-muted/30 md:block">
          <div className="sticky top-14 p-4">
            <SidebarNav />
          </div>
        </aside>
        {/* Main content */}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
