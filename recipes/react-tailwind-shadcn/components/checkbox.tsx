"use client";

import * as React from "react";
import { CheckIcon, MinusIcon } from "lucide-react";
import { Checkbox as CheckboxPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

/** Pair with <Label htmlFor>. Supports `checked="indeterminate"` for "some selected" rows. */
function Checkbox({ className, ...props }: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer group relative size-5 shrink-0 rounded-sm border border-input bg-background shadow-xs",
        // The box is 20px; this pseudo-element extends the hit area to 40px.
        "after:absolute after:-inset-2.5",
        "transition-[color,background-color,border-color] duration-(--duration-fast) ease-out",
        "hover:border-foreground/40 active:scale-95",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        "disabled:pointer-events-none disabled:opacity-50",
        "aria-invalid:border-destructive",
        "data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
        "data-[state=indeterminate]:border-primary data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground",
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator data-slot="checkbox-indicator" className="flex items-center justify-center">
        <CheckIcon className="size-4 group-data-[state=indeterminate]:hidden" aria-hidden="true" />
        <MinusIcon className="hidden size-4 group-data-[state=indeterminate]:block" aria-hidden="true" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
