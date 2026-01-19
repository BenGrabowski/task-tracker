import { z } from "zod";

// UUID validation regex
const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Base household schema for creation
export const createHouseholdSchema = z.object({
  name: z
    .string()
    .min(1, "Household name is required")
    .max(50, "Household name must be 50 characters or less")
    .trim(),
});

// Household update schema
export const updateHouseholdSchema = createHouseholdSchema.partial();

// Schema for joining a household
export const joinHouseholdSchema = z.object({
  inviteCode: z
    .string()
    .min(1, "Invite code is required")
    .max(100, "Invalid invite code format"),
});

// Schema for household member management
export const addMemberSchema = z.object({
  email: z.email("Invalid email address"),
  householdId: z.string().regex(uuidRegex, "Invalid household ID"),
});

// Schema for removing a member from household
export const removeMemberSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  householdId: z.string().regex(uuidRegex, "Invalid household ID"),
});

// Schema for household selection/switching
export const selectHouseholdSchema = z.object({
  householdId: z.string().regex(uuidRegex, "Invalid household ID"),
});

// Schema for generating invite codes
export const generateInviteSchema = z.object({
  householdId: z.string().regex(uuidRegex, "Invalid household ID"),
  expiresInDays: z
    .number()
    .min(1, "Expiration must be at least 1 day")
    .max(30, "Expiration cannot exceed 30 days"),
  maxUses: z
    .number()
    .int("Max uses must be an integer")
    .min(1, "Max uses must be at least 1")
    .max(10, "Max uses cannot exceed 10"),
});

// Type exports for use in components and actions
export type CreateHouseholdInput = z.infer<typeof createHouseholdSchema>;
export type UpdateHouseholdInput = z.infer<typeof updateHouseholdSchema>;
export type JoinHouseholdInput = z.infer<typeof joinHouseholdSchema>;
export type AddMemberInput = z.infer<typeof addMemberSchema>;
export type RemoveMemberInput = z.infer<typeof removeMemberSchema>;
export type SelectHouseholdInput = z.infer<typeof selectHouseholdSchema>;
export type GenerateInviteInput = z.infer<typeof generateInviteSchema>;
