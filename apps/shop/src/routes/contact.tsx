import { createFileRoute } from "@tanstack/react-router";
import { type FormEvent } from "react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Magnetic Cosmetics" },
      { name: "description", content: "Write to the Magnetic Cosmetics atelier." },
      { property: "og:title", content: "Contact — Magnetic Cosmetics" },
      { property: "og:description", content: "Write to the Magnetic Cosmetics atelier." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    (e.currentTarget as HTMLFormElement).reset();
    toast.success("Your letter has been sent. We'll write back soon.");
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <section className="mx-auto grid max-w-6xl gap-16 px-6 pb-32 pt-20 md:grid-cols-2">
        <div>
          <span className="eyebrow text-primary">Letters</span>
          <h1 className="mt-6 font-display text-5xl italic leading-tight md:text-6xl">
            Write to the atelier.
          </h1>
          <p className="mt-6 text-muted-foreground leading-relaxed">
            For private commissions, press, wholesale or simply to tell us what
            a scent reminded you of — we read every note.
          </p>
          <dl className="mt-10 space-y-5 text-sm">
            <div>
              <dt className="eyebrow text-muted-foreground">Email</dt>
              <dd className="mt-1 font-display text-lg">hello@magnetic.co</dd>
            </div>
            <div>
              <dt className="eyebrow text-muted-foreground">Atelier</dt>
              <dd className="mt-1">14 rue des Saints-Pères · Paris VI</dd>
            </div>
            <div>
              <dt className="eyebrow text-muted-foreground">Hours</dt>
              <dd className="mt-1">Tue – Sat · 11h – 19h, by appointment</dd>
            </div>
          </dl>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          <Field label="Name" name="name" required />
          <Field label="Email" name="email" type="email" required />
          <label className="block">
            <span className="eyebrow text-muted-foreground">Message</span>
            <textarea
              name="message"
              rows={6}
              required
              className="mt-1 w-full border border-border bg-background px-3 py-2 text-sm outline-none transition focus:border-foreground"
            />
          </label>
          <button className="rounded-full bg-foreground px-8 py-3 text-sm text-background transition hover:bg-primary">
            Send letter
          </button>
        </form>
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
