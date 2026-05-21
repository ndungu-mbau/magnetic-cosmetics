import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — Magnetic Cosmetics" },
      { name: "description", content: "Answers to questions about our fragrances, samples, shipping and returns." },
      { property: "og:title", content: "FAQ — Magnetic Cosmetics" },
      { property: "og:description", content: "Answers to questions about our fragrances, samples, shipping and returns." },
    ],
  }),
  component: FaqPage,
});

const faqs = [
  {
    q: "Are samples available?",
    a: "Yes — a complimentary 1.5 ml sample is included with every order, and a discovery set of all four signatures is available on the shop page.",
  },
  {
    q: "How long does a bottle last?",
    a: "A 50 ml flacon lasts roughly four months at two sprays a day. Our parfum concentrations are dense — a little carries far.",
  },
  {
    q: "Are your fragrances vegan and cruelty-free?",
    a: "Always. We have never tested on animals and avoid all animal-derived materials.",
  },
  {
    q: "Where do you ship?",
    a: "We ship worldwide. Orders over $120 ship complimentary; otherwise a flat $10 carriage applies.",
  },
  {
    q: "Can I return an opened bottle?",
    a: "Sealed bottles can be returned within 30 days. Opened bottles are non-returnable for hygiene reasons, but reach out — we want you to love what you wear.",
  },
];

function FaqPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <section className="mx-auto max-w-3xl px-6 pb-32 pt-20">
        <span className="eyebrow text-primary">FAQ</span>
        <h1 className="mt-6 font-display text-5xl italic leading-tight md:text-6xl">
          Things we are often asked.
        </h1>

        <dl className="mt-16 divide-y divide-border/60 border-y border-border/60">
          {faqs.map((f) => (
            <div key={f.q} className="py-8">
              <dt className="font-display text-2xl">{f.q}</dt>
              <dd className="mt-3 text-muted-foreground leading-relaxed">{f.a}</dd>
            </div>
          ))}
        </dl>
      </section>
      <SiteFooter />
    </div>
  );
}
