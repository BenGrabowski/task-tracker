import Link from "next/link";

import LoginForm from "./login-form";

interface LoginPageProps {
  searchParams: Promise<{ redirect?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const registerHref = params.redirect
    ? `/register?redirect=${encodeURIComponent(params.redirect)}`
    : "/register";

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="w-full max-w-md space-y-6">
        <header className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold">Sign in</h1>
          <p className="text-muted-foreground">
            Welcome back. Sign in to your household.
          </p>
        </header>

        <LoginForm />

        <p className="text-muted-foreground text-center text-sm">
          Don&apos;t have an account?{" "}
          <Link href={registerHref} className="text-foreground underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
