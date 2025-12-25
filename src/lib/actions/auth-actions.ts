'use server';

import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { createHousehold, joinHousehold } from '@/lib/household';
import { z } from 'zod';

// Validation schemas
const signInSchema = z.object({
  email: z.email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const signUpSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const createHouseholdSchema = z.object({
  name: z.string().min(1, 'Household name is required').max(50, 'Name too long'),
});

const joinHouseholdSchema = z.object({
  inviteCode: z.string().min(1, 'Invite code is required'),
});

export async function signInAction(formData: FormData) {
  const rawData = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  };

  const validatedData = signInSchema.safeParse(rawData);
  if (!validatedData.success) {
    return {
      success: false,
      errors: validatedData.error.issues,
    };
  }

  try {
    await auth.api.signInEmail({
      body: validatedData.data,
    });

    // Redirect will be handled by middleware based on household status
    redirect('/dashboard');
  } catch (error) {
    return {
      success: false,
      error: 'Invalid email or password',
    };
  }
}

export async function signUpAction(formData: FormData) {
  const rawData = {
    name: formData.get('name') as string,
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  };

  const validatedData = signUpSchema.safeParse(rawData);
  if (!validatedData.success) {
    return {
      success: false,
      errors: validatedData.error.issues,
    };
  }

  try {
    await auth.api.signUpEmail({
      body: validatedData.data,
    });

    // Redirect to household setup since new users don't have a household
    redirect('/household/setup');
  } catch (error) {
    return {
      success: false,
      error: 'Email already exists or sign up failed',
    };
  }
}

export async function signOutAction() {
  try {
    await auth.api.signOut();
    redirect('/login');
  } catch (error) {
    return {
      success: false,
      error: 'Sign out failed',
    };
  }
}

export async function createHouseholdAction(formData: FormData) {
  const session = await auth.api.getSession();
  if (!session?.user) {
    redirect('/login');
  }

  const rawData = {
    name: formData.get('name') as string,
  };

  const validatedData = createHouseholdSchema.safeParse(rawData);
  if (!validatedData.success) {
    return {
      success: false,
      errors: validatedData.error.issues,
    };
  }

  const result = await createHousehold({
    name: validatedData.data.name,
    userId: session.user.id,
  });

  if (result.success) {
    redirect('/dashboard');
  }

  return result;
}

export async function joinHouseholdAction(formData: FormData) {
  const session = await auth.api.getSession();
  if (!session?.user) {
    redirect('/login');
  }

  const rawData = {
    inviteCode: formData.get('inviteCode') as string,
  };

  const validatedData = joinHouseholdSchema.safeParse(rawData);
  if (!validatedData.success) {
    return {
      success: false,
      errors: validatedData.error.issues,
    };
  }

  const result = await joinHousehold({
    inviteCode: validatedData.data.inviteCode,
    userId: session.user.id,
  });

  if (result.success) {
    redirect('/dashboard');
  }

  return result;
}