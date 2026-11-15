import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Loading placeholder. Size it to the content it stands in for (same height,
 * roughly the same width) so nothing jumps when the data arrives:
 *
 *   <div role="status" aria-label="Loading invoices" className="grid gap-3">
 *     <Skeleton className="h-6 w-48" />
 *     <Skeleton className="h-4 w-full" />
 *     <Skeleton className="h-4 w-2/3" />
 *   </div>
 *
 * The blocks themselves are hidden from assistive tech; put one `role="status"`
 * with a label on the wrapper instead.
 */
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden="true"
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  );
}

export { Skeleton };
