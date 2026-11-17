import * as React from "react";

import { cn } from "@/lib/utils";

type Crumb = { label: string; href: string };

type PageHeaderProps = Omit<React.ComponentProps<"header">, "title"> & {
  /** The page's one <h1>: a noun for the place, "Invoices" (TY-04). */
  title: string;
  /** One line on what this page is for, in secondary text (VH-03). */
  description?: string;
  /** Ancestors only; the current page is the title (NV-04). */
  breadcrumbs?: Crumb[];
  /** One primary action and at most two quieter ones (UX-05). The primary goes last, so it sits at the right edge. */
  actions?: React.ReactNode;
  /** Tabs, filters or a meta row under the title, e.g. "42 invoices · updated 2 min ago". */
  children?: React.ReactNode;
};

/**
 * The one page-header pattern for every screen in an app (NV-03): optional
 * breadcrumbs, title, a line of description, and the page actions in the same
 * place every time. The title is the focal point of the page (VH-01).
 */
function PageHeader({ title, description, breadcrumbs, actions, children, className, ...props }: PageHeaderProps) {
  return (
    <header className={cn("mb-8 flex flex-col gap-4", className)} {...props}>
      {breadcrumbs?.length ? (
        <nav aria-label="Breadcrumbs">
          <ol className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            {breadcrumbs.map((crumb) => (
              <li key={crumb.href} className="flex items-center gap-2 after:text-border after:content-['/'] last:after:content-none">
                <a href={crumb.href} className="rounded-sm hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
                  {crumb.label}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      ) : null}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="font-display text-3xl font-semibold tracking-tight text-balance">{title}</h1>
          {description ? <p className="mt-1 max-w-prose text-muted-foreground">{description}</p> : null}
        </div>
        {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
      {children}
    </header>
  );
}

export { PageHeader };
export type { PageHeaderProps, Crumb };
