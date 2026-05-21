import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { useOrders } from "@/lib/orders-store";

export const Route = createFileRoute("/order/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `Order ${params.id} — Magnetic Cosmetics` },
      { name: "description", content: "Order confirmation." },
    ],
  }),
  notFoundComponent: () => (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="mx-auto max-w-2xl px-6 py-32 text-center">
        <h1 className="font-display text-4xl">We can't find that order.</h1>
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
        <h1 className="font-display text-4xl">Something went wrong.</h1>
        <p className="mt-4 text-muted-foreground">{error.message}</p>
      </div>
    </div>
  ),
  component: OrderPage,
});

function OrderPage() {
  const { id } = Route.useParams();
  const order = useOrders((s) => s.orders.find((o) => o.id === id));

  if (!order) {
    // Use notFound boundary
    throw notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <header className="mx-auto max-w-3xl px-6 pb-12 pt-20 text-center">
        <span className="eyebrow text-primary">Thank you</span>
        <h1 className="mt-6 font-display text-5xl md:text-6xl italic">
          Your order is on its way to us.
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-muted-foreground">
          A confirmation has been sent to{" "}
          <span className="text-foreground">{order.email}</span>. Your order
          number is{" "}
          <span className="font-display text-foreground">{order.id}</span>.
        </p>
      </header>

      <section className="mx-auto grid max-w-5xl gap-10 px-6 pb-24 md:grid-cols-[1fr_18rem]">
        <div>
          <span className="eyebrow text-primary">Items</span>
          <ul className="mt-5 divide-y divide-border/60 border-y border-border/60">
            {order.items.map((it) => (
              <li key={`${it.slug}-${it.size}`} className="flex gap-4 py-5">
                <div className="h-20 w-16 shrink-0 overflow-hidden bg-gradient-to-br from-blush via-rose/40 to-lavender/30">
                  <img
                    src={it.image}
                    alt={it.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex flex-1 items-start justify-between">
                  <div>
                    <div className="font-display text-lg">{it.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {it.size} ml · qty {it.qty}
                    </div>
                  </div>
                  <div>${it.price * it.qty}</div>
                </div>
              </li>
            ))}
          </ul>

          <dl className="mt-6 space-y-2 text-sm">
            <Row label="Subtotal" value={`$${order.subtotal}`} />
            <Row
              label="Shipping"
              value={order.shipping === 0 ? "Complimentary" : `$${order.shipping}`}
            />
            <div className="border-t border-border/60 pt-2">
              <Row
                label={<span className="font-display text-lg">Total</span>}
                value={
                  <span className="font-display text-lg">${order.total}</span>
                }
              />
            </div>
          </dl>
        </div>

        <aside className="space-y-6">
          <div>
            <span className="eyebrow text-primary">Shipping to</span>
            <address className="mt-3 not-italic text-sm leading-relaxed">
              {order.address.fullName}
              <br />
              {order.address.address1}
              {order.address.address2 && (
                <>
                  <br />
                  {order.address.address2}
                </>
              )}
              <br />
              {order.address.city}, {order.address.region}{" "}
              {order.address.postalCode}
              <br />
              {order.address.country}
            </address>
          </div>
          <div>
            <span className="eyebrow text-primary">Status</span>
            <p className="mt-2 capitalize">{order.status}</p>
          </div>
          <Link
            to="/shop"
            className="block rounded-full border border-foreground px-6 py-3 text-center text-sm transition hover:bg-foreground hover:text-background"
          >
            Continue shopping
          </Link>
        </aside>
      </section>

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
