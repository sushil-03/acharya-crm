import { createFileRoute } from "@tanstack/react-router";
import { LoginForm } from "@/components/auth/login/login";
import { LoginHero } from "@/components/auth/login/login-hero";
import { useAuthGuard } from "@/hooks/use-auth-guard";

export const Route = createFileRoute("/login")({
  component: Login,
  head: () => ({ meta: [{ title: "Sign in — Acharya One" }] }),
});

function Login() {
  useAuthGuard({ isProtectedRoute: false });
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      <LoginHero />

      <div className="flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-sm">
          <h2 className="font-display text-2xl font-bold">Sign in to Acharya One</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Enter your credentials to access your account.
          </p>

          <LoginForm />

          <div className="mt-4 flex items-center justify-between text-[12px]">
            <label className="flex items-center gap-1.5">
              <input type="checkbox" className="rounded" /> Remember me
            </label>
            <a className="text-primary font-medium" href="#">
              Forgot password?
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
