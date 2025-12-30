"use server";

import { redirect } from "next/navigation";
import { createHousehold, joinHousehold } from "@/features/households";
import {
  type CreateHouseholdInput,
  createHouseholdSchema,
  type JoinHouseholdInput,
  joinHouseholdSchema,
} from "@/features/households/schemas/household-schemas";
import { getSession } from "@/lib/session";
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
