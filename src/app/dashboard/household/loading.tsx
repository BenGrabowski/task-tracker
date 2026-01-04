import { Skeleton } from "@/components/ui/skeleton";

export default function HouseholdLoading() {
  return (
    <div className="container max-w-2xl space-y-6 py-8">
      {/* Header skeleton */}
      <header>
        <Skeleton className="h-8 w-48" />
        <Skeleton className="mt-1 h-5 w-72" />
      </header>

      {/* Household info card skeleton */}
      <div className="rounded-lg border p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <Skeleton className="h-6 w-44" />
            <Skeleton className="mt-1 h-4 w-36" />
          </div>
          <Skeleton className="h-9 w-20" />
        </div>
        <div>
          <Skeleton className="h-4 w-24" />
          <Skeleton className="mt-1 h-6 w-40" />
        </div>
      </div>

      {/* Members card skeleton */}
      <div className="rounded-lg border p-6 space-y-4">
        <div>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="mt-1 h-4 w-48" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={`member-skeleton-${i}`}
              className="flex items-center gap-3 rounded-lg border p-3"
            >
              <Skeleton className="size-10 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="mt-1 h-4 w-48" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
