import * as React from "react";
import { ChevronDownIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type FaqItem = {
  /** A real question a hesitant visitor asks: "Can I export my invoices if I leave?" */
  question: string;
  /** Two or three sentences; link out for detail. */
  answer: React.ReactNode;
};

type FaqProps = Omit<React.ComponentProps<"section">, "title"> & {
  title?: string;
  /** Five to eight questions that stop people signing up (LP-06). */
  items: FaqItem[];
  /** Where to ask anything else, e.g. <a href="mailto:help@ledgerly.example">Email us</a>, replies within a day. */
  contact?: React.ReactNode;
  /** Only one answer open at a time. Off by default: exclusive accordions stop people comparing answers and shift content. */
  exclusive?: boolean;
};

/**
 * FAQ built on <details>/<summary>: keyboard and screen-reader support,
 * find-in-page and no JavaScript. Pass `exclusive` to allow one open answer at a time (via `name`). The open
 * animation uses ::details-content with interpolate-size where supported;
 * elsewhere answers open instantly (progressive enhancement), and it is off
 * under reduced motion.
 */
function Faq({ title = "Questions before you start", items, contact, exclusive = false, className, ...props }: FaqProps) {
  const headingId = React.useId();
  const group = React.useId();
  return (
    <section aria-labelledby={headingId} className={cn("mx-auto grid max-w-6xl gap-12 px-(--space-gutter) py-(--space-section) lg:grid-cols-12", className)} {...props}>
      <header className="flex flex-col gap-4 lg:col-span-4">
        <h2 id={headingId} className="font-display text-3xl font-semibold tracking-tight text-balance">
          {title}
        </h2>
        {contact ? <p className="text-muted-foreground">{contact}</p> : null}
      </header>
      <div className="divide-y border-y lg:col-span-8">
        {items.map((item) => (
          <details
            key={item.question}
            name={exclusive ? group : undefined}
            className={cn(
              "group [interpolate-size:allow-keywords]",
              "details-content:h-0 details-content:overflow-clip details-content:transition-[height,content-visibility] details-content:transition-discrete details-content:duration-(--duration-base) details-content:ease-out",
              "open:details-content:h-auto motion-reduce:details-content:transition-none",
            )}
          >
            <summary
              className={cn(
                "flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-start font-medium",
                "hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring [&::-webkit-details-marker]:hidden",
              )}
            >
              {item.question}
              <ChevronDownIcon
                className="size-5 shrink-0 text-muted-foreground transition-transform duration-(--duration-base) ease-out group-open:rotate-180 motion-reduce:transition-none"
                aria-hidden="true"
              />
            </summary>
            <div className="max-w-prose pb-5 text-pretty text-muted-foreground">{item.answer}</div>
          </details>
        ))}
      </div>
    </section>
  );
}

export { Faq };
export type { FaqItem, FaqProps };
