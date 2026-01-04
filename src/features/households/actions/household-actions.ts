"use server";

import { redirect } from "next/navigation";
import {
  type CreateHouseholdInput,
  createHouseholdSchema,
  type GenerateInviteInput,
  generateInviteSchema,
  type JoinHouseholdInput,
  joinHouseholdSchema,
  type UpdateHouseholdInput,
  updateHouseholdSchema,
} from "@/features/households/schemas/household-schemas";
import {
  createHousehold,
  generateInvite,
  getHouseholdWithMembers,
  joinHousehold,
  listActiveInvites,
  revokeInvite,
  updateHousehold,
} from "@/features/households/services/household-service";
import { getSession, requireHousehold } from "@/lib/session";
import { getValidationErrors } from "@/lib/utils/validation-utils";

type HouseholdActionResult = {
  success: boolean;
  fieldErrors?: Record<string, string>;
  formError?: string;
};

export async function createHouseholdAction(
  values: CreateHouseholdInput,
): Promise<HouseholdActionResult> {
  const session = await getSession();
  if (!session?.user) {
    redirect("/login");
  }

  const validatedData = createHouseholdSchema.safeParse(values);
  if (!validatedData.success) {
    return {
      success: false,
      fieldErrors: getValidationErrors(validatedData.error),
    };
  }

  const result = await createHousehold({
    name: validatedData.data.name,
    userId: session.user.id,
  });

  if (result.success) {
    redirect("/");
  }

  return {
    success: false,
    formError: result.error ?? "Failed to create household",
  };
}

export async function joinHouseholdAction(
  values: JoinHouseholdInput,
): Promise<HouseholdActionResult> {
  const session = await getSession();
  if (!session?.user) {
    redirect("/login");
  }

  const validatedData = joinHouseholdSchema.safeParse(values);
  if (!validatedData.success) {
    return {
      success: false,
      fieldErrors: getValidationErrors(validatedData.error),
    };
  }

  const result = await joinHousehold({
    inviteCode: validatedData.data.inviteCode,
    userId: session.user.id,
  });

  if (result.success) {
    redirect("/");
  }

  return {
    success: false,
    formError: result.error ?? "Failed to join household",
  };
}

export async function updateHouseholdAction(
  values: UpdateHouseholdInput,
): Promise<HouseholdActionResult> {
  const session = await requireHousehold();
  const householdId = session.user.householdId;

  if (!householdId) {
    return { success: false, formError: "No household found" };
  }

  const validatedData = updateHouseholdSchema.safeParse(values);
  if (!validatedData.success) {
    return {
      success: false,
      fieldErrors: getValidationErrors(validatedData.error),
    };
  }

  if (!validatedData.data.name) {
    return { success: false, fieldErrors: { name: "Name is required" } };
  }

  const result = await updateHousehold({
    householdId,
    name: validatedData.data.name,
  });

  if (result.success) {
    return { success: true };
  }

  return {
    success: false,
    formError: result.error ?? "Failed to update household",
  };
}

export async function getHouseholdSettingsAction() {
  const session = await requireHousehold();
  const householdId = session.user.householdId;

  if (!householdId) {
    return { success: false, error: "No household found" };
  }

  const household = await getHouseholdWithMembers(householdId);

  const invites = await listActiveInvites(householdId);

  if (!household) {
    return { success: false, error: "Household not found" };
  }

  return {
    success: true,
    household: {
      id: household.id,
      name: household.name,
      createdAt: household.createdAt,
    },
    members: household.users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      image: u.image,
    })),
    invites: invites.map((invite) => ({
      ...invite,
      expiresAt: invite.expiresAt ? invite.expiresAt.toISOString() : null,
      createdAt: invite.createdAt.toISOString(),
    })),
    currentUserId: session.user.id,
  };
}

export async function generateInviteAction(
  values: GenerateInviteInput,
): Promise<HouseholdActionResult & { inviteCode?: string }> {
  const session = await requireHousehold();
  const householdId = session.user.householdId;

  if (!householdId) {
    return { success: false, formError: "No household found" };
  }

  const parsed = generateInviteSchema.safeParse(values);
  if (!parsed.success) {
    return {
      success: false,
      fieldErrors: getValidationErrors(parsed.error),
    };
  }

  if (parsed.data.householdId !== householdId) {
    return { success: false, formError: "Invalid household context" };
  }

  const result = await generateInvite({
    householdId,
    userId: session.user.id,
    expiresInDays: parsed.data.expiresInDays,
    maxUses: parsed.data.maxUses,
  });

  if (!result.success || !result.invite) {
    return {
      success: false,
      formError: result.error ?? "Failed to create invite",
    };
  }

  return { success: true, inviteCode: result.invite.code };
}

export async function revokeInviteAction(code: string) {
  const session = await requireHousehold();
  const householdId = session.user.householdId;

  if (!householdId) {
    return { success: false, formError: "No household found" };
  }

  const result = await revokeInvite({ code, householdId });

  if (!result.success) {
    return {
      success: false,
      formError: result.error ?? "Failed to revoke invite",
    };
  }

  return { success: true };
}
