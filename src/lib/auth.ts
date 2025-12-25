import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from './db/connection';
import * as schema from './db/schema';

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Set to true in production
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  secret: process.env.BETTER_AUTH_SECRET || 'fallback-secret-change-in-production',
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3000',
  user: {
    additionalFields: {
      householdId: {
        type: 'string',
        required: false,
        defaultValue: null,
        input: false, // Don't allow user to set household during signup
      },
    },
  },
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;