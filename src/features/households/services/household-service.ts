import { randomBytes } from "crypto";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db/connection";
import { householdInvites, households, user } from "@/lib/db/schema";

export interface CreateHouseholdData {
  name: string;
  userId: string;
}

export interface JoinHouseholdData {
  inviteCode: string;
  userId: string;
}

export interface GenerateInviteData {
  householdId: string;
  userId: string;
  expiresInDays?: number;
  maxUses?: number;
}

export interface RevokeInviteData {
  code: string;
  householdId: string;
}

export interface InviteDetailsResult {
  success: boolean;
  error?: string;
  invite?: {
    id: string;
    code: string;
    householdId: string;
    householdName?: string;
    expiresAt: Date | null;
    maxUses: number;
    useCount: number;
    revoked: boolean;
    createdAt: Date;
  };
  status?: "revoked" | "expired" | "used" | "ok";
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
    const [invite] = await db
      .select()
      .from(householdInvites)
      .where(eq(householdInvites.code, data.inviteCode))
      .limit(1);

    if (!invite) {
      return { success: false, error: "Invite not found" };
    }

    if (invite.revoked) {
      return { success: false, error: "Invite has been revoked" };
    }

    const now = new Date();
    if (invite.expiresAt && invite.expiresAt <= now) {
      return { success: false, error: "Invite has expired" };
    }

    if (invite.useCount >= invite.maxUses) {
      return { success: false, error: "Invite has already been used" };
    }

    const [existingUser] = await db
      .select({ householdId: user.householdId })
      .from(user)
      .where(eq(user.id, data.userId))
      .limit(1);

    if (
      existingUser?.householdId &&
      existingUser.householdId !== invite.householdId
    ) {
      return { success: false, error: "You are already in a household" };
    }

    const [household] = await db
      .select()
      .from(households)
      .where(eq(households.id, invite.householdId))
      .limit(1);

    if (!household) {
      return { success: false, error: "Household not found" };
    }

    // If the user is already in this household, treat as a no-op and do not consume the invite
    if (existingUser?.householdId === household.id) {
      return { success: true, household };
    }

    await db.transaction(async (tx) => {
      await tx
        .update(user)
        .set({
          householdId: invite.householdId,
        })
        .where(eq(user.id, data.userId));

      const nextUseCount = invite.useCount + 1;
      await tx
        .update(householdInvites)
        .set({
          useCount: nextUseCount,
          revoked: nextUseCount >= invite.maxUses,
        })
        .where(eq(householdInvites.id, invite.id));
    });

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

// Get household by ID with members
export async function getHouseholdWithMembers(householdId: string) {
  try {
    const household = await db.query.households.findFirst({
      where: eq(households.id, householdId),
      with: {
        users: true,
      },
    });

    return household || null;
  } catch (error) {
    console.error("Error getting household with members:", error);
    return null;
  }
}

export interface UpdateHouseholdData {
  householdId: string;
  name: string;
}

// Update household name
export async function updateHousehold(data: UpdateHouseholdData) {
  try {
    const [updated] = await db
      .update(households)
      .set({
        name: data.name,
      })
      .where(eq(households.id, data.householdId))
      .returning();

    return { success: true, household: updated };
  } catch (error) {
    console.error("Error updating household:", error);
    return { success: false, error: "Failed to update household" };
  }
}

function generateInviteCode() {
  return randomBytes(16).toString("base64url");
}

export async function generateInvite(data: GenerateInviteData) {
  try {
    const expiresAt = data.expiresInDays
      ? new Date(Date.now() + data.expiresInDays * 24 * 60 * 60 * 1000)
      : null;

    let code = generateInviteCode();
    let attempts = 0;

    while (attempts < 5) {
      const [existing] = await db
        .select({ id: householdInvites.id })
        .from(householdInvites)
        .where(eq(householdInvites.code, code))
        .limit(1);

      if (!existing) break;

      attempts += 1;
      code = generateInviteCode();
    }

    const [invite] = await db
      .insert(householdInvites)
      .values({
        code,
        householdId: data.householdId,
        createdByUserId: data.userId,
        expiresAt,
        maxUses: data.maxUses ?? 1,
      })
      .returning();

    return { success: true, invite };
  } catch (error) {
    console.error("Error generating invite:", error);
    return { success: false, error: "Failed to generate invite" };
  }
}

export async function revokeInvite(data: RevokeInviteData) {
  try {
    const result = await db
      .update(householdInvites)
      .set({ revoked: true })
      .where(
        and(
          eq(householdInvites.code, data.code),
          eq(householdInvites.householdId, data.householdId),
        ),
      )
      .returning();

    if (!result.length) {
      return { success: false, error: "Invite not found" };
    }

    return { success: true, invite: result[0] };
  } catch (error) {
    console.error("Error revoking invite:", error);
    return { success: false, error: "Failed to revoke invite" };
  }
}

export async function listActiveInvites(householdId: string) {
  try {
    const now = new Date();
    const invites = await db
      .select()
      .from(householdInvites)
      .where(
        and(
          eq(householdInvites.householdId, householdId),
          eq(householdInvites.revoked, false),
        ),
      )
      .orderBy(householdInvites.createdAt);

    return invites.filter(
      (invite) =>
        (!invite.expiresAt || invite.expiresAt > now) &&
        invite.useCount < invite.maxUses,
    );
  } catch (error) {
    console.error("Error listing invites:", error);
    return [];
  }
}

export async function getInviteDetails(
  code: string,
): Promise<InviteDetailsResult> {
  try {
    const invite = await db.query.householdInvites.findFirst({
      where: eq(householdInvites.code, code),
      with: {
        household: true,
      },
    });

    if (!invite) {
      return { success: false, error: "Invite not found" };
    }

    const now = new Date();
    const expired = invite.expiresAt ? invite.expiresAt <= now : false;
    const usedUp = invite.useCount >= invite.maxUses;
    const status: InviteDetailsResult["status"] = invite.revoked
      ? "revoked"
      : expired
        ? "expired"
        : usedUp
          ? "used"
          : "ok";

    return {
      success: true,
      status,
      invite: {
        id: invite.id,
        code: invite.code,
        householdId: invite.householdId,
        householdName: invite.household?.name,
        expiresAt: invite.expiresAt,
        maxUses: invite.maxUses,
        useCount: invite.useCount,
        revoked: invite.revoked,
        createdAt: invite.createdAt,
      },
    };
  } catch (error) {
    console.error("Error fetching invite details:", error);
    return { success: false, error: "Failed to load invite" };
  }
}
