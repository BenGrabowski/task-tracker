import { Skeleton } from "@/components/ui/skeleton";

export default function TodayTasksLoading() {
  return (
    <div className="container max-w-3xl space-y-6 py-8">
      {/* Header skeleton */}
      <header className="space-y-1">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-5 w-64" />
      </header>

      {/* Task list skeleton */}
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={`today-task-skeleton-${i}`}
            className="flex items-center gap-4 rounded-lg border p-4"
          >
            <Skeleton className="size-5 shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-6 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}
