import { inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

// Use relative URL so auth requests go to the same origin automatically
export const authClient = createAuthClient({
  baseURL: "",
  plugins: [
    inferAdditionalFields({
      user: {
        householdId: {
          type: "string",
          required: false,
        },
      },
    }),
  ],
});

export const { signIn, signUp, signOut, useSession, getSession } = authClient;
