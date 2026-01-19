import Link from "next/link";

import RegisterForm from "./register-form";

interface RegisterPageProps {
  searchParams: Promise<{ redirect?: string }>;
}

export default async function RegisterPage({
  searchParams,
}: RegisterPageProps) {
  const params = await searchParams;
  const loginHref = params.redirect
    ? `/login?redirect=${encodeURIComponent(params.redirect)}`
    : "/login";

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="w-full max-w-md space-y-6">
        <header className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold">Create account</h1>
          <p className="text-muted-foreground">
            Sign up to start tracking household tasks.
          </p>
        </header>

        <RegisterForm />

        <p className="text-muted-foreground text-center text-sm">
          Already have an account?{" "}
          <Link href={loginHref} className="text-foreground underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
