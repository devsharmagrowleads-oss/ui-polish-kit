import * as React from "react";
import { ArrowDownRightIcon, ArrowUpRightIcon, MinusIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type KpiCardProps = React.ComponentProps<"div"> & {
  /** What it measures, quiet: "Outstanding". */
  label: string;
  /** Formatted with Intl, with unit or currency: "$48,210" (TY-07, IN-04). Loud (VH-04). */
  value: string;
  /** Change against a named period. `direction` is the movement; `good` says whether that movement is good, so colour follows meaning (CO-03). */
  change?: { text: string; direction: "up" | "down" | "flat"; good: boolean; period: string };
  /** Optional link to the detail, e.g. <a href="/invoices?status=overdue">View overdue</a>. */
  footer?: React.ReactNode;
  /** While loading, keep the size and show a skeleton (ST-02). */
  loading?: boolean;
  /** Make one KPI the focal point of the dashboard (VH-01). */
  featured?: boolean;
};

/**
 * One key number. Value first in size and weight, label quiet, change with an
 * icon, a sign and words so it is not colour alone (AX-12), and the period it
 * compares against. Use real data or an empty state, never invented numbers
 * (SL-11).
 */
function KpiCard({ label, value, change, footer, loading = false, featured = false, className, ...props }: KpiCardProps) {
  const Icon = change?.direction === "up" ? ArrowUpRightIcon : change?.direction === "down" ? ArrowDownRightIcon : MinusIcon;
  return (
    <div className={cn("flex flex-col gap-2 rounded-lg border bg-card p-5 text-card-foreground", className)} aria-busy={loading || undefined} {...props}>
      <p className="text-sm text-muted-foreground">{label}</p>
      {loading ? (
        <div className={cn("animate-pulse rounded-md bg-muted motion-reduce:animate-none", featured ? "h-11 w-40" : "h-8 w-28")} />
      ) : (
        <p className={cn("font-display font-semibold tracking-tight tabular-nums", featured ? "text-4xl" : "text-3xl")}>{value}</p>
      )}
      {change && !loading ? (
        <p className="flex items-center gap-1.5 text-sm">
          <span className={cn("inline-flex items-center gap-1 font-medium", change.direction === "flat" ? "text-muted-foreground" : change.good ? "text-success" : "text-destructive")}>
            <Icon className="size-4" aria-hidden="true" />
            {change.text}
          </span>
          <span className="text-muted-foreground">{change.period}</span>
        </p>
      ) : null}
      {footer ? <div className="mt-auto border-t pt-3 text-sm">{footer}</div> : null}
    </div>
  );
}

type KpiGridProps = React.ComponentProps<"section"> & { label: string };

/** A row of three or four KPIs; more than four stops being a summary (UX-02). */
function KpiGrid({ label, className, ...props }: KpiGridProps) {
  return <section aria-label={label} className={cn("grid gap-4 sm:grid-cols-2 xl:grid-cols-4", className)} {...props} />;
}

export { KpiCard, KpiGrid };
export type { KpiCardProps, KpiGridProps };
