import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/features/auth";

// Get current session (server-side)
export async function getSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return session;
}

// Get current session and redirect if not authenticated
export async function requireAuth() {
  const session = await getSession();

  if (!session?.user) {
    redirect("/login");
  }

  return session;
}

// Get current session and ensure user has a household
export async function requireHousehold() {
  const session = await requireAuth();

  if (!session.user.householdId) {
    redirect("/household/setup");
  }

  return session;
}
