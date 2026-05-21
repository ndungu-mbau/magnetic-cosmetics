import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { fragrances, type Family, type Gender } from "@/lib/fragrances";

export const Route = createFileRoute("/shop/")({
  head: () => ({
    meta: [
      { title: "Shop — Magnetic Cosmetics" },
      {
        name: "description",
        content:
          "Browse the Magnetic Cosmetics fragrance collection — hand-blended perfumes and colognes in small batches.",
      },
      { property: "og:title", content: "The Collection — Magnetic Cosmetics" },
      {
        property: "og:description",
        content: "Hand-blended perfumes and colognes, composed slowly.",
      },
    ],
  }),
  component: ShopPage,
});

const families: Family[] = ["Floral", "Oriental", "Fresh", "Woody"];
const genders: Gender[] = ["Feminine", "Masculine", "Unisex"];

const PRICE_MIN = Math.min(...fragrances.map((f) => f.priceUsd));
const PRICE_MAX = Math.max(...fragrances.map((f) => f.priceUsd));
const SIZES_ALL = Array.from(
  new Set(fragrances.flatMap((f) => f.sizes)),
).sort((a, b) => a - b);

type Filters = {
  families: Set<Family>;
  genders: Set<Gender>;
  sizes: Set<number>;
  price: [number, number];
};

function defaultFilters(): Filters {
  return {
    families: new Set(),
    genders: new Set(),
    sizes: new Set(),
    price: [PRICE_MIN, PRICE_MAX],
  };
}

