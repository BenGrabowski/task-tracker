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
  // Custom hooks for household association
  hooks: {
    after: [
      {
        matcher(context) {
          return context.path === '/sign-up/email';
        },
        handler: async (ctx) => {
          // After user signs up, they'll need to join or create a household
          // This will be handled in the UI flow
          console.log('New user registered:', ctx.user?.email);
        },
      },
    ],
  },
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.User;