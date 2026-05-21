import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy — Magnetic Cosmetics" },
      { name: "description", content: "How Magnetic Cosmetics handles your personal information." },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <section className="mx-auto max-w-3xl px-6 pb-32 pt-20">
        <span className="eyebrow text-primary">Legal</span>
        <h1 className="mt-6 font-display text-5xl italic md:text-6xl">Privacy.</h1>
        <p className="mt-6 text-sm text-muted-foreground">Last updated May 2026.</p>

        <div className="mt-12 space-y-8 text-muted-foreground leading-relaxed">
          <p>
            We collect only what we need to compose, send, and remember your
            order: your name, email, shipping address, and the items you've
            chosen. We don't sell your information, and we never share it
            beyond the partners required to deliver your parcel.
          </p>
          <section>
            <h2 className="font-display text-2xl text-foreground">What we store</h2>
            <p className="mt-3">
              Account details, order history, and any messages you write to the
              atelier. You can request a copy or deletion at any time by writing
              to hello@magnetic.co.
            </p>
          </section>
          <section>
            <h2 className="font-display text-2xl text-foreground">Cookies</h2>
            <p className="mt-3">
              We use a small set of cookies to keep your cart, remember you when
              you sign in, and understand which pages are read. No advertising
              trackers, ever.
            </p>
          </section>
          <section>
            <h2 className="font-display text-2xl text-foreground">Your rights</h2>
            <p className="mt-3">
              You may access, correct, export, or erase your data at any time.
              For requests, write to hello@magnetic.co and we'll reply within
              30 days.
            </p>
          </section>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
