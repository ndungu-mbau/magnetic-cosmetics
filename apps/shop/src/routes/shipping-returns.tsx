import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const Route = createFileRoute("/shipping-returns")({
  head: () => ({
    meta: [
      { title: "Shipping & Returns — Magnetic Cosmetics" },
      { name: "description", content: "How we ship, how long it takes, and our returns policy." },
      { property: "og:title", content: "Shipping & Returns — Magnetic Cosmetics" },
      { property: "og:description", content: "How we ship, how long it takes, and our returns policy." },
    ],
  }),
  component: ShippingPage,
});

function ShippingPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <section className="mx-auto max-w-3xl px-6 pb-32 pt-20">
        <span className="eyebrow text-primary">Care</span>
        <h1 className="mt-6 font-display text-5xl italic leading-tight md:text-6xl">
          Shipping &amp; returns.
        </h1>

        <div className="mt-16 space-y-12 text-muted-foreground leading-relaxed">
          <section>
            <h2 className="font-display text-2xl text-foreground">Shipping</h2>
            <p className="mt-3">
              Every order is hand-wrapped in the atelier and dispatched within
              48 hours. Domestic orders arrive in 3–5 business days; international
              orders typically arrive in 7–12. Orders over $120 ship complimentary —
              otherwise a flat $10 carriage applies.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-foreground">Returns</h2>
            <p className="mt-3">
              Sealed bottles can be returned within 30 days of receipt for a full
              refund. Opened bottles are non-returnable for hygiene reasons; if
              something arrives damaged or you simply don't connect with a scent,
              please write to us — we'll always make it right.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-foreground">Discovery sets</h2>
            <p className="mt-3">
              Trying our discovery set first? The price of the set is credited
              back when you order a full bottle within 60 days — just enter the
              code on your sample card at checkout.
            </p>
          </section>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
