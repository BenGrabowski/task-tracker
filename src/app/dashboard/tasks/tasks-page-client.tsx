"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TaskForm } from "@/features/tasks/components/task-form";
import { TaskList } from "@/features/tasks/components/task-list";
import type { Category, HouseholdMember, Task, TaskSummary } from "@/lib/types";

interface TasksPageClientProps {
  initialTasks: Task[];
  categories: Category[];
  members: HouseholdMember[];
  availableBlockingTasks: TaskSummary[];
}

export function TasksPageClient({
  initialTasks,
  categories,
  members,
  availableBlockingTasks,
}: TasksPageClientProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const router = useRouter();

  const handleTaskChange = () => {
    router.refresh();
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingTask(null);
  };

  const handleSuccess = () => {
    handleCloseForm();
    handleTaskChange();
  };

  // Filter out the editing task from available blocking tasks
  const filteredBlockingTasks = editingTask
    ? availableBlockingTasks.filter((t) => t.id !== editingTask.id)
    : availableBlockingTasks;

  return (
    <div className="container max-w-3xl py-8 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Tasks</h1>
          <p className="text-muted-foreground">Manage your household tasks.</p>
        </div>
        {!showForm && (
          <Button onClick={() => setShowForm(true)}>Add task</Button>
        )}
      </header>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingTask ? "Edit task" : "New task"}</CardTitle>
            <CardDescription>
              {editingTask
                ? "Update the task details below."
                : "Create a new task for your household."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TaskForm
              task={editingTask ?? undefined}
              categories={categories}
              members={members}
              availableBlockingTasks={filteredBlockingTasks}
              onSuccess={handleSuccess}
              onCancel={handleCloseForm}
            />
          </CardContent>
        </Card>
      )}

      <TaskList
        tasks={initialTasks}
        onEditTask={handleEditTask}
        onTaskChange={handleTaskChange}
      />
    </div>
  );
}
