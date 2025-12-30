import { z } from "zod";

// UUID validation regex
const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Color validation - hex color format
const hexColorRegex = /^#[0-9A-F]{6}$/i;

// Base category schema for creation (API accepts optional color with default)
export const createCategorySchema = z.object({
  name: z
    .string()
    .min(1, "Category name is required")
    .max(50, "Category name must be 50 characters or less")
    .trim(),
  color: z
    .string()
    .regex(hexColorRegex, "Color must be a valid hex color (e.g., #FF5733)")
    .default("#6b7280"),
});

// Form schema with required color (for React Hook Form)
export const categoryFormSchema = z.object({
  name: z
    .string()
    .min(1, "Category name is required")
    .max(50, "Category name must be 50 characters or less")
    .trim(),
  color: z
    .string()
    .regex(hexColorRegex, "Color must be a valid hex color (e.g., #FF5733)"),
});

// Category update schema
export const updateCategorySchema = createCategorySchema.partial();

// Category filter schema
export const categoryFilterSchema = z.object({
  name: z.string().max(50, "Search query too long").optional(),
  householdId: z.string().regex(uuidRegex, "Invalid household ID").optional(),
});

// Schema for category deletion
export const deleteCategorySchema = z.object({
  id: z.string().regex(uuidRegex, "Invalid category ID"),
});

// Type exports for use in components and actions
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type CategoryFormInput = z.infer<typeof categoryFormSchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type CategoryFilterInput = z.infer<typeof categoryFilterSchema>;
export type DeleteCategoryInput = z.infer<typeof deleteCategorySchema>;
