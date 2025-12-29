import { eq } from "drizzle-orm";
import { db } from "@/lib/db/connection";
import { households, user } from "@/lib/db/schema";

export interface CreateHouseholdData {
  name: string;
  userId: string;
}

export interface JoinHouseholdData {
  inviteCode: string;
  userId: string;
}

// Create a new household and associate the user with it
export async function createHousehold(data: CreateHouseholdData) {
  try {
    // Create the household
    const [household] = await db
      .insert(households)
      .values({
        name: data.name,
      })
      .returning();

    // Associate the user with the household
    await db
      .update(user)
      .set({
        householdId: household.id,
      })
      .where(eq(user.id, data.userId));

    return { success: true, household };
  } catch (error) {
    console.error("Error creating household:", error);
    return { success: false, error: "Failed to create household" };
  }
}

// Join an existing household (simplified - in production you'd want proper invite codes)
export async function joinHousehold(data: JoinHouseholdData) {
  try {
    // For now, treat inviteCode as household name (simplified)
    // In production, you'd have a proper invite system
    const [household] = await db
      .select()
      .from(households)
      .where(eq(households.name, data.inviteCode))
      .limit(1);

    if (!household) {
      return { success: false, error: "Household not found" };
    }

    // Associate the user with the household
    await db
      .update(user)
      .set({
        householdId: household.id,
      })
      .where(eq(user.id, data.userId));

    return { success: true, household };
  } catch (error) {
    console.error("Error joining household:", error);
    return { success: false, error: "Failed to join household" };
  }
}

// Get user's household
export async function getUserHousehold(userId: string) {
  try {
    const [userWithHousehold] = await db.query.user.findMany({
      where: eq(user.id, userId),
      with: {
        household: true,
      },
      limit: 1,
    });

    return userWithHousehold?.household || null;
  } catch (error) {
    console.error("Error getting user household:", error);
    return null;
  }
}
