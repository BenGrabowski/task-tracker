"use client";

import {
  CalendarClock,
  FolderOpen,
  Home,
  LayoutDashboard,
  ListTodo,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const navItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "All Tasks",
    href: "/dashboard/tasks",
    icon: ListTodo,
  },
  {
    title: "Today & Overdue",
    href: "/dashboard/tasks/today",
    icon: CalendarClock,
  },
  {
    title: "Categories",
    href: "/dashboard/categories",
    icon: FolderOpen,
  },
  {
    title: "Household",
    href: "/dashboard/household",
    icon: Home,
  },
];

interface SidebarNavProps {
  onNavClick?: () => void;
}

export function SidebarNav({ onNavClick }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {navItems.map((item) => {
        const isActive =
          pathname === item.href ||
          (item.href !== "/dashboard" && pathname.startsWith(item.href));

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavClick}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <item.icon className="size-4" />
            {item.title}
          </Link>
        );
      })}
    </nav>
  );
}
