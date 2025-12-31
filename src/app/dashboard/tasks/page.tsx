import { redirect } from "next/navigation";

import { getCategories } from "@/features/categories";
import {
  getAvailableBlockingTasks,
  getHouseholdMembers,
  getTasks,
} from "@/features/tasks";
import { requireHousehold } from "@/lib/session";
import { TasksPageClient } from "./tasks-page-client";

export default async function TasksPage() {
  const session = await requireHousehold();

  if (!session.user.householdId) {
    redirect("/household/setup");
  }

  // Fetch all data in parallel
  const [tasksResult, categoriesResult, membersResult, blockingTasksResult] =
    await Promise.all([
      getTasks(),
      getCategories(),
      getHouseholdMembers(),
      getAvailableBlockingTasks(),
    ]);

  return (
    <TasksPageClient
      initialTasks={tasksResult.tasks}
      categories={categoriesResult.categories}
      members={membersResult.members}
      availableBlockingTasks={blockingTasksResult.tasks}
    />
  );
}
