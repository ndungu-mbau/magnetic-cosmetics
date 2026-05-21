import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const Route = createFileRoute("/journal")({
  head: () => ({
    meta: [
      { title: "Journal — Magnetic Cosmetics" },
      { name: "description", content: "Letters from the atelier — notes on scent, season, and slow craft." },
      { property: "og:title", content: "Journal — Magnetic Cosmetics" },
      { property: "og:description", content: "Letters from the atelier — notes on scent, season, and slow craft." },
    ],
  }),
  component: JournalPage,
});

const entries = [
  {
    date: "May, 2026",
    title: "On the romance of a single drop",
    excerpt: "Why we measure perfume in confessions, not millilitres.",
  },
  {
    date: "April, 2026",
    title: "The garden after rain",
    excerpt: "Three new florals composed in the week the petals fell.",
  },
  {
    date: "March, 2026",
    title: "A perfumer's pantry",
    excerpt: "Resins, tinctures, and the patience required to age them.",
  },
  {
    date: "February, 2026",
    title: "Letters to a stranger",
    excerpt: "Notes our customers wrote about what a fragrance reminded them of.",
  },
];

function JournalPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <section className="mx-auto max-w-4xl px-6 pb-32 pt-20">
        <span className="eyebrow text-primary">Journal</span>
        <h1 className="mt-6 font-display text-5xl italic leading-tight md:text-6xl">
          Letters from the atelier.
        </h1>
        <p className="mt-6 max-w-2xl text-muted-foreground leading-relaxed">
          Notes on scent, season, and the slow craft of composition.
        </p>

        <ul className="mt-16 divide-y divide-border/60 border-y border-border/60">
          {entries.map((e) => (
            <li key={e.title} className="grid gap-2 py-8 md:grid-cols-[10rem_1fr] md:gap-10">
              <div className="eyebrow text-muted-foreground">{e.date}</div>
              <div>
                <h2 className="font-display text-2xl">{e.title}</h2>
                <p className="mt-2 text-muted-foreground">{e.excerpt}</p>
                <Link to="/journal" className="mt-3 inline-block text-sm underline-offset-4 hover:underline">
                  Read more →
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </section>
      <SiteFooter />
    </div>
  );
}
