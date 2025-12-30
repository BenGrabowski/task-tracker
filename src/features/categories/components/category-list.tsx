"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { deleteCategory } from "../actions/category-actions";
import { CategoryForm } from "./category-form";

interface Category {
  id: string;
  name: string;
  color: string;
  createdAt: Date;
}

interface CategoryListProps {
  categories: Category[];
  onCategoryChange?: () => void;
}

export function CategoryList({
  categories,
  onCategoryChange,
}: CategoryListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const handleDelete = (categoryId: string) => {
    startTransition(async () => {
      setDeletingId(categoryId);
      const result = await deleteCategory({ id: categoryId });
      setDeletingId(null);

      if (result.success) {
        onCategoryChange?.();
      }
    });
  };

  if (categories.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No categories yet.</p>
        <p className="text-sm">
          Create one to get started organizing your tasks.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {categories.map((category) => (
        <Card key={category.id} className="py-4">
          {editingId === category.id ? (
            <CardContent className="pt-0">
              <CategoryForm
                category={category}
                onSuccess={() => {
                  setEditingId(null);
                  onCategoryChange?.();
                }}
                onCancel={() => setEditingId(null)}
              />
            </CardContent>
          ) : (
            <CardContent className="flex items-center justify-between pt-0">
              <div className="flex items-center gap-3">
                <div
                  className="h-4 w-4 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
                <span className="font-medium">{category.name}</span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingId(category.id)}
                  disabled={pending}
                >
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(category.id)}
                  disabled={pending || deletingId === category.id}
                  className="text-destructive hover:text-destructive"
                >
                  {deletingId === category.id ? "Deleting..." : "Delete"}
                </Button>
              </div>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
}
