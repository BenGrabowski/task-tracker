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
import { CategoryForm } from "@/features/categories/components/category-form";
import { CategoryList } from "@/features/categories/components/category-list";

interface Category {
  id: string;
  name: string;
  color: string;
  createdAt: Date;
}

interface CategoriesPageClientProps {
  initialCategories: Category[];
}

export function CategoriesPageClient({
  initialCategories,
}: CategoriesPageClientProps) {
  const [showForm, setShowForm] = useState(false);
  const router = useRouter();

  const handleCategoryChange = () => {
    router.refresh();
  };

  return (
    <div className="container max-w-2xl py-8 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Categories</h1>
          <p className="text-muted-foreground">
            Organize your tasks with categories.
          </p>
        </div>
        {!showForm && (
          <Button onClick={() => setShowForm(true)}>Add category</Button>
        )}
      </header>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>New category</CardTitle>
            <CardDescription>
              Create a new category to organize your tasks.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CategoryForm
              onSuccess={() => {
                setShowForm(false);
                handleCategoryChange();
              }}
              onCancel={() => setShowForm(false)}
            />
          </CardContent>
        </Card>
      )}

      <CategoryList
        categories={initialCategories}
        onCategoryChange={handleCategoryChange}
      />
    </div>
  );
}
