import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { type FormEvent } from "react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { useAuth } from "@/lib/auth-store";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [{ title: "Create an account — Magnetic Cosmetics" }],
  }),
  component: SignupPage,
});

function SignupPage() {
  const login = useAuth((s) => s.login);
  const navigate = useNavigate();

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const email = String(f.get("email") || "");
    const name = String(f.get("name") || "");
    if (!email) return;
    login(email, name);
    toast.success("Welcome to Magnetic Cosmetics");
    navigate({ to: "/account" });
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <section className="mx-auto max-w-md px-6 pb-32 pt-20">
        <div className="text-center">
          <span className="eyebrow text-primary">Atelier</span>
          <h1 className="mt-4 font-display text-5xl italic">
            Compose your story.
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Create an account to keep your favorites and orders in one place.
          </p>
        </div>

        <form onSubmit={onSubmit} className="mt-10 space-y-5">
          <Field label="Name" name="name" required />
          <Field label="Email" name="email" type="email" required />
          <Field label="Password" name="password" type="password" required />
          <button className="w-full rounded-full bg-foreground px-6 py-3 text-sm text-background transition hover:bg-primary">
            Create account
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="text-foreground underline-offset-4 hover:underline">
            Sign in
          </Link>
        </p>
      </section>
      <SiteFooter />
    </div>
  );
}

function Field({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="eyebrow text-muted-foreground">{label}</span>
      <input
        {...props}
        className="mt-1 w-full border border-border bg-background px-3 py-2 text-sm outline-none transition focus:border-foreground"
      />
    </label>
  );
}
