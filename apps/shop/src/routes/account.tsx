import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { useAuth } from "@/lib/auth-store";
import { useOrders } from "@/lib/orders-store";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [{ title: "Your account — Magnetic Cosmetics" }],
  }),
  component: AccountPage,
});

function AccountPage() {
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);
  const orders = useOrders((s) => s.orders);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) navigate({ to: "/login" });
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <header className="mx-auto max-w-7xl px-6 pb-12 pt-20">
        <span className="eyebrow text-primary">Atelier</span>
        <div className="mt-4 flex items-end justify-between gap-6">
          <h1 className="font-display text-5xl italic md:text-6xl">
            Hello, {user.name}.
          </h1>
          <button
            onClick={() => {
              logout();
              navigate({ to: "/" });
            }}
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Sign out
          </button>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">{user.email}</p>
      </header>

      <section className="mx-auto max-w-7xl px-6 pb-24">
        <span className="eyebrow text-primary">Orders</span>
        {orders.length === 0 ? (
          <div className="mt-6 border border-border/60 bg-secondary/30 p-10 text-center">
            <p className="italic text-muted-foreground">
              No orders yet — the first chapter is unwritten.
            </p>
            <Link
              to="/shop"
              className="mt-6 inline-block rounded-full bg-foreground px-6 py-3 text-sm text-background transition hover:bg-primary"
            >
              Discover the collection
            </Link>
          </div>
        ) : (
          <ul className="mt-6 divide-y divide-border/60 border-y border-border/60">
            {orders.map((o) => (
              <li
                key={o.id}
                className="flex flex-wrap items-center justify-between gap-4 py-5"
              >
                <div>
                  <div className="font-display text-xl">{o.id}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(o.createdAt).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}{" "}
                    · {o.items.length} item{o.items.length === 1 ? "" : "s"} ·{" "}
                    <span className="capitalize">{o.status}</span>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="font-display text-lg">${o.total}</div>
                  <Link
                    to="/order/$id"
                    params={{ id: o.id }}
                    className="text-sm underline-offset-4 hover:underline"
                  >
                    View →
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <SiteFooter />
    </div>
  );
}
