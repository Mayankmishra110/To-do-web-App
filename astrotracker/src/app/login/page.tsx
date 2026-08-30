import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/guard";
import { LoginForm } from "./login-form";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if (await getCurrentUser()) redirect("/dashboard");

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-sm flex-col justify-center px-6 py-16">
      <div className="mb-8">
        <p className="label-caps">AstroTracker</p>
        <h1 className="mt-2 text-xl font-medium">Sign in</h1>
        <p className="mt-2 text-sm text-ink-muted">
          A private system. One account, one person.
        </p>
      </div>
      <LoginForm />
    </main>
  );
}
