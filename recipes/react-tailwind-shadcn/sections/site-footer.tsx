import * as React from "react";

import { cn } from "@/lib/utils";

type FooterLink = { label: string; href: string };
type FooterColumn = { title: string; links: FooterLink[] };

type SiteFooterProps = React.ComponentProps<"footer"> & {
  /** The real logo, e.g. <img src="/logo-on-light.svg" alt="Ledgerly" width={120} height={28} /> (AS-04). */
  brand: React.ReactNode;
  /** One sentence on what the company does. */
  tagline?: string;
  /** Three or four columns of five links at most (UX-02). */
  columns: FooterColumn[];
  /** Privacy, terms and contact are required on every marketing page (LP-07). Add cookies or an imprint if the law needs them. */
  legal: { privacy: string; terms: string; contact: string; extra?: FooterLink[] };
  /** The registered company name for the copyright line. */
  company: string;
};

/**
 * Site footer: brand, grouped link columns and the legal links that every
 * marketing page needs (LP-07). Each column is its own labelled list.
 */
function SiteFooter({ brand, tagline, columns, legal, company, className, ...props }: SiteFooterProps) {
  const legalLinks: FooterLink[] = [
    { label: "Privacy", href: legal.privacy },
    { label: "Terms", href: legal.terms },
    { label: "Contact", href: legal.contact },
    ...(legal.extra ?? []),
  ];
  const linkClass = "rounded-sm text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";
  return (
    <footer className={cn("border-t bg-background", className)} {...props}>
      <div className="mx-auto grid max-w-6xl gap-12 px-(--space-gutter) py-16 lg:grid-cols-12">
        <div className="flex flex-col gap-4 lg:col-span-4">
          {brand}
          {tagline ? <p className="max-w-xs text-sm text-muted-foreground">{tagline}</p> : null}
        </div>
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-8">
          {columns.map((column) => (
            <div key={column.title}>
              <h2 className="text-sm font-medium text-foreground">{column.title}</h2>
              <ul className="mt-4 flex flex-col gap-3 text-sm">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <a href={link.href} className={linkClass}>
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-(--space-gutter) py-6 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p className="text-muted-foreground">
            © {new Date().getFullYear()} {company}
          </p>
          <nav aria-label="Legal">
            <ul className="flex flex-wrap gap-x-6 gap-y-2">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className={linkClass}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  );
}

export { SiteFooter };
export type { SiteFooterProps, FooterColumn, FooterLink };
