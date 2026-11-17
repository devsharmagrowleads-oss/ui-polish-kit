import * as React from "react";

import { cn } from "@/lib/utils";

type HeroProps = Omit<React.ComponentProps<"section">, "title"> & {
  /** What the product does, in plain words, under about ten words (LP-01, SL-07). Not a slogan. */
  title: string;
  /** Who it is for and the main outcome, one sentence (LP-01). */
  description: string;
  /** The one primary call to action, e.g. <Button asChild size="lg"><a href="/signup">Start free trial</a></Button>. */
  primaryAction: React.ReactNode;
  /** At most one quieter alternative, e.g. a "See a 2-minute demo" link. */
  secondaryAction?: React.ReactNode;
  /** The promise next to the button, e.g. "14-day free trial. No card needed." */
  reassurance?: string;
  /** A real product screenshot (LP-04). Give it width, height and alt text; it is the likely LCP image. */
  image: { src: string; alt: string; width: number; height: number };
  /** Optional short proof under the actions, e.g. "Used by 4,200 studios". Must be true and sourced (LP-03). */
  proof?: React.ReactNode;
};

/**
 * Marketing hero: headline, one supporting sentence, one primary action, and
 * the actual product, all visible without scrolling at 375px and 1440px.
 * Text is left-aligned and the screenshot carries the visual weight, so it
 * reads in a Z-pattern (VH-05) without centring everything (SL-10).
 */
function Hero({ title, description, primaryAction, secondaryAction, reassurance, image, proof, className, ...props }: HeroProps) {
  return (
    <section
      data-slot="hero"
      className={cn("mx-auto grid max-w-6xl gap-12 px-(--space-gutter) pt-16 pb-(--space-section) lg:grid-cols-12 lg:items-center lg:pt-24", className)}
      {...props}
    >
      <div className="flex flex-col gap-6 lg:col-span-5">
        <h1 className="font-display text-4xl leading-tight font-semibold tracking-tight text-balance text-foreground sm:text-5xl">{title}</h1>
        <p className="max-w-prose text-lg text-pretty text-muted-foreground">{description}</p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {primaryAction}
          {secondaryAction}
        </div>
        {reassurance ? <p className="text-sm text-muted-foreground">{reassurance}</p> : null}
        {proof ? <div className="border-t pt-6 text-sm text-muted-foreground">{proof}</div> : null}
      </div>
      <div className="lg:col-span-7">
        <img
          src={image.src}
          alt={image.alt}
          width={image.width}
          height={image.height}
          fetchPriority="high"
          decoding="async"
          className="block h-auto w-full rounded-xl border bg-muted shadow-lg"
        />
      </div>
    </section>
  );
}

export { Hero };
export type { HeroProps };
