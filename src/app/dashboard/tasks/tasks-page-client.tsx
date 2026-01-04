"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  type FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TaskForm } from "@/features/tasks/components/task-form";
import { TaskList } from "@/features/tasks/components/task-list";
import type { Category, HouseholdMember, Task, TaskSummary } from "@/lib/types";

interface TasksPageClientProps {
  initialTasks: Task[];
  categories: Category[];
  members: HouseholdMember[];
  availableBlockingTasks: TaskSummary[];
  initialSearch?: string;
  initialStatus?: string;
  initialCategoryId?: string;
  initialAssigneeId?: string;
}

export function TasksPageClient({
  initialTasks,
  categories,
  members,
  availableBlockingTasks,
  initialSearch = "",
  initialStatus = "",
  initialCategoryId = "",
  initialAssigneeId = "",
}: TasksPageClientProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [status, setStatus] = useState(initialStatus);
  const [categoryId, setCategoryId] = useState(initialCategoryId);
  const [assigneeId, setAssigneeId] = useState(initialAssigneeId);
  const [pending, startTransition] = useTransition();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const hasMountedRef = useRef(false);
  const hasFilters = Boolean(
    searchTerm.trim() || status || categoryId || assigneeId,
  );

  useEffect(() => {
    setSearchTerm(initialSearch);
  }, [initialSearch]);

  useEffect(() => {
    setStatus(initialStatus);
  }, [initialStatus]);

  useEffect(() => {
    setCategoryId(initialCategoryId);
  }, [initialCategoryId]);

  useEffect(() => {
    setAssigneeId(initialAssigneeId);
  }, [initialAssigneeId]);

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

  const applyFilters = useCallback(() => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams?.toString());
      const trimmed = searchTerm.trim();
      if (trimmed) {
        params.set("q", trimmed);
      } else {
        params.delete("q");
      }

      if (status) {
        params.set("status", status);
      } else {
        params.delete("status");
      }

      if (categoryId) {
        params.set("categoryId", categoryId);
      } else {
        params.delete("categoryId");
      }

      if (assigneeId) {
        params.set("assigneeId", assigneeId);
      } else {
        params.delete("assigneeId");
      }

      const query = params.toString();
      const url = query ? `${pathname}?${query}` : pathname;
      router.replace(url, { scroll: false });
      router.refresh();
    });
  }, [
    assigneeId,
    categoryId,
    pathname,
    router,
    searchParams,
    searchTerm,
    status,
  ]);

  const handleSearchSubmit = (event: FormEvent) => {
    event.preventDefault();
    applyFilters();
  };

  const handleClearFilters = () => {
    setStatus("");
    setCategoryId("");
    setAssigneeId("");
    startTransition(() => {
      const params = new URLSearchParams(searchParams?.toString());
      params.delete("status");
      params.delete("categoryId");
      params.delete("assigneeId");
      const trimmed = searchTerm.trim();
      if (trimmed) {
        params.set("q", trimmed);
      } else {
        params.delete("q");
      }
      const query = params.toString();
      const url = query ? `${pathname}?${query}` : pathname;
      router.replace(url, { scroll: false });
      router.refresh();
    });
  };

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }

    const timeoutId = window.setTimeout(() => {
      applyFilters();
    }, 350);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [applyFilters]);

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

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Search tasks</CardTitle>
          <CardDescription>
            Search across task titles and descriptions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-3" onSubmit={handleSearchSubmit}>
            <div className="flex gap-2">
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search tasks..."
                autoComplete="off"
              />
              <Button type="submit" disabled={pending}>
                {pending ? "Applying..." : "Apply"}
              </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <Select
                value={status || "all"}
                onValueChange={(value) => setStatus(value === "all" ? "" : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={categoryId || "all"}
                onValueChange={(value) => setCategoryId(value === "all" ? "" : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={assigneeId || "all"}
                onValueChange={(value) => setAssigneeId(value === "all" ? "" : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Assignee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All assignees</SelectItem>
                  {members.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={pending}>
                {pending ? "Applying..." : "Apply filters"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleClearFilters}
                disabled={pending}
              >
                Clear filters
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

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
        emptyMessage={
          hasFilters
            ? "No tasks match your filters."
            : "No tasks yet. Create one to get started."
        }
      />
    </div>
  );
}
