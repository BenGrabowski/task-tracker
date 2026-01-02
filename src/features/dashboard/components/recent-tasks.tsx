import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getTasks } from "@/features/tasks";
import { TaskList } from "@/features/tasks/components/task-list";

export async function RecentTasks() {
  const allTasksResult = await getTasks();
  const allTasks = allTasksResult.tasks;

  // Get recent incomplete tasks (limit to 5)
  const incompleteTasks = allTasks.filter((t) => t.status !== "done");
  const recentTasks = incompleteTasks.slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Tasks</CardTitle>
        <CardDescription>Your most recent incomplete tasks.</CardDescription>
      </CardHeader>
      <CardContent>
        {recentTasks.length > 0 ? (
          <TaskList tasks={recentTasks} emptyMessage="No tasks yet." />
        ) : (
          <p className="text-sm text-muted-foreground">
            No tasks yet. Create your first task to get started.
          </p>
        )}
        {incompleteTasks.length > 5 && (
          <div className="mt-4">
            <Button variant="link" asChild className="px-0">
              <Link href="/dashboard/tasks">
                View all tasks
                <ArrowRight className="ml-1 size-4" />
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
