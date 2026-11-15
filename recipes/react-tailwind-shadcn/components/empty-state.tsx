import * as React from "react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type EmptyStateProps = Omit<React.ComponentProps<"div">, "title"> & {
  icon?: LucideIcon;
  /** What is missing, in the user's words, e.g. "No invoices yet". */
  title: string;
  /** Why it is empty and what happens next, e.g. "Invoices you send appear here with their payment status." */
  description: string;
  /** The one action that fills this view, e.g. <Button>Create invoice</Button>. */
  action?: React.ReactNode;
  /** A quieter alternative, e.g. <Button variant="ghost">Import from CSV</Button>. */
  secondaryAction?: React.ReactNode;
  /** Heading level that fits the page outline where this is placed. */
  headingLevel?: "h2" | "h3" | "h4";
};

/**
 * What a list, table or dashboard shows instead of a blank area. Write a
 * different one for "nothing created yet" (offer the create action) and for
 * "no results for this filter" (offer to clear the filter).
 */
function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  headingLevel: Heading = "h3",
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      data-slot="empty-state"
      className={cn(
        "flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed px-6 py-12 text-center",
        className,
      )}
      {...props}
    >
      {Icon ? (
        <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Icon className="size-6" aria-hidden="true" />
        </div>
      ) : null}
      <div className="grid max-w-prose gap-1">
        <Heading className="font-display text-base font-semibold text-foreground">{title}</Heading>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {action || secondaryAction ? (
        <div className="flex flex-col items-center gap-2 sm:flex-row">
          {action}
          {secondaryAction}
        </div>
      ) : null}
    </div>
  );
}

export { EmptyState };
export type { EmptyStateProps };
