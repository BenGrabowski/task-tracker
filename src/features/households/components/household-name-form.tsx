"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { updateHouseholdAction } from "../actions/household-actions";
import {
  type CreateHouseholdInput,
  createHouseholdSchema,
} from "../schemas/household-schemas";

interface HouseholdNameFormProps {
  currentName: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function HouseholdNameForm({
  currentName,
  onSuccess,
  onCancel,
}: HouseholdNameFormProps) {
  const [pending, startTransition] = useTransition();

  const form = useForm<CreateHouseholdInput>({
    resolver: zodResolver(createHouseholdSchema),
    defaultValues: {
      name: currentName,
    },
  });

  const onSubmit = (values: CreateHouseholdInput) => {
    startTransition(async () => {
      form.clearErrors();

      const result = await updateHouseholdAction(values);

      if (!result.success) {
        if (result.fieldErrors) {
          for (const [field, error] of Object.entries(result.fieldErrors)) {
            form.setError(field as keyof CreateHouseholdInput, {
              type: "server",
              message: error,
            });
          }
        }
        if (result.formError) {
          form.setError("root", {
            type: "server",
            message: result.formError,
          });
        }
        return;
      }

      onSuccess?.();
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Household name</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g. The Smith Family"
                  autoComplete="off"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {form.formState.errors.root?.message ? (
          <p className="text-destructive text-sm">
            {String(form.formState.errors.root.message)}
          </p>
        ) : null}

        <div className="flex gap-2">
          {onCancel ? (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={pending}
            >
              Cancel
            </Button>
          ) : null}
          <Button type="submit" disabled={pending}>
            Save changes
          </Button>
        </div>
      </form>
    </Form>
  );
}
