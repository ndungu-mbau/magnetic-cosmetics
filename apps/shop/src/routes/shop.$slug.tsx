import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getFragrance, fragrances } from "@/lib/fragrances";
import { useCart } from "@/lib/cart-store";

export const Route = createFileRoute("/shop/$slug")({
  loader: ({ params }) => {
    const fragrance = getFragrance(params.slug);
    if (!fragrance) throw notFound();
    return { fragrance };
  },
  head: ({ loaderData }) => {
    const f = loaderData?.fragrance;
    if (!f) return { meta: [{ title: "Fragrance — Magnetic Cosmetics" }] };
    return {
      meta: [
        { title: `${f.name} — Magnetic Cosmetics` },
        { name: "description", content: f.tagline },
        { property: "og:title", content: `${f.name} — Magnetic Cosmetics` },
        { property: "og:description", content: f.tagline },
        { property: "og:image", content: f.image },
        { name: "twitter:image", content: f.image },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="mx-auto max-w-2xl px-6 py-32 text-center">
        <span className="eyebrow text-primary">Not in the atelier</span>
        <h1 className="mt-4 font-display text-5xl">We can't find that fragrance.</h1>
        <Link to="/shop" className="mt-8 inline-block underline-offset-4 hover:underline">
          ← Back to the collection
        </Link>
      </div>
      <SiteFooter />
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="mx-auto max-w-2xl px-6 py-32 text-center">
        <h1 className="font-display text-4xl">Something didn't pour right.</h1>
        <p className="mt-4 text-muted-foreground">{error.message}</p>
      </div>
    </div>
  ),
  component: ProductPage,
});

function ProductPage() {
  const { fragrance: f } = Route.useLoaderData();
  const [size, setSize] = useState<number>(f.sizes[Math.floor(f.sizes.length / 2)]);
  const add = useCart((s) => s.add);
  const price = priceFor(f.priceUsd, size, f.sizes);

  const onAdd = () => {
    add({ slug: f.slug, name: f.name, image: f.image, size, price });
    toast.success(`${f.name} · ${size} ml added to cart`);
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <div className="mx-auto max-w-7xl px-6 pb-8 pt-6">
        <Link to="/shop" className="eyebrow text-muted-foreground hover:text-foreground">
          ← Collection
        </Link>
      </div>

      {/* Hero */}
      <section className="mx-auto grid max-w-7xl gap-12 px-6 pb-24 md:grid-cols-2 md:items-start">
        <div className="relative">
          <div className="absolute -inset-8 -z-10 rounded-full bg-gradient-to-br from-rose/50 via-lavender/30 to-transparent blur-3xl" />
          <div className="overflow-hidden rounded-sm bg-gradient-to-br from-blush via-rose/40 to-lavender/30">
            <img
              src={f.image}
              alt={f.name}
              width={1024}
              height={1280}
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        <div className="md:sticky md:top-24">
          <span className="eyebrow text-primary">
            {f.family} · {f.gender}
          </span>
          <h1 className="mt-4 font-display text-5xl md:text-6xl">{f.name}</h1>
          <p className="mt-4 text-lg italic text-muted-foreground">{f.tagline}</p>

          <p className="mt-8 leading-relaxed text-foreground/80">{f.description}</p>

          <div className="mt-10">
            <div className="eyebrow text-muted-foreground">Size</div>
            <div className="mt-3 flex gap-2">
              {f.sizes.map((s: number) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={
                    "rounded-sm border px-5 py-3 text-sm transition " +
                    (size === s
                      ? "border-foreground bg-foreground text-background"
                      : "border-border text-foreground/70 hover:border-foreground")
                  }
                >
                  {s} ml
                </button>
              ))}
            </div>
          </div>

          <div className="mt-10 flex items-end justify-between border-t border-border/60 pt-8">
            <div>
              <div className="eyebrow text-muted-foreground">Price</div>
              <div className="mt-1 font-display text-3xl">${price}</div>
            </div>
            <button
              onClick={onAdd}
              className="rounded-full bg-foreground px-10 py-4 text-sm tracking-wide text-background transition hover:bg-primary"
            >
              Add to cart
            </button>
          </div>

          <p className="mt-6 text-xs text-muted-foreground">
            Hand-blended in small batches · Ships in 3–5 days · Complimentary samples
          </p>
        </div>
      </section>

      {/* Notes pyramid */}
      <section className="bg-secondary/40">
        <div className="mx-auto max-w-5xl px-6 py-24 text-center">
          <span className="eyebrow text-primary">The composition</span>
          <h2 className="mt-4 font-display text-4xl italic md:text-5xl">
            A pyramid of three confessions
          </h2>

          <div className="mt-16 grid gap-12 md:grid-cols-3">
            <NoteCard label="Top" subtitle="First minutes" notes={f.topNotes} />
            <NoteCard label="Heart" subtitle="The composition opens" notes={f.heartNotes} />
            <NoteCard label="Base" subtitle="What lingers on skin" notes={f.baseNotes} />
          </div>
        </div>
      </section>

      {/* Other fragrances */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="flex items-end justify-between">
          <h2 className="font-display text-3xl md:text-4xl">You may also love</h2>
          <Link to="/shop" className="hidden text-sm underline-offset-4 hover:underline md:inline">
            View all →
          </Link>
        </div>
        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {fragrances
            .filter((o) => o.slug !== f.slug)
            .slice(0, 3)
            .map((o) => (
              <Link
                key={o.slug}
                to="/shop/$slug"
                params={{ slug: o.slug }}
                className="group"
              >
                <div className="aspect-[4/5] overflow-hidden rounded-sm bg-gradient-to-br from-blush via-rose/40 to-lavender/30">
                  <img
                    src={o.image}
                    alt={o.name}
                    loading="lazy"
                    width={1024}
                    height={1280}
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="mt-4 flex items-baseline justify-between">
                  <h3 className="font-display text-xl">{o.name}</h3>
                  <span className="text-sm text-muted-foreground">${o.priceUsd}</span>
                </div>
                <p className="mt-1 text-sm italic text-muted-foreground">{o.tagline}</p>
              </Link>
            ))}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

function NoteCard({
  label,
  subtitle,
  notes,
}: {
  label: string;
  subtitle: string;
  notes: string[];
}) {
  return (
    <div>
      <div className="eyebrow text-primary">{label}</div>
      <div className="mt-2 text-xs italic text-muted-foreground">{subtitle}</div>
      <ul className="mt-5 space-y-2 font-display text-2xl">
        {notes.map((n) => (
          <li key={n}>{n}</li>
        ))}
      </ul>
    </div>
  );
}

function priceFor(base: number, size: number, sizes: number[]) {
  const smallest = sizes[0];
  // simple linear scaling around base price for the middle size
  const mid = sizes[Math.floor(sizes.length / 2)];
  const factor = size / mid;
  const v = base * factor;
  // tidy to nearest $2
  return Math.max(Math.round(v / 2) * 2, Math.round((base * smallest) / mid));
}
