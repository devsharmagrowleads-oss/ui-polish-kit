import * as React from "react";

import { cn } from "@/lib/utils";

/** Shared look for every text-like control, so inputs, selects and pickers line up. */
const controlClasses = [
  "h-10 w-full min-w-0 rounded-md border border-input bg-background px-3 text-base text-foreground shadow-xs md:text-sm",
  "placeholder:text-muted-foreground",
  "transition-[border-color,box-shadow,background-color] duration-(--duration-fast) ease-out",
  "hover:border-foreground/40",
  "focus-visible:border-ring focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-ring",
  "disabled:pointer-events-none disabled:bg-muted disabled:opacity-50",
  "aria-invalid:border-destructive aria-invalid:focus-visible:outline-destructive",
].join(" ");

/**
 * `text-base` below the md breakpoint keeps the font at 16px on phones; iOS
 * Safari zooms the page when a focused field is smaller than that.
 */
function Input({ className, type = "text", ...props }: React.ComponentProps<"input">) {
  return (
    <input
      data-slot="input"
      type={type}
      className={cn(
        controlClasses,
        // Not in controlClasses: `:read-only` also matches buttons, which reuse those classes.
        "read-only:bg-muted",
        "file:mr-3 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
        className,
      )}
      {...props}
    />
  );
}

export { Input, controlClasses };
