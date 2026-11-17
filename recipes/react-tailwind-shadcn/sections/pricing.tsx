"use client";

import * as React from "react";
import { CheckIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type Plan = {
  /** Named for who it is for: "Solo", "Studio", "Agency". */
  name: string;
  /** One line: who should pick this plan. */
  audience: string;
  /** Formatted prices with currency (TY-07, IN-04). null = custom pricing. */
  price: { monthly: string; yearly: string } | null;
  /** Shown under the price, e.g. "per user / month". */
  period?: string;
  /** Three to five differences that matter, most important first. */
  features: string[];
  /** The plan's action, e.g. <Button asChild><a href="/signup?plan=studio">Start free trial</a></Button>. */
  action: React.ReactNode;
  /** Exactly one plan should be recommended (UX-05). */
  recommended?: boolean;
};

type PricingProps = Omit<React.ComponentProps<"section">, "title"> & {
  title: string;
  description?: string;
  /** Two to four plans (LP-05, UX-02). */
  plans: Plan[];
  /** e.g. "Save $72 a year" — say the saving in money, not only percent. */
  yearlySaving?: string;
  /** Trial and card terms, always visible: "14-day free trial. No card needed. Cancel any time." */
  terms: string;
  defaultBilling?: "monthly" | "yearly";
};

/**
 * Pricing table: two to four plans, one recommended (marked by a label and
 * position, not colour alone), an explicit monthly/yearly switch, prices with
 * currency and period, and the trial terms in plain view.
 */
function Pricing({ title, description, plans, yearlySaving, terms, defaultBilling = "yearly", className, ...props }: PricingProps) {
  const [billing, setBilling] = React.useState(defaultBilling);
  const headingId = React.useId();
  const hasPrices = plans.some((p) => p.price);

  return (
    <section aria-labelledby={headingId} className={cn("mx-auto max-w-6xl px-(--space-gutter) py-(--space-section)", className)} {...props}>
      <header className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <h2 id={headingId} className="font-display text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            {title}
          </h2>
          {description ? <p className="mt-4 text-lg text-pretty text-muted-foreground">{description}</p> : null}
        </div>
        {hasPrices ? (
          <div role="group" aria-label="Billing period" className="inline-flex shrink-0 self-start rounded-lg border bg-muted p-1 sm:self-auto">
            {(["monthly", "yearly"] as const).map((period) => (
              <button
                key={period}
                type="button"
                aria-pressed={billing === period}
                onClick={() => setBilling(period)}
                className={cn(
                  "h-9 rounded-md px-4 text-sm font-medium text-muted-foreground transition-[color,background-color,box-shadow] duration-(--duration-fast) ease-out",
                  "hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                  "aria-pressed:bg-background aria-pressed:text-foreground aria-pressed:shadow-xs",
                )}
              >
                {period === "monthly" ? "Monthly" : "Yearly"}
                {period === "yearly" && yearlySaving ? <span className="ms-2 text-xs text-success">{yearlySaving}</span> : null}
              </button>
            ))}
          </div>
        ) : null}
      </header>

      <ul className={cn("mt-12 grid gap-6", plans.length === 2 ? "md:grid-cols-2" : plans.length === 4 ? "md:grid-cols-2 lg:grid-cols-4" : "md:grid-cols-3")}>
        {plans.map((plan) => (
          <li
            key={plan.name}
            className={cn(
              "relative flex flex-col gap-6 rounded-xl border bg-card p-6 text-card-foreground",
              plan.recommended && "border-primary shadow-md ring-1 ring-primary",
            )}
          >
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg font-semibold">{plan.name}</h3>
                {plan.recommended ? (
                  <span className="rounded-full bg-primary px-2.5 py-0.5 text-xs font-medium text-primary-foreground">Most popular</span>
                ) : null}
              </div>
              <p className="text-sm text-muted-foreground">{plan.audience}</p>
            </div>
            <p className="flex flex-col">
              {plan.price ? (
                <>
                  <span className="font-display text-4xl font-semibold tracking-tight tabular-nums">{plan.price[billing]}</span>
                  <span className="text-sm text-muted-foreground">
                    {plan.period ?? "per month"}
                    {billing === "yearly" ? ", billed yearly" : ""}
                  </span>
                </>
              ) : (
                <>
                  <span className="font-display text-4xl font-semibold tracking-tight">Custom</span>
                  <span className="text-sm text-muted-foreground">For larger teams, priced with you</span>
                </>
              )}
            </p>
            <ul className="flex flex-col gap-3 text-sm">
              {plan.features.map((feature) => (
                <li key={feature} className="flex gap-3">
                  <CheckIcon className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                  {feature}
                </li>
              ))}
            </ul>
            <div className="mt-auto flex flex-col [&>*]:w-full">{plan.action}</div>
          </li>
        ))}
      </ul>
      <p className="mt-6 text-sm text-muted-foreground">{terms}</p>
    </section>
  );
}

export { Pricing };
export type { Plan, PricingProps };
