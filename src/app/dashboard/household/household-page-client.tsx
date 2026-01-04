"use client";

import { Copy, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  generateInviteAction,
  revokeInviteAction,
} from "@/features/households/actions/household-actions";
import { HouseholdNameForm } from "@/features/households/components/household-name-form";
import { MemberList } from "@/features/households/components/member-list";

interface Household {
  id: string;
  name: string;
  createdAt: Date;
}

interface Member {
  id: string;
  name: string;
  email: string;
  image: string | null;
}

interface Invite {
  id: string;
  code: string;
  expiresAt: string | null;
  maxUses: number;
  useCount: number;
  revoked: boolean;
  createdAt: string;
}

interface HouseholdPageClientProps {
  household: Household;
  members: Member[];
  invites: Invite[];
  currentUserId: string;
}

export function HouseholdPageClient({
  household,
  members,
  invites,
  currentUserId,
}: HouseholdPageClientProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [expiresInDays, setExpiresInDays] = useState(7);
  const [maxUses, setMaxUses] = useState(1);
  const [isInviting, startInviting] = useTransition();
  const [isRevoking, startRevoking] = useTransition();
  const router = useRouter();

  const handleSuccess = () => {
    setIsEditing(false);
    router.refresh();
  };

  const origin = useMemo(
    () => (typeof window !== "undefined" ? window.location.origin : ""),
    [],
  );

  const activeInvites = useMemo(() => invites, [invites]);

  const handleGenerateInvite = () => {
    setInviteError(null);
    startInviting(async () => {
      const result = await generateInviteAction({
        householdId: household.id,
        expiresInDays,
        maxUses,
      });

      if (!result.success) {
        setInviteError(result.formError ?? "Failed to create invite");
        return;
      }

      router.refresh();
    });
  };

  const handleRevokeInvite = (code: string) => {
    setInviteError(null);
    startRevoking(async () => {
      const result = await revokeInviteAction(code);

      if (!result.success) {
        setInviteError(result.formError ?? "Failed to revoke invite");
        return;
      }

      router.refresh();
    });
  };

  const formatDate = (value: string | null) => {
    if (!value) return "No expiry";
    return new Date(value).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="container max-w-2xl py-8 space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Household Settings</h1>
        <p className="text-muted-foreground">
          Manage your household information and members.
        </p>
      </header>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>Household Information</CardTitle>
              <CardDescription>
                Created on{" "}
                {new Date(household.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </CardDescription>
            </div>
            {!isEditing && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                <Pencil className="mr-2 size-4" />
                Edit
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <HouseholdNameForm
              currentName={household.name}
              onSuccess={handleSuccess}
              onCancel={() => setIsEditing(false)}
            />
          ) : (
            <div>
              <p className="text-sm text-muted-foreground">Household name</p>
              <p className="text-lg font-medium">{household.name}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Invites</CardTitle>
          <CardDescription>
            Generate invite links to add new household members.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <FormLabel>Expires in (days)</FormLabel>
              <Input
                type="number"
                min={1}
                max={30}
                value={expiresInDays}
                onChange={(e) => setExpiresInDays(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <FormLabel>Max uses</FormLabel>
              <Input
                type="number"
                min={1}
                max={10}
                value={maxUses}
                onChange={(e) => setMaxUses(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button onClick={handleGenerateInvite} disabled={isInviting}>
              Generate invite link
            </Button>
            {inviteError ? (
              <p className="text-sm text-destructive">{inviteError}</p>
            ) : null}
          </div>

          {activeInvites.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No active invites. Create one to get started.
            </p>
          ) : (
            <div className="space-y-3">
              {activeInvites.map((invite) => {
                const url = origin
                  ? `${origin}/invite/${invite.code}`
                  : invite.code;
                const uses = `${invite.useCount}/${invite.maxUses}`;

                return (
                  <div
                    key={invite.id}
                    className="flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium break-all">{url}</p>
                      <p className="text-xs text-muted-foreground">
                        Expires: {formatDate(invite.expiresAt)} · Uses: {uses}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigator.clipboard.writeText(url)}
                      >
                        <Copy className="mr-2 size-4" /> Copy
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRevokeInvite(invite.code)}
                        disabled={isRevoking}
                      >
                        <Trash2 className="mr-2 size-4" /> Revoke
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <MemberList members={members} currentUserId={currentUserId} />
    </div>
  );
}
