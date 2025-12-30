"use server";

import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db/connection";
import { categories, tasks } from "@/lib/db/schema";
import { requireHousehold } from "@/lib/session";
import {
  type CreateCategoryInput,
  createCategorySchema,
  type DeleteCategoryInput,
  deleteCategorySchema,
  type UpdateCategoryInput,
  updateCategorySchema,
} from "../schemas/category-schemas";

// Create a new category
export async function createCategory(input: CreateCategoryInput) {
  try {
    const session = await requireHousehold();
    const householdId = session.user.householdId;

    if (!householdId) {
      return { success: false, error: "User must be part of a household" };
    }

    // Validate input
    const validatedData = createCategorySchema.parse(input);

    // Create category
    const [category] = await db
      .insert(categories)
      .values({
        name: validatedData.name,
        color: validatedData.color,
        householdId,
      })
      .returning();

    return { success: true, category };
  } catch (error) {
    console.error("Error creating category:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to create category" };
  }
}

// Get all categories for the current household
export async function getCategories() {
  try {
    const session = await requireHousehold();
    const householdId = session.user.householdId;

    if (!householdId) {
      return {
        success: false,
        error: "User must be part of a household",
        categories: [],
      };
    }

    const householdCategories = await db.query.categories.findMany({
      where: eq(categories.householdId, householdId),
      orderBy: (categories, { asc }) => [asc(categories.name)],
    });

    return { success: true, categories: householdCategories };
  } catch (error) {
    console.error("Error fetching categories:", error);
    return {
      success: false,
      error: "Failed to fetch categories",
      categories: [],
    };
  }
}

// Get a single category by ID
export async function getCategoryById(categoryId: string) {
  try {
    const session = await requireHousehold();
    const householdId = session.user.householdId;

    if (!householdId) {
      return {
        success: false,
        error: "User must be part of a household",
        category: null,
      };
    }

    const [category] = await db
      .select()
      .from(categories)
      .where(
        and(
          eq(categories.id, categoryId),
          eq(categories.householdId, householdId),
        ),
      )
      .limit(1);

    if (!category) {
      return { success: false, error: "Category not found", category: null };
    }

    return { success: true, category };
  } catch (error) {
    console.error("Error fetching category:", error);
    return {
      success: false,
      error: "Failed to fetch category",
      category: null,
    };
  }
}

// Update an existing category
export async function updateCategory(
  categoryId: string,
  input: UpdateCategoryInput,
) {
  try {
    const session = await requireHousehold();
    const householdId = session.user.householdId;

    if (!householdId) {
      return { success: false, error: "User must be part of a household" };
    }

    // Validate input
    const validatedData = updateCategorySchema.parse(input);

    // Update category (only if it belongs to user's household)
    const [updatedCategory] = await db
      .update(categories)
      .set(validatedData)
      .where(
        and(
          eq(categories.id, categoryId),
          eq(categories.householdId, householdId),
        ),
      )
      .returning();

    if (!updatedCategory) {
      return { success: false, error: "Category not found or access denied" };
    }

    return { success: true, category: updatedCategory };
  } catch (error) {
    console.error("Error updating category:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to update category" };
  }
}

// Delete a category
export async function deleteCategory(input: DeleteCategoryInput) {
  try {
    const session = await requireHousehold();
    const householdId = session.user.householdId;

    if (!householdId) {
      return { success: false, error: "User must be part of a household" };
    }

    // Validate input
    const validatedData = deleteCategorySchema.parse(input);
    const categoryId = validatedData.id;

    // First, clear category references from all tasks
    await db
      .update(tasks)
      .set({ categoryId: null })
      .where(
        and(
          eq(tasks.categoryId, categoryId),
          eq(tasks.householdId, householdId),
        ),
      );

    // Delete the category (only if it belongs to user's household)
    const [deletedCategory] = await db
      .delete(categories)
      .where(
        and(
          eq(categories.id, categoryId),
          eq(categories.householdId, householdId),
        ),
      )
      .returning();

    if (!deletedCategory) {
      return { success: false, error: "Category not found or access denied" };
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting category:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to delete category" };
  }
}

// Get tasks count for a category
export async function getCategoryTaskCount(categoryId: string) {
  try {
    const session = await requireHousehold();
    const householdId = session.user.householdId;

    if (!householdId) {
      return {
        success: false,
        error: "User must be part of a household",
        count: 0,
      };
    }

    const categoryTasks = await db
      .select()
      .from(tasks)
      .where(
        and(
          eq(tasks.categoryId, categoryId),
          eq(tasks.householdId, householdId),
        ),
      );

    return { success: true, count: categoryTasks.length };
  } catch (error) {
    console.error("Error fetching category task count:", error);
    return { success: false, error: "Failed to fetch task count", count: 0 };
  }
}
