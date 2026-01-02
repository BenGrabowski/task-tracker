import { redirect } from "next/navigation";
import { getTodayTasks } from "@/features/tasks";
import { TaskList } from "@/features/tasks/components/task-list";
import { requireHousehold } from "@/lib/session";

export default async function TodayTasksPage() {
  const session = await requireHousehold();

  if (!session.user.householdId) {
    redirect("/household/setup");
  }

  const todayTasksResult = await getTodayTasks();

  return (
    <div className="container max-w-3xl py-8 space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">Today & Overdue</h1>
        <p className="text-muted-foreground">
          Tasks due today or overdue (incomplete tasks only).
        </p>
      </header>

      <TaskList
        tasks={todayTasksResult.tasks}
        emptyMessage="No tasks due today or overdue."
      />
    </div>
  );
}
