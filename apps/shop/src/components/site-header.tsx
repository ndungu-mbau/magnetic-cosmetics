import { Link } from "@tanstack/react-router";
import { ShoppingBag, User, Search } from "lucide-react";
import { useCart, cartSelectors } from "@/lib/cart-store";
import { useAuth } from "@/lib/auth-store";

const nav = [
  { to: "/shop", label: "Shop" },
  { to: "/about", label: "Atelier" },
] as const;

export function SiteHeader() {
  const count = useCart(cartSelectors.count);
  const user = useAuth((s) => s.user);

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <div className="flex-1">
          <button aria-label="Search" className="text-foreground/70 transition hover:text-foreground">
            <Search className="h-4 w-4" />
          </button>
        </div>

        <Link to="/" className="flex flex-col items-center leading-none">
          <span className="font-display text-2xl tracking-tight">Magnetic</span>
          <span className="eyebrow mt-0.5 text-muted-foreground">Cosmetics</span>
        </Link>

        <nav className="flex flex-1 items-center justify-end gap-6 text-sm">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="hidden text-foreground/70 transition hover:text-foreground md:inline"
              activeProps={{ className: "text-foreground" }}
            >
              {n.label}
            </Link>
          ))}
          <Link
            to={user ? "/account" : "/login"}
            aria-label="Account"
            className="text-foreground/70 transition hover:text-foreground"
          >
            <User className="h-4 w-4" />
          </Link>
          <Link
            to="/cart"
            aria-label="Cart"
            className="relative text-foreground/70 transition hover:text-foreground"
          >
            <ShoppingBag className="h-4 w-4" />
            {count > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                {count}
              </span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
}
