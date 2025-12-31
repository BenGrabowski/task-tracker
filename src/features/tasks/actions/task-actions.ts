"use server";

import { and, eq, ilike, isNull, lte, ne, or, sql } from "drizzle-orm";
import { db } from "@/lib/db/connection";
import { categories, tasks, user } from "@/lib/db/schema";
import { requireHousehold } from "@/lib/session";
import {
  type CreateTaskInput,
  createTaskSchema,
  type DeleteTaskInput,
  deleteTaskSchema,
  type TaskFilterInput,
  taskFilterSchema,
  type UpdateTaskInput,
  updateTaskSchema,
} from "../schemas/task-schemas";

// Helper to get a task with household scoping
async function getTaskInHousehold(taskId: string, householdId: string) {
  const [task] = await db
    .select()
    .from(tasks)
    .where(and(eq(tasks.id, taskId), eq(tasks.householdId, householdId)))
    .limit(1);
  return task;
}

// Helper to check if a user belongs to a household
async function isUserInHousehold(userId: string, householdId: string) {
  const [foundUser] = await db
    .select({ id: user.id })
    .from(user)
    .where(and(eq(user.id, userId), eq(user.householdId, householdId)))
    .limit(1);
  return !!foundUser;
}

// Helper to check if a category belongs to a household
async function isCategoryInHousehold(categoryId: string, householdId: string) {
  const [category] = await db
    .select({ id: categories.id })
    .from(categories)
    .where(
      and(
        eq(categories.id, categoryId),
        eq(categories.householdId, householdId),
      ),
    )
    .limit(1);
  return !!category;
}

// Helper to detect circular dependencies
async function wouldCreateCycle(
  taskId: string,
  blockedByTaskId: string,
  householdId: string,
): Promise<boolean> {
  // Check if blockedByTaskId is blocked (directly or transitively) by taskId
  const visited = new Set<string>();
  const queue = [blockedByTaskId];

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    if (visited.has(currentId)) continue;
    visited.add(currentId);

    // If we reach the original task, we have a cycle
    if (currentId === taskId) return true;

    // Get the task that blocks the current task
    const task = await getTaskInHousehold(currentId, householdId);
    if (task?.blockedByTaskId) {
      queue.push(task.blockedByTaskId);
    }
  }

  return false;
}

// Create a new task
export async function createTask(input: CreateTaskInput) {
  try {
    const session = await requireHousehold();
    const householdId = session.user.householdId;

    if (!householdId) {
      return { success: false, error: "User must be part of a household" };
    }

    // Validate input
    const validatedData = createTaskSchema.parse(input);

    // Validate assignee belongs to household
    if (validatedData.assigneeId) {
      const assigneeInHousehold = await isUserInHousehold(
        validatedData.assigneeId,
        householdId,
      );
      if (!assigneeInHousehold) {
        return {
          success: false,
          error: "Assignee must be a member of the household",
        };
      }
    }

    // Validate category belongs to household
    if (validatedData.categoryId) {
      const categoryInHousehold = await isCategoryInHousehold(
        validatedData.categoryId,
        householdId,
      );
      if (!categoryInHousehold) {
        return {
          success: false,
          error: "Category does not belong to this household",
        };
      }
    }

    // Validate blocking task exists and belongs to household
    if (validatedData.blockedByTaskId) {
      const blockingTask = await getTaskInHousehold(
        validatedData.blockedByTaskId,
        householdId,
      );
      if (!blockingTask) {
        return {
          success: false,
          error: "Blocking task not found or does not belong to this household",
        };
      }
    }

    // Create task
    const [task] = await db
      .insert(tasks)
      .values({
        title: validatedData.title,
        description: validatedData.description,
        priority: validatedData.priority,
        dueDate: validatedData.dueDate,
        assigneeId: validatedData.assigneeId,
        categoryId: validatedData.categoryId,
        blockedByTaskId: validatedData.blockedByTaskId,
        householdId,
        status: "todo",
      })
      .returning();

    return { success: true, task };
  } catch (error) {
    console.error("Error creating task:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to create task" };
  }
}

