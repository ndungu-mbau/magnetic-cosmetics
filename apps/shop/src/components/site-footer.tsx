import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="mt-32 border-t border-border/60 bg-secondary/40">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 md:grid-cols-4">
        <div>
          <div className="font-display text-2xl">Magnetic</div>
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            Romantic fragrance compositions, hand-blended in small batches.
          </p>
        </div>

        <div>
          <div className="eyebrow text-muted-foreground">Shop</div>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link to="/shop" className="hover:text-primary">All fragrances</Link></li>
            <li><Link to="/shop" className="hover:text-primary">For her</Link></li>
            <li><Link to="/shop" className="hover:text-primary">For him</Link></li>
            <li><Link to="/shop" className="hover:text-primary">Discovery sets</Link></li>
          </ul>
        </div>

        <div>
          <div className="eyebrow text-muted-foreground">House</div>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link to="/about" className="hover:text-primary">Our story</Link></li>
            <li><Link to="/journal" className="hover:text-primary">Journal</Link></li>
            <li><Link to="/contact" className="hover:text-primary">Contact</Link></li>
            <li><Link to="/faq" className="hover:text-primary">FAQ</Link></li>
            <li><Link to="/shipping-returns" className="hover:text-primary">Shipping &amp; returns</Link></li>
            <li><Link to="/privacy" className="hover:text-primary">Privacy</Link></li>
            <li><Link to="/terms" className="hover:text-primary">Terms</Link></li>
          </ul>
        </div>


        <div>
          <div className="eyebrow text-muted-foreground">Letters</div>
          <p className="mt-4 text-sm text-muted-foreground">
            New compositions, only in your inbox.
          </p>
          <form className="mt-4 flex border-b border-foreground/30">
            <input
              type="email"
              placeholder="your@email.com"
              className="w-full bg-transparent py-2 text-sm outline-none placeholder:text-muted-foreground"
            />
            <button className="eyebrow text-foreground/70 hover:text-primary">Join</button>
          </form>
        </div>
      </div>
      <div className="border-t border-border/60 py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Magnetic Cosmetics — Crafted with intention.
      </div>
    </footer>
  );
}
