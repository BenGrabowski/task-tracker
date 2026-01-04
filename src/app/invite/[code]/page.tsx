import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/features/auth";
import { getInviteDetails } from "@/features/households/services/household-service";
import { InvitePageClient } from "./invite-page-client";

interface InvitePageProps {
  params: { code: string };
}

export default async function InvitePage({ params }: InvitePageProps) {
  const code = decodeURIComponent(params.code);
  const inviteResult = await getInviteDetails(code);

  if (!inviteResult.success || !inviteResult.invite) {
    notFound();
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect(`/login?redirect=/invite/${code}`);
  }

  const userHouseholdId = session.user.householdId;
  const alreadyInHousehold = Boolean(userHouseholdId);
  const differentHousehold =
    alreadyInHousehold && userHouseholdId !== inviteResult.invite.householdId;

  return (
    <InvitePageClient
      inviteCode={code}
      inviteStatus={inviteResult.status ?? "ok"}
      householdName={inviteResult.invite.householdName ?? "This household"}
      expiresAt={inviteResult.invite.expiresAt?.toISOString() ?? null}
      maxUses={inviteResult.invite.maxUses}
      useCount={inviteResult.invite.useCount}
      canJoin={!differentHousehold && inviteResult.status === "ok"}
      showAlreadyMemberMessage={alreadyInHousehold && !differentHousehold}
      blockReason={
        differentHousehold ? "You are already in a different household." : null
      }
    />
  );
}