// Get all tasks for the current household
export async function getTasks(filter?: TaskFilterInput) {
  try {
    const session = await requireHousehold();
    const householdId = session.user.householdId;

    if (!householdId) {
      return {
        success: false,
        error: "User must be part of a household",
        tasks: [],
      };
    }

    // Validate filter if provided
    const validatedFilter = filter ? taskFilterSchema.parse(filter) : undefined;

    // Build conditions
    const conditions = [eq(tasks.householdId, householdId)];

    if (validatedFilter?.status) {
      conditions.push(eq(tasks.status, validatedFilter.status));
    }

    if (validatedFilter?.assigneeId) {
      conditions.push(eq(tasks.assigneeId, validatedFilter.assigneeId));
    }

    if (validatedFilter?.categoryId) {
      conditions.push(eq(tasks.categoryId, validatedFilter.categoryId));
    }

    if (validatedFilter?.priority) {
      conditions.push(eq(tasks.priority, validatedFilter.priority));
    }

    if (validatedFilter?.dueDate) {
      conditions.push(lte(tasks.dueDate, validatedFilter.dueDate));
    }

    if (validatedFilter?.search) {
      conditions.push(
        or(
          ilike(tasks.title, `%${validatedFilter.search}%`),
          ilike(tasks.description, `%${validatedFilter.search}%`),
        )!,
      );
    }

    const householdTasks = await db.query.tasks.findMany({
      where: and(...conditions),
      with: {
        assignee: {
          columns: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        category: true,
        blockedBy: {
          columns: {
            id: true,
            title: true,
            status: true,
          },
        },
      },
      orderBy: (tasks, { desc, asc }) => [
        asc(tasks.status),
        desc(tasks.priority),
        asc(tasks.dueDate),
      ],
    });

    return { success: true, tasks: householdTasks };
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return {
      success: false,
      error: "Failed to fetch tasks",
      tasks: [],
    };
  }
}

// Get a single task by ID
export async function getTaskById(taskId: string) {
  try {
    const session = await requireHousehold();
    const householdId = session.user.householdId;

    if (!householdId) {
      return {
        success: false,
        error: "User must be part of a household",
        task: null,
      };
    }

    const task = await db.query.tasks.findFirst({
      where: and(eq(tasks.id, taskId), eq(tasks.householdId, householdId)),
      with: {
        assignee: {
          columns: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        category: true,
        blockedBy: {
          columns: {
            id: true,
            title: true,
            status: true,
          },
        },
        blocking: {
          columns: {
            id: true,
            title: true,
            status: true,
          },
        },
      },
    });

    if (!task) {
      return { success: false, error: "Task not found", task: null };
    }

    return { success: true, task };
  } catch (error) {
    console.error("Error fetching task:", error);
    return {
      success: false,
      error: "Failed to fetch task",
      task: null,
    };
  }
}

// Update an existing task
export async function updateTask(taskId: string, input: UpdateTaskInput) {
  try {
    const session = await requireHousehold();
    const householdId = session.user.householdId;

    if (!householdId) {
      return { success: false, error: "User must be part of a household" };
    }

    // Validate input
    const validatedData = updateTaskSchema.parse(input);

    // Get current task to check status transitions and validate changes
    const currentTask = await getTaskInHousehold(taskId, householdId);
    if (!currentTask) {
      return { success: false, error: "Task not found or access denied" };
    }

    // If updating status to "done", check dependency constraints
    if (validatedData.status === "done" && currentTask.status !== "done") {
      // Check if task is blocked by an incomplete task
      if (currentTask.blockedByTaskId) {
        const blockingTask = await getTaskInHousehold(
          currentTask.blockedByTaskId,
          householdId,
        );
        if (blockingTask && blockingTask.status !== "done") {
          return {
            success: false,
            error: "Cannot complete task: blocked by an incomplete task",
          };
        }
      }
    }

    // Validate assignee belongs to household
    if (validatedData.assigneeId) {
      const assigneeInHousehold = await isUserInHousehold(
        validatedData.assigneeId,
        householdId,
      );
      if (!assigneeInHousehold) {
        return {
          success: false,
          error: "Assignee must be a member of the household",
        };
      }
    }

    // Validate category belongs to household
    if (validatedData.categoryId) {
      const categoryInHousehold = await isCategoryInHousehold(
        validatedData.categoryId,
        householdId,
      );
      if (!categoryInHousehold) {
        return {
          success: false,
          error: "Category does not belong to this household",
        };
      }
    }

    // Validate blocking task and check for cycles
    if (validatedData.blockedByTaskId !== undefined) {
      if (validatedData.blockedByTaskId) {
        // Check that blocking task exists
        const blockingTask = await getTaskInHousehold(
          validatedData.blockedByTaskId,
          householdId,
        );
        if (!blockingTask) {
          return {
            success: false,
            error:
              "Blocking task not found or does not belong to this household",
          };
        }

        // Check for circular dependency
        const wouldCycle = await wouldCreateCycle(
          taskId,
          validatedData.blockedByTaskId,
          householdId,
        );
        if (wouldCycle) {
          return {
            success: false,
            error: "Cannot create circular dependency",
          };
        }
      }
    }

    // Build update values
    const updateValues: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (validatedData.title !== undefined) {
      updateValues.title = validatedData.title;
    }
    if (validatedData.description !== undefined) {
      updateValues.description = validatedData.description;
    }
    if (validatedData.priority !== undefined) {
      updateValues.priority = validatedData.priority;
    }
    if (validatedData.dueDate !== undefined) {
      updateValues.dueDate = validatedData.dueDate;
    }
    if (validatedData.assigneeId !== undefined) {
      updateValues.assigneeId = validatedData.assigneeId;
    }
    if (validatedData.categoryId !== undefined) {
      updateValues.categoryId = validatedData.categoryId;
    }
    if (validatedData.blockedByTaskId !== undefined) {
      updateValues.blockedByTaskId = validatedData.blockedByTaskId;
    }

    // Handle status changes
    if (validatedData.status !== undefined) {
      updateValues.status = validatedData.status;

      // Set completedAt when marking as done
      if (validatedData.status === "done" && currentTask.status !== "done") {
        updateValues.completedAt = new Date();
      }
      // Clear completedAt when changing from done to another status
      else if (
        validatedData.status !== "done" &&
        currentTask.status === "done"
      ) {
        updateValues.completedAt = null;
      }
    }

    // Update task
    const [updatedTask] = await db
      .update(tasks)
      .set(updateValues)
      .where(and(eq(tasks.id, taskId), eq(tasks.householdId, householdId)))
      .returning();

    if (!updatedTask) {
      return { success: false, error: "Task not found or access denied" };
    }

    return { success: true, task: updatedTask };
  } catch (error) {
    console.error("Error updating task:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to update task" };
  }
}

// Delete a task
export async function deleteTask(input: DeleteTaskInput) {
  try {
    const session = await requireHousehold();
    const householdId = session.user.householdId;

    if (!householdId) {
      return { success: false, error: "User must be part of a household" };
    }

    // Validate input
    const validatedData = deleteTaskSchema.parse(input);
    const taskId = validatedData.id;

    // First, clear dependency references from all tasks that are blocked by this task
    await db
      .update(tasks)
      .set({ blockedByTaskId: null })
      .where(
        and(
          eq(tasks.blockedByTaskId, taskId),
          eq(tasks.householdId, householdId),
        ),
      );

    // Delete the task (only if it belongs to user's household)
    const [deletedTask] = await db
      .delete(tasks)
      .where(and(eq(tasks.id, taskId), eq(tasks.householdId, householdId)))
      .returning();

    if (!deletedTask) {
      return { success: false, error: "Task not found or access denied" };
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting task:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to delete task" };
  }
}

// Get tasks due today or overdue (for the "Today" view)
export async function getTodayTasks() {
  try {
    const session = await requireHousehold();
    const householdId = session.user.householdId;

    if (!householdId) {
      return {
        success: false,
        error: "User must be part of a household",
        tasks: [],
      };
    }

    // Get the end of today (midnight tonight)
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const todayTasks = await db.query.tasks.findMany({
      where: and(
        eq(tasks.householdId, householdId),
        ne(tasks.status, "done"),
        lte(tasks.dueDate, today),
      ),
      with: {
        assignee: {
          columns: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        category: true,
        blockedBy: {
          columns: {
            id: true,
            title: true,
            status: true,
          },
        },
      },
      orderBy: (tasks, { asc, desc }) => [
        asc(tasks.dueDate),
        desc(tasks.priority),
      ],
    });

    return { success: true, tasks: todayTasks };
  } catch (error) {
    console.error("Error fetching today's tasks:", error);
    return {
      success: false,
      error: "Failed to fetch today's tasks",
      tasks: [],
    };
  }
}

// Get household members for task assignment dropdown
export async function getHouseholdMembers() {
  try {
    const session = await requireHousehold();
    const householdId = session.user.householdId;

    if (!householdId) {
      return {
        success: false,
        error: "User must be part of a household",
        members: [],
      };
    }

    const members = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
      })
      .from(user)
      .where(eq(user.householdId, householdId))
      .orderBy(user.name);

    return { success: true, members };
  } catch (error) {
    console.error("Error fetching household members:", error);
    return {
      success: false,
      error: "Failed to fetch household members",
      members: [],
    };
  }
}

// Get tasks that can be used as blockers (exclude the current task and tasks that would create a cycle)
export async function getAvailableBlockingTasks(excludeTaskId?: string) {
  try {
    const session = await requireHousehold();
    const householdId = session.user.householdId;

    if (!householdId) {
      return {
        success: false,
        error: "User must be part of a household",
        tasks: [],
      };
    }

    const conditions = [
      eq(tasks.householdId, householdId),
      ne(tasks.status, "done"),
    ];

    if (excludeTaskId) {
      conditions.push(ne(tasks.id, excludeTaskId));
    }

    const availableTasks = await db
      .select({
        id: tasks.id,
        title: tasks.title,
        status: tasks.status,
      })
      .from(tasks)
      .where(and(...conditions))
      .orderBy(tasks.title);

    return { success: true, tasks: availableTasks };
  } catch (error) {
    console.error("Error fetching available blocking tasks:", error);
    return {
      success: false,
      error: "Failed to fetch available blocking tasks",
      tasks: [],
    };
  }
}
