import { redirect } from "next/navigation";
import { getHouseholdSettingsAction } from "@/features/households";
import { HouseholdPageClient } from "./household-page-client";

export default async function HouseholdPage() {
  const result = await getHouseholdSettingsAction();

  if (!result.success || !result.household) {
    redirect("/household/setup");
  }

  return (
    <HouseholdPageClient
      household={result.household}
      members={result.members}
      invites={result.invites ?? []}
      currentUserId={result.currentUserId}
    />
  );
}
