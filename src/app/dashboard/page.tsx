import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardStats, RecentTasks } from "@/features/dashboard";
import { requireHousehold } from "@/lib/session";

function StatsSkeleton() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="flex-row items-center gap-3 px-4 py-3">
          <Skeleton className="size-4 shrink-0" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="ml-auto h-5 w-6" />
        </Card>
      ))}
    </div>
  );
}

function RecentTasksSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Tasks</CardTitle>
        <CardDescription>Your most recent incomplete tasks.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 rounded-lg border p-4">
            <Skeleton className="size-5 shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-6 w-16" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export default async function DashboardPage() {
  const session = await requireHousehold();

  return (
    <div className="container max-w-4xl space-y-8 py-8">
      <header>
        <h1 className="text-2xl font-semibold">
          Welcome back, {session.user.name?.split(" ")[0] || "there"}
        </h1>
        <p className="text-muted-foreground">
          Here&apos;s what&apos;s happening with your household tasks.
        </p>
      </header>

      {/* Stats cards */}
      <Suspense fallback={<StatsSkeleton />}>
        <DashboardStats />
      </Suspense>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3">
        <Button asChild>
          <Link href="/dashboard/tasks">
            View all tasks
            <ArrowRight className="ml-2 size-4" />
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/dashboard/tasks/today">Today&apos;s tasks</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/dashboard/categories">Manage categories</Link>
        </Button>
      </div>

      {/* Recent tasks */}
      <Suspense fallback={<RecentTasksSkeleton />}>
        <RecentTasks />
      </Suspense>
    </div>
  );
}
