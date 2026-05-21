import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms — Magnetic Cosmetics" },
      { name: "description", content: "The terms that govern your use of Magnetic Cosmetics." },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <section className="mx-auto max-w-3xl px-6 pb-32 pt-20">
        <span className="eyebrow text-primary">Legal</span>
        <h1 className="mt-6 font-display text-5xl italic md:text-6xl">Terms.</h1>
        <p className="mt-6 text-sm text-muted-foreground">Last updated May 2026.</p>

        <div className="mt-12 space-y-8 text-muted-foreground leading-relaxed">
          <section>
            <h2 className="font-display text-2xl text-foreground">Using the site</h2>
            <p className="mt-3">
              By browsing magnetic.co you agree to use the site lawfully and
              not to disrupt it for other readers. Content, photography, and
              compositions are the property of Magnetic Cosmetics.
            </p>
          </section>
          <section>
            <h2 className="font-display text-2xl text-foreground">Orders</h2>
            <p className="mt-3">
              Prices are listed in USD and may change without notice. Placing an
              order is an offer to buy; we confirm acceptance when the parcel
              ships. We may decline orders that appear fraudulent.
            </p>
          </section>
          <section>
            <h2 className="font-display text-2xl text-foreground">Liability</h2>
            <p className="mt-3">
              Fragrance is personal and skin is particular. Please patch-test
              before wearing. We are not liable for indirect or consequential
              loss arising from use of our products.
            </p>
          </section>
          <section>
            <h2 className="font-display text-2xl text-foreground">Contact</h2>
            <p className="mt-3">
              Questions about these terms? Write to hello@magnetic.co.
            </p>
          </section>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
