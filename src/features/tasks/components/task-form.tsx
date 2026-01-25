"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon } from "lucide-react";
import { useEffect, useTransition } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
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
    blockedBy?: TaskSummary | null;
  };
  categories: Category[];
  members: HouseholdMember[];
  availableBlockingTasks: TaskSummary[];
  onSuccess?: () => void;
  onCancel?: () => void;
}

// Format date for display
function formatDate(date: Date | null): string {
  if (!date) return "Pick a date";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

const PRIORITY_OPTIONS: { value: TaskPriority; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

// Placeholder value for "none" selections (empty string not allowed by Radix Select)
const NONE_VALUE = "__none__";

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

  // Reset form when task prop changes (e.g., switching from add to edit mode)
  useEffect(() => {
    form.reset({
      title: task?.title ?? "",
      description: task?.description ?? "",
      priority: task?.priority ?? "medium",
      dueDate: task?.dueDate ?? null,
      assigneeId: task?.assigneeId ?? null,
      categoryId: task?.categoryId ?? null,
      blockedByTaskId: task?.blockedByTaskId ?? null,
    });
  }, [task, form]);

  const blockingOptions = (() => {
    if (!task?.blockedBy || !task.blockedByTaskId) {
      return availableBlockingTasks;
    }

    const existsInOptions = availableBlockingTasks.some(
      (t) => t.id === task.blockedByTaskId,
    );

    if (existsInOptions) return availableBlockingTasks;

    return [
      ...availableBlockingTasks,
      {
        id: task.blockedByTaskId,
        title: task.blockedBy.title,
        status: task.blockedBy.status,
      },
    ];
  })();

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
              <FormItem className="flex flex-col">
                <FormLabel>Due date (optional)</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground",
                        )}
                      >
                        {formatDate(field.value)}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value ?? undefined}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date < new Date(new Date().setHours(0, 0, 0, 0))
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
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
                    field.onChange(val === NONE_VALUE ? null : val)
                  }
                  value={field.value ?? NONE_VALUE}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Unassigned" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={NONE_VALUE}>
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
                    field.onChange(val === NONE_VALUE ? null : val)
                  }
                  value={field.value ?? NONE_VALUE}
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
                    <SelectItem value={NONE_VALUE}>
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

        <FormField
          control={form.control}
          name="blockedByTaskId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Blocked by (optional)</FormLabel>
              <Select
                onValueChange={(val) =>
                  field.onChange(val === NONE_VALUE ? null : val)
                }
                value={field.value ?? NONE_VALUE}
                disabled={blockingOptions.length === 0}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Not blocked" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={NONE_VALUE}>
                    <span className="text-muted-foreground">Not blocked</span>
                  </SelectItem>
                  {blockingOptions.map((blockingTask) => (
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
