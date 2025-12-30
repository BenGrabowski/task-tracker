"use client";

import { Button } from "@/components/ui/button";

interface Category {
  id: string;
  name: string;
  color: string;
}

interface CategoryFilterProps {
  categories: Category[];
  selectedCategoryId?: string | null;
  onCategoryChange: (categoryId: string | null) => void;
  showAll?: boolean;
}

export function CategoryFilter({
  categories,
  selectedCategoryId,
  onCategoryChange,
  showAll = true,
}: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {showAll && (
        <Button
          variant={selectedCategoryId === null ? "default" : "outline"}
          size="sm"
          onClick={() => onCategoryChange(null)}
        >
          All
        </Button>
      )}
      {categories.map((category) => (
        <Button
          key={category.id}
          variant={selectedCategoryId === category.id ? "default" : "outline"}
          size="sm"
          onClick={() => onCategoryChange(category.id)}
          className="gap-2"
        >
          <span
            className="h-2.5 w-2.5 rounded-full shrink-0"
            style={{ backgroundColor: category.color }}
          />
          {category.name}
        </Button>
      ))}
    </div>
  );
}
