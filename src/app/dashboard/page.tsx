import Link from "next/link";

import { requireHousehold } from "@/lib/session";

export default async function DashboardPage() {
  await requireHousehold();

  return (
    <div className="mx-auto w-full max-w-3xl space-y-4 p-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p className="text-muted-foreground">
        Task views will be implemented in a later step.
      </p>
      <Link href="/" className="text-foreground underline">
        Go home
      </Link>
    </div>
  );
}
