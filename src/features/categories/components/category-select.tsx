"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Category {
  id: string;
  name: string;
  color: string;
}

interface CategorySelectProps {
  categories: Category[];
  value?: string | null;
  onValueChange: (categoryId: string | null) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function CategorySelect({
  categories,
  value,
  onValueChange,
  placeholder = "Select category",
  disabled = false,
  className,
}: CategorySelectProps) {
  return (
    <Select
      value={value ?? ""}
      onValueChange={(val) => onValueChange(val === "" ? null : val)}
      disabled={disabled}
    >
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder}>
          {value && (
            <span className="flex items-center gap-2">
              <span
                className="h-3 w-3 rounded-full shrink-0"
                style={{
                  backgroundColor: categories.find((c) => c.id === value)
                    ?.color,
                }}
              />
              {categories.find((c) => c.id === value)?.name}
            </span>
          )}
        </SelectValue>
      </SelectTrigger>
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
  );
}
