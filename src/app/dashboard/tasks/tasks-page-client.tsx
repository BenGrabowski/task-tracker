"use client";

import { ChevronDown, SlidersHorizontal } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { type FormEvent, useState, useTransition } from "react";

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
  const [showFilters, setShowFilters] = useState(
    Boolean(initialStatus || initialCategoryId || initialAssigneeId),
  );
  const [pending, startTransition] = useTransition();
  const pathname = usePathname();
  const router = useRouter();

  const hasFilters = Boolean(
    searchTerm.trim() || status || categoryId || assigneeId,
  );
  const activeFilterCount = [status, categoryId, assigneeId].filter(Boolean).length;

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

  const navigateWithFilters = (filters: {
    q?: string;
    status?: string;
    categoryId?: string;
    assigneeId?: string;
  }) => {
    startTransition(() => {
      const params = new URLSearchParams();
      if (filters.q) params.set("q", filters.q);
      if (filters.status) params.set("status", filters.status);
      if (filters.categoryId) params.set("categoryId", filters.categoryId);
      if (filters.assigneeId) params.set("assigneeId", filters.assigneeId);

      const query = params.toString();
      const url = query ? `${pathname}?${query}` : pathname;
      router.replace(url, { scroll: false });
      router.refresh();
    });
  };

  const handleApplyFilters = (event: FormEvent) => {
    event.preventDefault();
    navigateWithFilters({
      q: searchTerm.trim(),
      status,
      categoryId,
      assigneeId,
    });
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setStatus("");
    setCategoryId("");
    setAssigneeId("");
    navigateWithFilters({});
  };

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
        <CardContent className="pt-4">
          <form className="space-y-3" onSubmit={handleApplyFilters}>
            <div className="flex gap-2">
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search tasks..."
                autoComplete="off"
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="gap-1.5"
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span>Filters</span>
                {activeFilterCount > 0 && (
                  <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                    {activeFilterCount}
                  </span>
                )}
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${showFilters ? "rotate-180" : ""}`}
                />
              </Button>
            </div>

            {showFilters && (
              <div className="flex flex-wrap items-center gap-2">
                <Select
                  value={status || "all"}
                  onValueChange={(value) => setStatus(value === "all" ? "" : value)}
                >
                  <SelectTrigger className="w-[130px]">
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
                  <SelectTrigger className="w-[140px]">
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
                  <SelectTrigger className="w-[140px]">
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

                <div className="ml-auto flex gap-2">
                  <Button type="submit" size="sm" disabled={pending}>
                    {pending ? "Applying..." : "Apply"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleClearFilters}
                    disabled={pending || !hasFilters}
                  >
                    Clear
                  </Button>
                </div>
              </div>
            )}
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
