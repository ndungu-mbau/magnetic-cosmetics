import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, X } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { useCart, cartSelectors } from "@/lib/cart-store";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your cart — Magnetic Cosmetics" },
      { name: "description", content: "Review your selected fragrances." },
    ],
  }),
  component: CartPage,
});

const SHIPPING = 0; // complimentary in v1

function CartPage() {
  const items = useCart((s) => s.items);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  const subtotal = useCart(cartSelectors.subtotal);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <header className="mx-auto max-w-7xl px-6 pb-12 pt-20 text-center">
        <span className="eyebrow text-primary">Your selection</span>
        <h1 className="mt-6 font-display text-5xl md:text-6xl">The cart</h1>
      </header>

      {items.length === 0 ? (
        <div className="mx-auto max-w-md px-6 pb-32 text-center">
          <p className="italic text-muted-foreground">
            Nothing in the bottle just yet.
          </p>
          <Link
            to="/shop"
            className="mt-8 inline-block rounded-full bg-foreground px-8 py-3 text-sm text-background transition hover:bg-primary"
          >
            Wander the collection
          </Link>
        </div>
      ) : (
        <section className="mx-auto grid max-w-6xl gap-12 px-6 pb-24 lg:grid-cols-[1fr_22rem]">
          <ul className="divide-y divide-border/60 border-y border-border/60">
            {items.map((it) => (
              <li
                key={`${it.slug}-${it.size}`}
                className="flex gap-5 py-6"
              >
                <Link
                  to="/shop/$slug"
                  params={{ slug: it.slug }}
                  className="block h-28 w-24 shrink-0 overflow-hidden bg-gradient-to-br from-blush via-rose/40 to-lavender/30"
                >
                  <img
                    src={it.image}
                    alt={it.name}
                    className="h-full w-full object-cover"
                  />
                </Link>
                <div className="flex flex-1 flex-col">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <Link
                        to="/shop/$slug"
                        params={{ slug: it.slug }}
                        className="font-display text-xl hover:underline underline-offset-4"
                      >
                        {it.name}
                      </Link>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {it.size} ml · ${it.price} each
                      </p>
                    </div>
                    <button
                      aria-label="Remove"
                      onClick={() => remove(it.slug, it.size)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-auto flex items-end justify-between pt-4">
                    <div className="inline-flex items-center border border-border">
                      <button
                        aria-label="Decrease"
                        onClick={() => setQty(it.slug, it.size, it.qty - 1)}
                        className="px-3 py-2 text-muted-foreground hover:text-foreground"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-8 text-center text-sm">{it.qty}</span>
                      <button
                        aria-label="Increase"
                        onClick={() => setQty(it.slug, it.size, it.qty + 1)}
                        className="px-3 py-2 text-muted-foreground hover:text-foreground"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    <div className="font-display text-lg">
                      ${it.price * it.qty}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <aside className="h-fit border border-border/60 bg-secondary/30 p-6">
            <span className="eyebrow text-primary">Summary</span>
            <dl className="mt-5 space-y-3 text-sm">
              <Row label="Subtotal" value={`$${subtotal}`} />
              <Row
                label="Shipping"
                value={SHIPPING === 0 ? "Complimentary" : `$${SHIPPING}`}
              />
              <div className="border-t border-border/60 pt-3">
                <Row
                  label={<span className="font-display text-lg">Total</span>}
                  value={
                    <span className="font-display text-lg">
                      ${subtotal + SHIPPING}
                    </span>
                  }
                />
              </div>
            </dl>
            <Link
              to="/checkout"
              className="mt-6 block rounded-full bg-foreground px-8 py-3 text-center text-sm text-background transition hover:bg-primary"
            >
              Proceed to checkout
            </Link>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Complimentary samples included with every order.
            </p>
          </aside>
        </section>
      )}

      <SiteFooter />
    </div>
  );
}

function Row({
  label,
  value,
}: {
  label: React.ReactNode;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
