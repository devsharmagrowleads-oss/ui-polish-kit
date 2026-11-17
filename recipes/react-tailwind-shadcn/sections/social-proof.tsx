import * as React from "react";

import { cn } from "@/lib/utils";

type Logo = { name: string; src: string; width: number; height: number };

type LogoWallProps = React.ComponentProps<"section"> & {
  /** e.g. "Trusted by 4,200 studios". Only real customers, with permission (LP-03, AS-04). */
  label: string;
  /** Monochrome SVG logos at optically equal sizes. Use versions that read on both themes (AS-04), or swap the set in dark mode. */
  logos: Logo[];
};

/** A row of customer logos in one treatment: monochrome, muted, equal visual weight (AS-04). */
function LogoWall({ label, logos, className, ...props }: LogoWallProps) {
  return (
    <section aria-label={label} className={cn("mx-auto max-w-6xl px-(--space-gutter) py-12", className)} {...props}>
      <p className="text-sm text-muted-foreground">{label}</p>
      <ul className="mt-6 grid grid-cols-2 items-center gap-x-8 gap-y-6 sm:grid-cols-3 lg:grid-cols-6">
        {logos.map((logo) => (
          <li key={logo.name} className="flex items-center">
            <img src={logo.src} alt={logo.name} width={logo.width} height={logo.height} loading="lazy" className="h-7 w-auto opacity-70 grayscale" />
          </li>
        ))}
      </ul>
    </section>
  );
}

type TestimonialProps = React.ComponentProps<"figure"> & {
  /** A specific result in the customer's words: "Our average payment time went from 34 days to 19." */
  quote: string;
  /** Full name, role and company. Never "Sarah K." (LP-03, CP-02). */
  author: { name: string; role: string; company: string; avatar?: { src: string; width: number; height: number } };
};

/** One attributed testimonial. Place it next to the claim it supports. */
function Testimonial({ quote, author, className, ...props }: TestimonialProps) {
  return (
    <figure className={cn("flex flex-col gap-6 rounded-xl border bg-card p-6 text-card-foreground sm:p-8", className)} {...props}>
      <blockquote className="font-display text-xl leading-snug text-pretty">
        <p>{quote}</p>
      </blockquote>
      <figcaption className="flex items-center gap-3 text-sm">
        {author.avatar ? (
          <img src={author.avatar.src} alt="" width={author.avatar.width} height={author.avatar.height} className="size-10 rounded-full bg-muted object-cover" />
        ) : null}
        <span>
          <span className="block font-medium text-foreground">{author.name}</span>
          <span className="block text-muted-foreground">
            {author.role}, {author.company}
          </span>
        </span>
      </figcaption>
    </figure>
  );
}

type StatProps = React.ComponentProps<"div"> & {
  /** The number, formatted: "11 days". */
  value: string;
  /** What it measures: "faster payment on average". */
  label: string;
  /** Where it comes from and when: "Ledgerly customer data, 2025" (LP-03). */
  source: string;
};

/** A proof number: the value is the loud part, the label quiet (VH-04), the source always visible. */
function Stat({ value, label, source, className, ...props }: StatProps) {
  return (
    <div className={cn("flex flex-col gap-1", className)} {...props}>
      <span className="font-display text-4xl font-semibold tracking-tight tabular-nums">{value}</span>
      <span className="text-sm text-foreground">{label}</span>
      <span className="text-xs text-muted-foreground">{source}</span>
    </div>
  );
}

export { LogoWall, Testimonial, Stat };
export type { LogoWallProps, TestimonialProps, StatProps };
