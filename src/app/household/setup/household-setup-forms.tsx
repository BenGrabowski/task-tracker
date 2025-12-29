"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
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
  createHouseholdAction,
  joinHouseholdAction,
} from "@/features/auth/actions/auth-actions";
import {
  type CreateHouseholdInput,
  createHouseholdSchema,
  type JoinHouseholdInput,
  joinHouseholdSchema,
} from "@/features/households/schemas/household-schemas";

export default function HouseholdSetupForms() {
  const [createPending, startCreateTransition] = useTransition();
  const [joinPending, startJoinTransition] = useTransition();

  const createForm = useForm<CreateHouseholdInput>({
    resolver: zodResolver(createHouseholdSchema),
    defaultValues: {
      name: "",
    },
  });

  const joinForm = useForm<JoinHouseholdInput>({
    resolver: zodResolver(joinHouseholdSchema),
    defaultValues: {
      inviteCode: "",
    },
  });

  const onCreate = (values: CreateHouseholdInput) => {
    startCreateTransition(async () => {
      createForm.clearErrors();
      const result = await createHouseholdAction(values);
      if (!result.success) {
        if (result.fieldErrors) {
          Object.entries(result.fieldErrors).forEach(([fieldName, message]) => {
            createForm.setError(fieldName as "name", {
              type: "server",
              message,
            });
          });
        }

        if (result.formError) {
          createForm.setError("root", {
            type: "server",
            message: result.formError,
          });
        }
      }
    });
  };

  const onJoin = (values: JoinHouseholdInput) => {
    startJoinTransition(async () => {
      joinForm.clearErrors();
      const result = await joinHouseholdAction(values);
      if (!result.success) {
        if (result.fieldErrors) {
          Object.entries(result.fieldErrors).forEach(([fieldName, message]) => {
            joinForm.setError(fieldName as "inviteCode", {
              type: "server",
              message,
            });
          });
        }

        if (result.formError) {
          joinForm.setError("root", {
            type: "server",
            message: result.formError,
          });
        }
      }
    });
  };

  return (
    <div className="w-full max-w-2xl space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Set up your household</h1>
        <p className="text-muted-foreground">
          Create a new household or join an existing one.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Create household</CardTitle>
            <CardDescription>Start a new shared space.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...createForm}>
              <form
                onSubmit={createForm.handleSubmit(onCreate)}
                className="space-y-4"
              >
                <FormField
                  control={createForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Household name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. The Smiths"
                          autoComplete="organization"
                          required
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={createPending}
                >
                  Create
                </Button>

                {createForm.formState.errors.root?.message ? (
                  <p className="text-destructive text-sm">
                    {String(createForm.formState.errors.root.message)}
                  </p>
                ) : null}
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Join household</CardTitle>
            <CardDescription>Use an invite code or name.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...joinForm}>
              <form
                onSubmit={joinForm.handleSubmit(onJoin)}
                className="space-y-4"
              >
                <FormField
                  control={joinForm.control}
                  name="inviteCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Invite code</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter invite code"
                          autoComplete="one-time-code"
                          required
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  variant="secondary"
                  className="w-full"
                  disabled={joinPending}
                >
                  Join
                </Button>

                {joinForm.formState.errors.root?.message ? (
                  <p className="text-destructive text-sm">
                    {String(joinForm.formState.errors.root.message)}
                  </p>
                ) : null}
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
