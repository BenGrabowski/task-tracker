/**
 * Shared types for the household task tracker application.
 * These types represent the core domain models used across features.
 */

// User / Household member type
export interface HouseholdMember {
  id: string;
  name: string;
  email: string;
  image: string | null;
}

// Category type
export interface Category {
  id: string;
  name: string;
  color: string;
}

// Task status and priority enums
export type TaskStatus = "todo" | "in_progress" | "done";
export type TaskPriority = "low" | "medium" | "high";

// Summary of a task (used for blocking relationships)
export interface TaskSummary {
  id: string;
  title: string;
  status: TaskStatus;
}

// Full task type with relations
export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: Date | null;
  completedAt: Date | null;
  assignee: HouseholdMember | null;
  assigneeId: string | null;
  category: Category | null;
  categoryId: string | null;
  blockedBy: TaskSummary | null;
  blockedByTaskId: string | null;
  householdId: string;
  createdAt: Date;
  updatedAt: Date;
}
