import * as React from "react";

import { cn } from "@/lib/utils";

type CtaBandProps = Omit<React.ComponentProps<"section">, "title"> & {
  /** Restate the outcome: "Send your first invoice in a minute". */
  title: string;
  description?: string;
  /** The same action, label and destination as the hero (LP-02). */
  action: React.ReactNode;
  /** The promise next to the button: "No card needed." */
  reassurance?: string;
};

/**
 * The closing call to action, after the proof, pricing and FAQ: one goal,
 * asked for again at the point a convinced visitor decides (LP-02). A quiet
 * tinted surface, not a gradient (SL-01).
 */
function CtaBand({ title, description, action, reassurance, className, ...props }: CtaBandProps) {
  const headingId = React.useId();
  return (
    <section aria-labelledby={headingId} className={cn("mx-auto max-w-6xl px-(--space-gutter) py-(--space-section)", className)} {...props}>
      <div className="flex flex-col gap-6 rounded-xl border bg-muted p-8 sm:p-12 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl">
          <h2 id={headingId} className="font-display text-3xl font-semibold tracking-tight text-balance">
            {title}
          </h2>
          {description ? <p className="mt-3 text-pretty text-muted-foreground">{description}</p> : null}
        </div>
        <div className="flex shrink-0 flex-col gap-2">
          {action}
          {reassurance ? <p className="text-sm text-muted-foreground">{reassurance}</p> : null}
        </div>
      </div>
    </section>
  );
}

export { CtaBand };
export type { CtaBandProps };
