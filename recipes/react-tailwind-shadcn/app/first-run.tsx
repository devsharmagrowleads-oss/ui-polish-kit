import * as React from "react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type FirstRunPath = {
  icon: LucideIcon;
  /** A faster way in: "Import from CSV", "Start from a template", "Explore with sample data". */
  title: string;
  description: string;
} & (
  /** A place to go, e.g. "/import". */
  | { href: string; onSelect?: never }
  /** An action that stays on the page, e.g. loading sample data; also avoids a full reload in a single-page app. */
  | { onSelect: () => void; href?: never }
);

type FirstRunProps = Omit<React.ComponentProps<"section">, "title"> & {
  /** Greets by name when known, then names the first success: "Welcome, Dana. Send your first invoice." */
  title: string;
  /** Why this first step matters, one sentence. */
  description: string;
  /** The one action that reaches the activation moment (AC-02). */
  primaryAction: React.ReactNode;
  /** Two or three alternatives that get there faster (AC-01). */
  paths?: FirstRunPath[];
  /** Optional image or short loop of the result, e.g. a sent invoice. */
  media?: React.ReactNode;
};

/**
 * What a brand-new account sees instead of a dashboard of zeros (AC-01):
 * the first success as the primary action, faster paths (import, template,
 * sample data) as quieter cards, and nothing that needs data to make sense.
 * Render it while the account has no data; the normal home takes over after.
 */
const pathClass =
  "flex h-full gap-4 rounded-lg border bg-card p-5 text-card-foreground transition-[border-color,background-color] duration-(--duration-fast) ease-out hover:border-primary hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

function FirstRun({ title, description, primaryAction, paths = [], media, className, ...props }: FirstRunProps) {
  const headingId = React.useId();
  return (
    <section aria-labelledby={headingId} className={cn("flex flex-col gap-10", className)} {...props}>
      <div className="grid items-center gap-8 rounded-xl border bg-card p-8 text-card-foreground lg:grid-cols-2 lg:p-12">
        <div className="flex flex-col items-start gap-4">
          <h1 id={headingId} className="font-display text-3xl font-semibold tracking-tight text-balance">
            {title}
          </h1>
          <p className="max-w-prose text-pretty text-muted-foreground">{description}</p>
          <div className="pt-2">{primaryAction}</div>
        </div>
        {media ? <div className="hidden lg:block">{media}</div> : null}
      </div>
      {paths.length ? (
        <div className="flex flex-col gap-4">
          <h2 className="text-sm font-medium text-muted-foreground">Or start another way</h2>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {paths.map((path) => {
              const content = (
                <>
                  <path.icon className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
                  <span className="flex flex-col gap-1">
                    <span className="font-medium">{path.title}</span>
                    <span className="text-sm text-muted-foreground">{path.description}</span>
                  </span>
                </>
              );
              return (
                <li key={path.title}>
                  {path.onSelect ? (
                    <button type="button" onClick={path.onSelect} className={cn(pathClass, "w-full text-start")}>
                      {content}
                    </button>
                  ) : (
                    <a href={path.href} className={pathClass}>
                      {content}
                    </a>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </section>
  );
}

export { FirstRun };
export type { FirstRunProps, FirstRunPath };
