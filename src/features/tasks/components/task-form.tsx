"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type {
  Category,
  HouseholdMember,
  TaskPriority,
  TaskStatus,
  TaskSummary,
} from "@/lib/types";
import { createTask, updateTask } from "../actions/task-actions";
import { type TaskFormInput, taskFormSchema } from "../schemas/task-schemas";

interface TaskFormProps {
  task?: {
    id: string;
    title: string;
    description: string | null;
    priority: TaskPriority;
    status: TaskStatus;
    dueDate: Date | null;
    assigneeId: string | null;
    categoryId: string | null;
    blockedByTaskId: string | null;
  };
  categories: Category[];
  members: HouseholdMember[];
  availableBlockingTasks: TaskSummary[];
  onSuccess?: () => void;
  onCancel?: () => void;
}

// Format date for datetime-local input
function formatDateForInput(date: Date | null): string {
  if (!date) return "";
  const d = new Date(date);
  // Format as YYYY-MM-DDTHH:mm for datetime-local
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

const PRIORITY_OPTIONS: { value: TaskPriority; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

export function TaskForm({
  task,
  categories,
  members,
  availableBlockingTasks,
  onSuccess,
  onCancel,
}: TaskFormProps) {
  const [pending, startTransition] = useTransition();
  const isEditing = !!task;

  const form = useForm<TaskFormInput>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: task?.title ?? "",
      description: task?.description ?? "",
      priority: task?.priority ?? "medium",
      dueDate: task?.dueDate ?? null,
      assigneeId: task?.assigneeId ?? null,
      categoryId: task?.categoryId ?? null,
      blockedByTaskId: task?.blockedByTaskId ?? null,
    },
  });

  const onSubmit = (values: TaskFormInput) => {
    startTransition(async () => {
      form.clearErrors();

      const result = isEditing
        ? await updateTask(task.id, values)
        : await createTask(values);

      if (!result.success) {
        form.setError("root", {
          type: "server",
          message: result.error,
        });
        return;
      }

      form.reset();
      onSuccess?.();
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input
                  placeholder="What needs to be done?"
                  autoComplete="off"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Add more details about this task..."
                  className="resize-none"
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Priority</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {PRIORITY_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dueDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Due date (optional)</FormLabel>
                <FormControl>
                  <Input
                    type="datetime-local"
                    {...field}
                    value={formatDateForInput(field.value)}
                    onChange={(e) => {
                      const value = e.target.value;
                      field.onChange(value ? new Date(value) : null);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="assigneeId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Assignee (optional)</FormLabel>
                <Select
                  onValueChange={(val) =>
                    field.onChange(val === "" ? null : val)
                  }
                  value={field.value ?? ""}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Unassigned" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="">
                      <span className="text-muted-foreground">Unassigned</span>
                    </SelectItem>
                    {members.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category (optional)</FormLabel>
                <Select
                  onValueChange={(val) =>
                    field.onChange(val === "" ? null : val)
                  }
                  value={field.value ?? ""}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="No category">
                        {field.value && (
                          <span className="flex items-center gap-2">
                            <span
                              className="h-3 w-3 rounded-full shrink-0"
                              style={{
                                backgroundColor: categories.find(
                                  (c) => c.id === field.value,
                                )?.color,
                              }}
                            />
                            {categories.find((c) => c.id === field.value)?.name}
                          </span>
                        )}
                      </SelectValue>
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="">
                      <span className="text-muted-foreground">No category</span>
                    </SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        <span className="flex items-center gap-2">
                          <span
                            className="h-3 w-3 rounded-full shrink-0"
                            style={{ backgroundColor: category.color }}
                          />
                          {category.name}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {availableBlockingTasks.length > 0 && (
          <FormField
            control={form.control}
            name="blockedByTaskId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Blocked by (optional)</FormLabel>
                <Select
                  onValueChange={(val) =>
                    field.onChange(val === "" ? null : val)
                  }
                  value={field.value ?? ""}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Not blocked" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="">
                      <span className="text-muted-foreground">Not blocked</span>
                    </SelectItem>
                    {availableBlockingTasks.map((blockingTask) => (
                      <SelectItem key={blockingTask.id} value={blockingTask.id}>
                        {blockingTask.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {form.formState.errors.root?.message ? (
          <p className="text-destructive text-sm">
            {String(form.formState.errors.root.message)}
          </p>
        ) : null}

        <div className="flex gap-2">
          {onCancel ? (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={pending}
            >
              Cancel
            </Button>
          ) : null}
          <Button
            type="submit"
            disabled={pending}
            className={onCancel ? "" : "w-full"}
          >
            {pending
              ? isEditing
                ? "Updating..."
                : "Creating..."
              : isEditing
                ? "Update"
                : "Create"}{" "}
            task
          </Button>
        </div>
      </form>
    </Form>
  );
}
