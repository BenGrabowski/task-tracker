import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function TasksLoading() {
  return (
    <div className="container max-w-3xl space-y-6 py-8">
      {/* Header skeleton */}
      <header className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-24" />
          <Skeleton className="mt-1 h-5 w-48" />
        </div>
        <Skeleton className="h-10 w-24" />
      </header>

      {/* Search card skeleton */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Search tasks</CardTitle>
          <CardDescription>
            Search across task titles and descriptions.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 w-20" />
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
          </div>
        </CardContent>
      </Card>

      {/* Task list skeleton */}
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={`task-skeleton-${i}`}
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
