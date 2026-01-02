import Link from "next/link";

import { ThemeToggle } from "@/components/theme-toggle";
import { MobileNav } from "./mobile-nav";
import { UserNav } from "./user-nav";

interface DashboardHeaderProps {
  userName?: string | null;
  userEmail?: string | null;
}

export function DashboardHeader({ userName, userEmail }: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center gap-4 px-4 md:px-6">
        <MobileNav />
        <Link
          href="/dashboard"
          className="hidden font-semibold md:inline-block"
        >
          Hearth
        </Link>
        <div className="flex flex-1 items-center justify-end gap-2">
          <ThemeToggle />
          <UserNav userName={userName} userEmail={userEmail} />
        </div>
      </div>
    </header>
  );
}
