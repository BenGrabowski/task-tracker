"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { joinHouseholdAction } from "@/features/households/actions/household-actions";

interface InvitePageClientProps {
  inviteCode: string;
  inviteStatus: "revoked" | "expired" | "used" | "ok" | undefined;
  householdName: string;
  expiresAt: string | null;
  maxUses: number;
  useCount: number;
  canJoin: boolean;
  showAlreadyMemberMessage: boolean;
  blockReason: string | null;
}

export function InvitePageClient({
  inviteCode,
  inviteStatus,
  householdName,
  expiresAt,
  maxUses,
  useCount,
  canJoin,
  showAlreadyMemberMessage,
  blockReason,
}: InvitePageClientProps) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const isInactive = inviteStatus && inviteStatus !== "ok";

  const formatDate = (value: string | null) => {
    if (!value) return "No expiry";
    return new Date(value).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const statusMessage = (() => {
    switch (inviteStatus) {
      case "revoked":
        return "This invite has been revoked.";
      case "expired":
        return "This invite has expired.";
      case "used":
        return "This invite has already been used.";
      default:
        return null;
    }
  })();

  const handleJoin = () => {
    setError(null);
    startTransition(async () => {
      const result = await joinHouseholdAction({ inviteCode });
      if (!result.success) {
        setError(result.formError ?? "Unable to join household");
      }
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-10">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Join {householdName}</CardTitle>
          <CardDescription>
            Accept this invite to join the household and start collaborating on
            tasks.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border p-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Invite status</span>
              <span className="font-medium capitalize">
                {inviteStatus === "ok" ? "Active" : (inviteStatus ?? "Unknown")}
              </span>
            </div>
            <div className="mt-1 flex justify-between text-muted-foreground">
              <span>Expires</span>
              <span>{formatDate(expiresAt)}</span>
            </div>
            <div className="mt-1 flex justify-between text-muted-foreground">
              <span>Uses</span>
              <span>
                {useCount}/{maxUses}
              </span>
            </div>
          </div>

          {showAlreadyMemberMessage ? (
            <p className="text-sm text-muted-foreground">
              You are already a member of this household.
            </p>
          ) : null}

          {statusMessage ? (
            <p className="text-sm text-destructive">{statusMessage}</p>
          ) : null}

          {blockReason ? (
            <p className="text-sm text-destructive">{blockReason}</p>
          ) : null}

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <Button
            className="w-full"
            disabled={pending || isInactive || !canJoin}
            onClick={handleJoin}
          >
            {pending ? "Joining..." : "Accept invite"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
