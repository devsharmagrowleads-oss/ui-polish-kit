"use client";

import * as React from "react";
import { CheckIcon, ChevronRightIcon, XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ChecklistItem = {
  id: string;
  /** The task and its benefit: "Connect your bank so payments mark invoices paid". */
  title: string;
  /** Where to do it. */
  href: string;
  /** Detected from real data on the server, not ticked by hand (AC-03). */
  done: boolean;
};

type SetupChecklistProps = Omit<React.ComponentProps<"section">, "title"> & {
  /** The outcome of finishing setup: "Get paid faster". */
  title: string;
  /** Three to six items, most valuable first. */
  items: ChecklistItem[];
  /** Persist the dismissal per user on the server; it must stay dismissed (AC-03). */
  onDismiss: () => void;
};

/**
 * Deferred setup as a short checklist on the home screen (AC-03, UX-09):
 * progress counted in completed items, each item linking straight to the
 * place to do it, ticked automatically when done, dismissible for good.
 * When every item is done, show a short "Setup complete" state and let the
 * user dismiss it rather than removing it without a word (UX-12).
 */
function SetupChecklist({ title, items, onDismiss, className, ...props }: SetupChecklistProps) {
  const headingId = React.useId();
  const done = items.filter((item) => item.done).length;
  const complete = done === items.length;
  return (
    <section aria-labelledby={headingId} className={cn("rounded-lg border bg-card text-card-foreground", className)} {...props}>
      <header className="flex items-start justify-between gap-4 p-5 pb-4">
        <div className="flex flex-col gap-2">
          <h2 id={headingId} className="text-base font-semibold">
            {complete ? "Setup complete" : title}
          </h2>
          <div className="flex items-center gap-3">
            <progress
              value={done}
              max={items.length}
              aria-labelledby={`${headingId}-count`}
              className="h-1.5 w-32 overflow-hidden rounded-full bg-muted [&::-moz-progress-bar]:bg-primary [&::-webkit-progress-bar]:bg-muted [&::-webkit-progress-value]:bg-primary"
            />
            <span id={`${headingId}-count`} className="text-sm text-muted-foreground tabular-nums">
              {done} of {items.length} done
            </span>
          </div>
        </div>
        <Button variant="ghost" size="icon-sm" onClick={onDismiss} aria-label="Hide setup checklist">
          <XIcon aria-hidden="true" />
        </Button>
      </header>
      <ol className="border-t">
        {items.map((item) => (
          <li key={item.id} className="border-b last:border-b-0">
            <a
              href={item.href}
              className="group flex items-center gap-3 px-5 py-3 text-sm hover:bg-accent focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
            >
              <span
                className={cn(
                  "flex size-5 shrink-0 items-center justify-center rounded-full border",
                  item.done ? "border-primary bg-primary text-primary-foreground" : "border-input",
                )}
              >
                {item.done ? <CheckIcon className="size-3" aria-hidden="true" /> : null}
              </span>
              <span className={cn("flex-1", item.done && "text-muted-foreground line-through")}>
                {item.title}
                <span className="sr-only">{item.done ? " (done)" : " (to do)"}</span>
              </span>
              <ChevronRightIcon className="size-4 text-muted-foreground transition-transform duration-(--duration-fast) group-hover:translate-x-0.5 motion-reduce:transition-none" aria-hidden="true" />
            </a>
          </li>
        ))}
      </ol>
    </section>
  );
}

export { SetupChecklist };
export type { SetupChecklistProps, ChecklistItem };