function ShopPage() {
  const [filters, setFilters] = useState<Filters>(defaultFilters);

  const items = useMemo(
    () =>
      fragrances.filter((f) => {
        if (filters.families.size && !filters.families.has(f.family)) return false;
        if (filters.genders.size && !filters.genders.has(f.gender)) return false;
        if (filters.sizes.size && !f.sizes.some((s) => filters.sizes.has(s)))
          return false;
        if (f.priceUsd < filters.price[0] || f.priceUsd > filters.price[1])
          return false;
        return true;
      }),
    [filters],
  );

  const activeCount =
    filters.families.size +
    filters.genders.size +
    filters.sizes.size +
    (filters.price[0] !== PRICE_MIN || filters.price[1] !== PRICE_MAX ? 1 : 0);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <header className="mx-auto max-w-7xl px-6 pb-12 pt-20 text-center">
        <span className="eyebrow text-primary">The collection</span>
        <h1 className="mt-6 font-display text-5xl md:text-7xl">
          Every bottle, <em className="italic">a small confession</em>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-muted-foreground">
          Eight compositions, blended by hand. Choose by mood, by note, or by the
          person you'd like to become this evening.
        </p>
      </header>

      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="flex items-center justify-between border-y border-border/60 py-5">
          <p className="text-sm text-muted-foreground">
            {items.length} {items.length === 1 ? "fragrance" : "fragrances"}
            {activeCount > 0 && (
              <>
                {" "}· {activeCount} filter{activeCount === 1 ? "" : "s"} active
              </>
            )}
          </p>
          {/* Mobile filter trigger */}
          <Sheet>
            <SheetTrigger className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm lg:hidden">
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {activeCount > 0 && (
                <span className="rounded-full bg-foreground px-2 text-xs text-background">
                  {activeCount}
                </span>
              )}
            </SheetTrigger>
            <SheetContent side="right" className="w-[20rem] overflow-y-auto">
              <FilterPanel filters={filters} setFilters={setFilters} />
            </SheetContent>
          </Sheet>
        </div>

        <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_18rem]">
          {/* Products */}
          <div>
            {items.length === 0 ? (
              <p className="py-24 text-center text-muted-foreground">
                Nothing in bloom under those filters just yet.
              </p>
            ) : (
              <div className="grid gap-x-8 gap-y-16 sm:grid-cols-2">
                {items.map((f) => (
                  <Link
                    key={f.slug}
                    to="/shop/$slug"
                    params={{ slug: f.slug }}
                    className="group block"
                  >
                    <div className="aspect-[4/5] overflow-hidden rounded-sm bg-gradient-to-br from-blush via-rose/40 to-lavender/30">
                      <img
                        src={f.image}
                        alt={f.name}
                        loading="lazy"
                        width={1024}
                        height={1280}
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                      />
                    </div>
                    <div className="mt-5 flex items-baseline justify-between">
                      <h3 className="font-display text-2xl">{f.name}</h3>
                      <span className="text-sm text-muted-foreground">
                        ${f.priceUsd}
                      </span>
                    </div>
                    <p className="mt-1 text-sm italic text-muted-foreground">
                      {f.tagline}
                    </p>
                    <p className="eyebrow mt-3 text-muted-foreground/80">
                      {f.family} · {f.gender}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Desktop sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <FilterPanel filters={filters} setFilters={setFilters} />
            </div>
          </aside>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

function FilterPanel({
  filters,
  setFilters,
}: {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
}) {
  const toggle = <T,>(set: Set<T>, value: T) => {
    const next = new Set(set);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    return next;
  };

  const reset = () => setFilters(defaultFilters());
  const hasAny =
    filters.families.size ||
    filters.genders.size ||
    filters.sizes.size ||
    filters.price[0] !== PRICE_MIN ||
    filters.price[1] !== PRICE_MAX;

  return (
    <div className="space-y-8 border border-border/60 bg-secondary/30 p-6">
      <div className="flex items-center justify-between">
        <span className="eyebrow text-primary">Refine</span>
        {hasAny && (
          <button
            onClick={reset}
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <X className="h-3 w-3" /> Clear
          </button>
        )}
      </div>

      <FilterSection label="Family">
        <div className="space-y-2">
          {families.map((f) => (
            <CheckRow
              key={f}
              label={f}
              checked={filters.families.has(f)}
              onChange={() =>
                setFilters((s) => ({ ...s, families: toggle(s.families, f) }))
              }
            />
          ))}
        </div>
      </FilterSection>

      <FilterSection label="For">
        <div className="space-y-2">
          {genders.map((g) => (
            <CheckRow
              key={g}
              label={g}
              checked={filters.genders.has(g)}
              onChange={() =>
                setFilters((s) => ({ ...s, genders: toggle(s.genders, g) }))
              }
            />
          ))}
        </div>
      </FilterSection>

      <FilterSection label="Size">
        <div className="flex flex-wrap gap-2">
          {SIZES_ALL.map((s) => {
            const active = filters.sizes.has(s);
            return (
              <button
                key={s}
                onClick={() =>
                  setFilters((st) => ({ ...st, sizes: toggle(st.sizes, s) }))
                }
                className={
                  "rounded-full border px-3 py-1 text-xs transition " +
                  (active
                    ? "border-foreground bg-foreground text-background"
                    : "border-border text-muted-foreground hover:border-foreground hover:text-foreground")
                }
              >
                {s} ml
              </button>
            );
          })}
        </div>
      </FilterSection>

      <FilterSection label="Price">
        <div className="flex items-end gap-3">
          <PriceInput
            label="Min"
            value={filters.price[0]}
            onChange={(v) =>
              setFilters((s) => ({
                ...s,
                price: [Math.min(v, s.price[1]), s.price[1]],
              }))
            }
          />
          <span className="pb-2 text-muted-foreground">—</span>
          <PriceInput
            label="Max"
            value={filters.price[1]}
            onChange={(v) =>
              setFilters((s) => ({
                ...s,
                price: [s.price[0], Math.max(v, s.price[0])],
              }))
            }
          />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Collection from ${PRICE_MIN} to ${PRICE_MAX}
        </p>
      </FilterSection>
    </div>
  );
}

function FilterSection({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="font-display text-lg">{label}</div>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function CheckRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 text-sm text-foreground/80 hover:text-foreground">
      <span
        className={
          "flex h-4 w-4 items-center justify-center border transition " +
          (checked
            ? "border-foreground bg-foreground"
            : "border-border bg-background")
        }
      >
        {checked && (
          <span className="block h-1.5 w-1.5 bg-background" />
        )}
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="sr-only"
      />
      {label}
    </label>
  );
}

function PriceInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="flex-1">
      <span className="eyebrow text-muted-foreground">{label}</span>
      <div className="mt-1 flex items-center border border-border bg-background focus-within:border-foreground">
        <span className="pl-2 text-sm text-muted-foreground">$</span>
        <input
          type="number"
          inputMode="numeric"
          min={0}
          value={value}
          onChange={(e) => {
            const n = Number(e.target.value);
            if (Number.isFinite(n)) onChange(Math.max(0, n));
          }}
          className="w-full bg-transparent px-2 py-2 text-sm outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
      </div>
    </label>
  );
}
