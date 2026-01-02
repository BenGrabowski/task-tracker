import {
  CalendarClock,
  CheckCircle2,
  Clock,
  ListTodo,
} from "lucide-react";
import Link from "next/link";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getTasks, getTodayTasks } from "@/features/tasks";

export async function DashboardStats() {
  const [allTasksResult, todayTasksResult] = await Promise.all([
    getTasks(),
    getTodayTasks(),
  ]);

  const allTasks = allTasksResult.tasks;
  const todayTasks = todayTasksResult.tasks;

  // Calculate stats
  const todoCount = allTasks.filter((t) => t.status === "todo").length;
  const inProgressCount = allTasks.filter(
    (t) => t.status === "in_progress"
  ).length;
  const doneCount = allTasks.filter((t) => t.status === "done").length;
  const overdueCount = todayTasks.filter((t) => {
    if (!t.dueDate) return false;
    const dueDate = new Date(t.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return dueDate < today;
  }).length;

  const stats = [
    {
      id: "todo",
      title: "To Do",
      value: todoCount,
      icon: ListTodo,
      href: "/dashboard/tasks?status=todo",
    },
    {
      id: "in-progress",
      title: "In Progress",
      value: inProgressCount,
      icon: Clock,
      href: "/dashboard/tasks?status=in_progress",
    },
    {
      id: "completed",
      title: "Completed",
      value: doneCount,
      icon: CheckCircle2,
      href: "/dashboard/tasks?status=done",
    },
    {
      id: "today",
      title: "Today & Overdue",
      value: todayTasks.length,
      description: overdueCount > 0 ? `${overdueCount} overdue` : undefined,
      icon: CalendarClock,
      href: "/dashboard/tasks/today",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Link key={stat.id} href={stat.href}>
          <Card className="transition-colors hover:bg-muted/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              {stat.description && (
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              )}
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
