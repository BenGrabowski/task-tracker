import { z } from "zod";

// Common validation patterns
export const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const hexColorRegex = /^#[0-9A-F]{6}$/i;

// Common validation schemas
export const uuidSchema = z.string().regex(uuidRegex, "Invalid UUID format");
export const hexColorSchema = z
  .string()
  .regex(hexColorRegex, "Invalid hex color format");

// Utility function to validate UUID
export const isValidUuid = (value: string): boolean => {
  return uuidRegex.test(value);
};

// Utility function to validate hex color
export const isValidHexColor = (value: string): boolean => {
  return hexColorRegex.test(value);
};

// Generic validation result type
export type ValidationResult<T> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      error: z.ZodError;
    };

// Helper function to safely parse and return validation result
export function safeValidate<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
): ValidationResult<T> {
  const result = schema.safeParse(data);

  if (result.success) {
    return {
      success: true,
      data: result.data,
    };
  }

  return {
    success: false,
    error: result.error,
  };
}

// Helper function to format validation errors for user display
export function formatValidationError(error: z.ZodError): string {
  const firstError = error.issues[0];
  if (firstError) {
    return firstError.message;
  }
  return "Validation failed";
}

// Helper function to get all validation errors as a record
export function getValidationErrors(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {};

  error.issues.forEach((issue: z.ZodIssue) => {
    const path = issue.path.join(".");
    if (path) {
      errors[path] = issue.message;
    }
  });

  return errors;
}

// Common date validation helpers
export const dateInFuture = (date: Date): boolean => {
  return date > new Date();
};

export const dateInPast = (date: Date): boolean => {
  return date < new Date();
};

// Schema for date validation
export const futureDateSchema = z.date().refine(dateInFuture, {
  message: "Date must be in the future",
});

export const pastDateSchema = z.date().refine(dateInPast, {
  message: "Date must be in the past",
});

// Common string transformations
export const trimmedString = z.string().transform((val) => val.trim());
export const lowercaseString = z.string().transform((val) => val.toLowerCase());
export const uppercaseString = z.string().transform((val) => val.toUpperCase());
