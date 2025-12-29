"use server";

import { redirect } from "next/navigation";
import { auth } from "@/features/auth";
import {
  type SignInInput,
  type SignUpInput,
  signInSchema,
  signUpSchema,
} from "@/features/auth/schemas/auth-schemas";
import { createHousehold, joinHousehold } from "@/features/households";
import {
  type CreateHouseholdInput,
  createHouseholdSchema,
  type JoinHouseholdInput,
  joinHouseholdSchema,
} from "@/features/households/schemas/household-schemas";
import { getSession } from "@/lib/session";
import { getValidationErrors } from "@/lib/utils/validation-utils";

type AuthActionResult = {
  success: boolean;
  fieldErrors?: Record<string, string>;
  formError?: string;
};

type HouseholdActionResult = {
  success: boolean;
  fieldErrors?: Record<string, string>;
  formError?: string;
};

export async function signInAction(
  values: SignInInput,
): Promise<AuthActionResult> {
  const validatedData = signInSchema.safeParse(values);
  if (!validatedData.success) {
    return {
      success: false,
      fieldErrors: getValidationErrors(validatedData.error),
    };
  }

  try {
    await auth.api.signInEmail({
      body: validatedData.data,
    });

    // Redirect will be handled by middleware based on household status
    redirect("/dashboard");
  } catch {
    return {
      success: false,
      formError: "Invalid email or password",
    };
  }
}

export async function signUpAction(
  values: SignUpInput,
): Promise<AuthActionResult> {
  const validatedData = signUpSchema.safeParse(values);
  if (!validatedData.success) {
    return {
      success: false,
      fieldErrors: getValidationErrors(validatedData.error),
    };
  }

  try {
    const { confirmPassword: _confirmPassword, ...signUpData } =
      validatedData.data;
    await auth.api.signUpEmail({
      body: signUpData,
    });

    // Redirect to household setup since new users don't have a household
    redirect("/household/setup");
  } catch {
    return {
      success: false,
      formError: "Email already exists or sign up failed",
    };
  }
}

export async function signOutAction() {
  try {
    await auth.api.signOut();
    redirect("/login");
  } catch {
    return {
      success: false,
      error: "Sign out failed",
    };
  }
}

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
