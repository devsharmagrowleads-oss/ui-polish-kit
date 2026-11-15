import * as React from "react";
import { ChevronDownIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { controlClasses } from "./input";

/**
 * The only acceptable way to ship a native <select>: `appearance-none` removes
 * the browser chrome, the trigger takes the same tokens as Input, and the
 * chevron is ours. The open list is still drawn by the OS (it follows
 * `color-scheme`), which is what you want on phones and in no-JS forms.
 * Everywhere else prefer `Select` from ./select, whose list is styled too.
 */
function NativeSelect({ className, children, ...props }: React.ComponentProps<"select">) {
  return (
    <div data-slot="native-select" className="relative w-full">
      <select
        className={cn(controlClasses, "cursor-pointer appearance-none pr-9 disabled:cursor-not-allowed", className)}
        {...props}
      >
        {children}
      </select>
      <ChevronDownIcon
        className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
    </div>
  );
}

export { NativeSelect };
