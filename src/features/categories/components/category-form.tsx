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
import { createCategory, updateCategory } from "../actions/category-actions";
import {
  type CategoryFormInput,
  categoryFormSchema,
} from "../schemas/category-schemas";

// Predefined color palette for easy selection
const COLOR_PALETTE = [
  "#ef4444", // red
  "#f97316", // orange
  "#f59e0b", // amber
  "#84cc16", // lime
  "#22c55e", // green
  "#14b8a6", // teal
  "#06b6d4", // cyan
  "#3b82f6", // blue
  "#8b5cf6", // violet
  "#d946ef", // fuchsia
  "#ec4899", // pink
  "#6b7280", // gray
];

interface CategoryFormProps {
  category?: {
    id: string;
    name: string;
    color: string;
  };
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CategoryForm({
  category,
  onSuccess,
  onCancel,
}: CategoryFormProps) {
  const [pending, startTransition] = useTransition();
  const isEditing = !!category;

  const form = useForm<CategoryFormInput>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: category?.name ?? "",
      color: category?.color ?? "#6b7280",
    },
  });

  const selectedColor = form.watch("color");

  const onSubmit = (values: CategoryFormInput) => {
    startTransition(async () => {
      form.clearErrors();

      const result = isEditing
        ? await updateCategory(category.id, values)
        : await createCategory(values);

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
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category name</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g. Cleaning, Groceries"
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
          name="color"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Color</FormLabel>
              <FormControl>
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {COLOR_PALETTE.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => field.onChange(color)}
                        className={`h-8 w-8 rounded-full transition-all ${
                          selectedColor === color
                            ? "ring-2 ring-offset-2 ring-ring"
                            : "hover:scale-110"
                        }`}
                        style={{ backgroundColor: color }}
                        aria-label={`Select color ${color}`}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="text"
                      placeholder="#6b7280"
                      className="w-28 font-mono text-sm"
                      {...field}
                    />
                    <div
                      className="h-9 w-9 rounded-md border"
                      style={{ backgroundColor: field.value }}
                    />
                  </div>
                </div>
              </FormControl>
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
            {isEditing ? "Update" : "Create"} category
          </Button>
        </div>
      </form>
    </Form>
  );
}
