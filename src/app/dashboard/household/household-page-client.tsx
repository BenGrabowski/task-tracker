"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Copy, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  generateInviteAction,
  revokeInviteAction,
} from "@/features/households/actions/household-actions";
import { HouseholdNameForm } from "@/features/households/components/household-name-form";
import { MemberList } from "@/features/households/components/member-list";
import {
  type GenerateInviteInput,
  generateInviteSchema,
} from "@/features/households/schemas/household-schemas";

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
  const [isInviting, startInviting] = useTransition();
  const [isRevoking, startRevoking] = useTransition();
  const router = useRouter();

  const inviteForm = useForm<GenerateInviteInput>({
    resolver: zodResolver(generateInviteSchema),
    defaultValues: {
      householdId: household.id,
      expiresInDays: 7,
      maxUses: 1,
    },
  });

  const handleSuccess = () => {
    setIsEditing(false);
    router.refresh();
  };

  const origin = useMemo(
    () => (typeof window !== "undefined" ? window.location.origin : ""),
    [],
  );

  const activeInvites = useMemo(() => invites, [invites]);

  const handleGenerateInvite = (values: GenerateInviteInput) => {
    inviteForm.clearErrors();
    startInviting(async () => {
      const result = await generateInviteAction(values);

      if (!result.success) {
        if (result.formError) {
          inviteForm.setError("root", {
            type: "server",
            message: result.formError,
          });
        }
        return;
      }

      inviteForm.reset();
      router.refresh();
    });
  };

  const handleRevokeInvite = (code: string) => {
    inviteForm.clearErrors();
    startRevoking(async () => {
      const result = await revokeInviteAction(code);

      if (!result.success) {
        inviteForm.setError("root", {
          type: "server",
          message: result.formError ?? "Failed to revoke invite",
        });
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
          <Form {...inviteForm}>
            <form
              onSubmit={inviteForm.handleSubmit(handleGenerateInvite)}
              className="space-y-4"
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <FormField
                  control={inviteForm.control}
                  name="expiresInDays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expires in (days)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          max={30}
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={inviteForm.control}
                  name="maxUses"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max uses</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          max={10}
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex items-center gap-3">
                <Button type="submit" disabled={isInviting}>
                  Generate invite link
                </Button>
                {inviteForm.formState.errors.root?.message ? (
                  <p className="text-sm text-destructive">
                    {inviteForm.formState.errors.root.message}
                  </p>
                ) : null}
              </div>
            </form>
          </Form>

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
