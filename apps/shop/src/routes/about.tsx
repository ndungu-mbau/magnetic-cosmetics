import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "Atelier — Magnetic Cosmetics" },
      { name: "description", content: "Inside the Magnetic Cosmetics atelier." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="mx-auto max-w-3xl px-6 py-32">
        <span className="eyebrow text-primary">The atelier</span>
        <h1 className="mt-6 font-display text-5xl italic leading-tight">
          Composed slowly, only when something insists on being said.
        </h1>
        <p className="mt-8 text-lg leading-relaxed text-muted-foreground">
          Magnetic Cosmetics began as a small studio of two perfumers obsessed
          with the romance of a single drop. We blend by hand, in small batches,
          using rare florals and slow-aged resins. Our story page is being written —
          come back soon.
        </p>
      </div>
      <SiteFooter />
    </div>
  );
}
