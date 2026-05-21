import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { useCart, cartSelectors } from "@/lib/cart-store";
import { useOrders, type ShippingAddress } from "@/lib/orders-store";
import { useAuth } from "@/lib/auth-store";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — Magnetic Cosmetics" },
      { name: "description", content: "Complete your order." },
    ],
  }),
  component: CheckoutPage,
});

const SHIPPING = 0;

function CheckoutPage() {
  const items = useCart((s) => s.items);
  const subtotal = useCart(cartSelectors.subtotal);
  const clear = useCart((s) => s.clear);
  const place = useOrders((s) => s.place);
  const user = useAuth((s) => s.user);
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="mx-auto max-w-md px-6 py-32 text-center">
          <h1 className="font-display text-3xl">Your cart is empty</h1>
          <Link
            to="/shop"
            className="mt-8 inline-block underline-offset-4 hover:underline"
          >
            Return to the collection →
          </Link>
        </div>
        <SiteFooter />
      </div>
    );
  }

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const address: ShippingAddress = {
      fullName: String(f.get("fullName") || ""),
      email: String(f.get("email") || ""),
      address1: String(f.get("address1") || ""),
      address2: String(f.get("address2") || ""),
      city: String(f.get("city") || ""),
      region: String(f.get("region") || ""),
      postalCode: String(f.get("postalCode") || ""),
      country: String(f.get("country") || ""),
    };

    setSubmitting(true);
    const order = place({
      email: address.email,
      items,
      subtotal,
      shipping: SHIPPING,
      total: subtotal + SHIPPING,
      address,
    });
    clear();
    toast.success("Order placed");
    navigate({ to: "/order/$id", params: { id: order.id } });
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <header className="mx-auto max-w-7xl px-6 pb-10 pt-16 text-center">
        <span className="eyebrow text-primary">One last step</span>
        <h1 className="mt-4 font-display text-5xl">Checkout</h1>
      </header>

      <section className="mx-auto grid max-w-6xl gap-12 px-6 pb-24 lg:grid-cols-[1fr_22rem]">
        <form onSubmit={onSubmit} className="space-y-10">
          <Fieldset legend="Contact">
            <Field
              label="Email"
              name="email"
              type="email"
              required
              defaultValue={user?.email}
            />
          </Fieldset>

          <Fieldset legend="Shipping">
            <Field
              label="Full name"
              name="fullName"
              required
              defaultValue={user?.name}
            />
            <Field label="Address" name="address1" required />
            <Field label="Apartment, suite (optional)" name="address2" />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="City" name="city" required />
              <Field label="State / region" name="region" required />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Postal code" name="postalCode" required />
              <Field label="Country" name="country" required defaultValue="United States" />
            </div>
          </Fieldset>

          <Fieldset legend="Payment">
            <p className="text-sm italic text-muted-foreground">
              Payment is not collected in this preview — clicking "Place order"
              will create a pending order you can review.
            </p>
          </Fieldset>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-full bg-foreground px-8 py-4 text-sm tracking-wide text-background transition hover:bg-primary disabled:opacity-60"
          >
            {submitting ? "Placing order…" : `Place order · $${subtotal + SHIPPING}`}
          </button>
        </form>

        <aside className="h-fit border border-border/60 bg-secondary/30 p-6">
          <span className="eyebrow text-primary">Your order</span>
          <ul className="mt-5 space-y-4">
            {items.map((it) => (
              <li
                key={`${it.slug}-${it.size}`}
                className="flex gap-3 text-sm"
              >
                <div className="h-14 w-12 shrink-0 overflow-hidden bg-gradient-to-br from-blush via-rose/40 to-lavender/30">
                  <img
                    src={it.image}
                    alt={it.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex flex-1 items-start justify-between gap-3">
                  <div>
                    <div className="font-display text-base leading-tight">
                      {it.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {it.size} ml · qty {it.qty}
                    </div>
                  </div>
                  <div>${it.price * it.qty}</div>
                </div>
              </li>
            ))}
          </ul>
          <dl className="mt-6 space-y-2 border-t border-border/60 pt-4 text-sm">
            <Row label="Subtotal" value={`$${subtotal}`} />
            <Row
              label="Shipping"
              value={SHIPPING === 0 ? "Complimentary" : `$${SHIPPING}`}
            />
            <div className="border-t border-border/60 pt-2">
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
        </aside>
      </section>

      <SiteFooter />
    </div>
  );
}

function Fieldset({
  legend,
  children,
}: {
  legend: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="space-y-4">
      <legend className="font-display text-2xl">{legend}</legend>
      {children}
    </fieldset>
  );
}

function Field({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="eyebrow text-muted-foreground">{label}</span>
      <input
        {...props}
        className="mt-1 w-full border border-border bg-background px-3 py-2 text-sm outline-none transition focus:border-foreground"
      />
    </label>
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
