"use client";

import { useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Task, TaskPriority, TaskStatus } from "@/lib/types";
import { deleteTask, updateTask } from "../actions/task-actions";

interface TaskItemProps {
  task: Task;
  onEdit?: (task: Task) => void;
  onTaskChange?: () => void;
  dependents?: Task[];
}

const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: "todo", label: "To Do" },
  { value: "in_progress", label: "In Progress" },
  { value: "done", label: "Done" },
];

const PRIORITY_COLORS: Record<TaskPriority, string> = {
  low: "bg-slate-500",
  medium: "bg-amber-500",
  high: "bg-red-500",
};

const PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

function formatDueDate(date: Date | null): string {
  if (!date) return "";
  const d = new Date(date);
  const now = new Date();
  const isOverdue = d < now && d.toDateString() !== now.toDateString();
  const isToday = d.toDateString() === now.toDateString();

  const formatted = d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: d.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });

  if (isToday) return `Today`;
  if (isOverdue) return formatted;
  return formatted;
}

function isDueToday(date: Date | null): boolean {
  if (!date) return false;
  const d = new Date(date);
  const now = new Date();
  return d.toDateString() === now.toDateString();
}

function isOverdue(date: Date | null, status: TaskStatus): boolean {
  if (!date || status === "done") return false;
  const d = new Date(date);
  const now = new Date();
  return d < now && d.toDateString() !== now.toDateString();
}

export function TaskItem({
  task,
  onEdit,
  onTaskChange,
  dependents = [],
}: TaskItemProps) {
  const [pending, startTransition] = useTransition();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isBlocked = task.blockedBy !== null && task.blockedBy.status !== "done";
  const isBlockingOthers = dependents.length > 0;
  const taskIsOverdue = isOverdue(task.dueDate, task.status);
  const taskIsDueToday = isDueToday(task.dueDate);

  const handleStatusChange = (newStatus: TaskStatus) => {
    startTransition(async () => {
      const result = await updateTask(task.id, { status: newStatus });
      if (result.success) {
        onTaskChange?.();
      }
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteTask({ id: task.id });
      if (result.success) {
        onTaskChange?.();
      }
      setShowDeleteConfirm(false);
    });
  };

  return (
    <Card
      className={`py-3 ${task.status === "done" ? "opacity-60" : ""} ${isBlocked ? "border-amber-200 bg-amber-50/40 dark:border-amber-900/40 dark:bg-amber-900/10" : ""}`}
    >
      <CardContent className="pt-0 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3
                className={`font-medium ${
                  task.status === "done"
                    ? "line-through text-muted-foreground"
                    : ""
                }`}
              >
                {task.title}
              </h3>
              {isBlocked && (
                <Badge
                  variant="outline"
                  className="text-amber-700 border-amber-300 bg-amber-100 text-xs dark:text-amber-400 dark:border-amber-900"
                >
                  Blocked
                </Badge>
              )}
              {isBlockingOthers && (
                <Badge
                  variant="outline"
                  className="text-sky-700 border-sky-200 bg-sky-50 text-xs dark:text-sky-300 dark:border-sky-900"
                >
                  Blocking {dependents.length}
                </Badge>
              )}
            </div>
            {task.description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {task.description}
              </p>
            )}
            {isBlocked && task.blockedBy ? (
              <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                Waiting on {task.blockedBy.title}
              </p>
            ) : null}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Select
              value={task.status}
              onValueChange={handleStatusChange}
              disabled={pending || (isBlocked && task.status !== "done")}
            >
              <SelectTrigger className="w-[130px] h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    disabled={option.value === "done" && isBlocked}
                  >
                    {option.label}
                    {option.value === "done" && isBlocked && " (blocked)"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-white ${
              PRIORITY_COLORS[task.priority]
            }`}
          >
            {PRIORITY_LABELS[task.priority]}
          </span>

          {task.category && (
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: `${task.category.color}20`,
                color: task.category.color,
              }}
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: task.category.color }}
              />
              {task.category.name}
            </span>
          )}

          {task.dueDate && (
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${
                taskIsOverdue
                  ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                  : taskIsDueToday
                    ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                    : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
              }`}
            >
              {taskIsOverdue ? "Overdue: " : ""}
              {formatDueDate(task.dueDate)}
            </span>
          )}

          {task.assignee && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
              {task.assignee.name}
            </span>
          )}

          {task.blockedBy && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
              Blocked by: {task.blockedBy.title}
            </span>
          )}
        </div>

        {isBlockingOthers ? (
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-muted-foreground">Blocks:</span>
            {dependents.map((dependent) => (
              <Badge key={dependent.id} variant="secondary" className="text-xs">
                {dependent.title}
              </Badge>
            ))}
          </div>
        ) : null}

        <div className="flex items-center gap-2 pt-1 border-t">
          {onEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(task)}
              disabled={pending}
              className="h-7 text-xs"
            >
              Edit
            </Button>
          )}
          {showDeleteConfirm ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Delete?</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={pending}
                className="h-7 text-xs"
              >
                Cancel
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                disabled={pending}
                className="h-7 text-xs text-destructive hover:text-destructive"
              >
                {pending ? "Deleting..." : "Confirm"}
              </Button>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={pending}
              className="h-7 text-xs text-destructive hover:text-destructive"
            >
              Delete
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
