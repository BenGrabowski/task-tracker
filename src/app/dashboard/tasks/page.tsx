import { redirect } from "next/navigation";

import { getCategories } from "@/features/categories";
import {
  getAvailableBlockingTasks,
  getHouseholdMembers,
  getTasks,
} from "@/features/tasks";
import { requireHousehold } from "@/lib/session";
import type { TaskStatus } from "@/lib/types";
import { TasksPageClient } from "./tasks-page-client";

interface TasksPageProps {
  searchParams?: {
    q?: string;
    status?: string;
    categoryId?: string;
    assigneeId?: string;
  };
}

export default async function TasksPage({ searchParams }: TasksPageProps) {
  const session = await requireHousehold();

  if (!session.user.householdId) {
    redirect("/household/setup");
  }

  const searchQuery =
    typeof searchParams?.q === "string" ? searchParams.q.trim() : undefined;

  const allowedStatuses: TaskStatus[] = ["todo", "in_progress", "done"];

  const statusQueryRaw =
    typeof searchParams?.status === "string"
      ? searchParams.status.trim()
      : undefined;

  const statusQuery = allowedStatuses.includes(statusQueryRaw as TaskStatus)
    ? (statusQueryRaw as TaskStatus)
    : undefined;

  const categoryQuery =
    typeof searchParams?.categoryId === "string"
      ? searchParams.categoryId.trim()
      : undefined;

  const assigneeQuery =
    typeof searchParams?.assigneeId === "string"
      ? searchParams.assigneeId.trim()
      : undefined;

  const filters: Parameters<typeof getTasks>[0] = {
    ...(searchQuery ? { search: searchQuery } : {}),
    ...(statusQuery ? { status: statusQuery } : {}),
    ...(categoryQuery ? { categoryId: categoryQuery } : {}),
    ...(assigneeQuery ? { assigneeId: assigneeQuery } : {}),
  };

  // Fetch all data in parallel
  const [tasksResult, categoriesResult, membersResult, blockingTasksResult] =
    await Promise.all([
      getTasks(Object.keys(filters).length ? filters : undefined),
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
      initialSearch={searchQuery ?? ""}
      initialStatus={statusQuery ?? ""}
      initialCategoryId={categoryQuery ?? ""}
      initialAssigneeId={assigneeQuery ?? ""}
    />
  );
}
