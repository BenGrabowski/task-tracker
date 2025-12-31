"use client";

import type { Task } from "@/lib/types";
import { TaskItem } from "./task-item";

interface TaskListProps {
  tasks: Task[];
  onEditTask?: (task: Task) => void;
  onTaskChange?: () => void;
  emptyMessage?: string;
}

export function TaskList({
  tasks,
  onEditTask,
  onTaskChange,
  emptyMessage = "No tasks yet. Create one to get started.",
}: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onEdit={onEditTask}
          onTaskChange={onTaskChange}
        />
      ))}
    </div>
  );
}
