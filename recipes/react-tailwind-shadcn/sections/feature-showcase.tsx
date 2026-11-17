import * as React from "react";

import { cn } from "@/lib/utils";

type Feature = {
  /** The outcome, not the feature name: "Reminders send themselves". */
  title: string;
  /** Two sentences at most: what happens and why it matters. */
  description: string;
  /** A real screenshot cropped to the part that proves the heading (LP-04). */
  image: { src: string; alt: string; width: number; height: number };
  /** Optional detail list, three items at most. */
  points?: string[];
  /** Optional link to more detail, e.g. <a href="/features/reminders">How reminders work</a>. */
  link?: React.ReactNode;
};

type FeatureShowcaseProps = Omit<React.ComponentProps<"section">, "title"> & {
  /** Section heading, e.g. "Get paid without chasing". */
  title: string;
  description?: string;
  features: Feature[];
};

/**
 * Features as alternating rows of text and product screenshot, instead of
 * three identical icon cards (SL-08). Each row makes one claim and shows the
 * product doing it. Images below the fold are lazy-loaded.
 */
function FeatureShowcase({ title, description, features, className, ...props }: FeatureShowcaseProps) {
  const headingId = React.useId();
  return (
    <section aria-labelledby={headingId} className={cn("mx-auto max-w-6xl px-(--space-gutter) py-(--space-section)", className)} {...props}>
      <header className="mb-16 max-w-2xl">
        <h2 id={headingId} className="font-display text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          {title}
        </h2>
        {description ? <p className="mt-4 text-lg text-pretty text-muted-foreground">{description}</p> : null}
      </header>
      <div className="flex flex-col gap-24">
        {features.map((feature, index) => (
          <article key={feature.title} className="grid items-center gap-8 lg:grid-cols-12 lg:gap-12">
            <div className={cn("flex flex-col gap-4 lg:col-span-5", index % 2 === 1 && "lg:order-2 lg:col-start-8")}>
              <h3 className="text-2xl font-semibold tracking-tight">{feature.title}</h3>
              <p className="text-pretty text-muted-foreground">{feature.description}</p>
              {feature.points?.length ? (
                <ul className="flex flex-col gap-2 text-sm">
                  {feature.points.map((point) => (
                    <li key={point} className="flex gap-3">
                      <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                      {point}
                    </li>
                  ))}
                </ul>
              ) : null}
              {feature.link ? <div className="text-sm font-medium">{feature.link}</div> : null}
            </div>
            <div className={cn("lg:col-span-7", index % 2 === 1 && "lg:order-1 lg:col-start-1")}>
              <img
                src={feature.image.src}
                alt={feature.image.alt}
                width={feature.image.width}
                height={feature.image.height}
                loading="lazy"
                decoding="async"
                className="block h-auto w-full rounded-xl border bg-muted shadow-md"
              />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export { FeatureShowcase };
export type { Feature, FeatureShowcaseProps };
