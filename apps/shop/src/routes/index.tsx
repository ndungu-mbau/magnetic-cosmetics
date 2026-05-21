import { createFileRoute, Link } from "@tanstack/react-router";
import heroImg from "@/assets/hero.jpg";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Magnetic Cosmetics — Romantic Fragrance, Hand-Blended" },
      {
        name: "description",
        content:
          "Discover Magnetic Cosmetics: small-batch perfumes and colognes composed for the senses.",
      },
      { property: "og:title", content: "Magnetic Cosmetics" },
      { property: "og:description", content: "Romantic fragrance, hand-blended in small batches." },
    ],
  }),
  component: Home,
});

const featured = [
  { name: "Velours Rose", notes: "Damask rose · iris · musk", price: "$148" },
  { name: "Lune Lavande", notes: "Lavender · vanilla · amber", price: "$162" },
  { name: "Soir de Mai", notes: "Peony · pear · white tea", price: "$138" },
];

function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 pb-24 pt-16 md:grid-cols-2 md:items-center md:pt-24">
          <div>
            <span className="eyebrow text-primary">Maison Magnetic — 2026 collection</span>
            <h1 className="mt-6 font-display text-5xl leading-[1.05] tracking-tight md:text-7xl">
              A fragrance is a <em className="italic text-primary">love letter</em> the skin remembers.
            </h1>
            <p className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground">
              Composed in our atelier from rare florals and slow-aged resins.
              Each bottle is a small, romantic act.
            </p>
            <div className="mt-10 flex items-center gap-6">
              <Link
                to="/shop"
                className="rounded-full bg-foreground px-8 py-3 text-sm tracking-wide text-background transition hover:bg-primary"
              >
                Discover the collection
              </Link>
              <Link to="/about" className="text-sm underline-offset-4 hover:underline">
                Our atelier →
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-6 -z-10 rounded-full bg-gradient-to-br from-rose/60 via-lavender/40 to-transparent blur-3xl" />
            <img
              src={heroImg}
              alt="A lavender-tinted Magnetic Cosmetics fragrance bottle surrounded by dried roses"
              width={1600}
              height={1200}
              className="rounded-sm object-cover shadow-2xl"
            />
          </div>
        </div>
      </section>

      {/* Featured */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="flex items-end justify-between">
          <div>
            <span className="eyebrow text-muted-foreground">The collection</span>
            <h2 className="mt-3 font-display text-4xl md:text-5xl">Currently in bloom</h2>
          </div>
          <Link to="/shop" className="hidden text-sm underline-offset-4 hover:underline md:inline">
            View all →
          </Link>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {featured.map((f, i) => (
            <article
              key={f.name}
              className="group cursor-pointer"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="aspect-[4/5] overflow-hidden rounded-sm bg-gradient-to-br from-blush via-rose/60 to-lavender/40">
                <div className="flex h-full items-center justify-center">
                  <div className="h-3/5 w-1/3 rounded-sm bg-gradient-to-b from-white/80 to-lavender/40 shadow-xl transition group-hover:scale-105" />
                </div>
              </div>
              <div className="mt-5 flex items-baseline justify-between">
                <h3 className="font-display text-2xl">{f.name}</h3>
                <span className="text-sm text-muted-foreground">{f.price}</span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{f.notes}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Story strip */}
      <section className="bg-secondary/50">
        <div className="mx-auto grid max-w-5xl gap-10 px-6 py-24 text-center">
          <span className="eyebrow text-primary">The house</span>
          <h2 className="font-display text-4xl italic leading-tight md:text-5xl">
            "We compose perfumes the way poets write —
            <br /> slowly, and only when something insists on being said."
          </h2>
          <Link
            to="/about"
            className="mx-auto inline-block text-sm underline-offset-4 hover:underline"
          >
            Read our story →
          </Link>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
