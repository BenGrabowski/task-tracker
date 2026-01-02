import { Skeleton } from "@/components/ui/skeleton";

export default function CategoriesLoading() {
  return (
    <div className="container max-w-2xl space-y-6 py-8">
      {/* Header skeleton */}
      <header className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-28" />
          <Skeleton className="mt-1 h-5 w-56" />
        </div>
        <Skeleton className="h-10 w-28" />
      </header>

      {/* Category list skeleton */}
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={`category-skeleton-${i}`}
            className="flex items-center justify-between rounded-lg border p-4"
          >
            <div className="flex items-center gap-3">
              <Skeleton className="size-4 rounded-full" />
              <Skeleton className="h-5 w-32" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="size-8" />
              <Skeleton className="size-8" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
