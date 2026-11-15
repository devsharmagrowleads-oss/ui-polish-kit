"use client";

import * as React from "react";
import { RadioGroup as RadioGroupPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

/** Give the group a name with `aria-label` or `aria-labelledby`; pair each item with a <Label htmlFor>. */
function RadioGroup({ className, ...props }: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return <RadioGroupPrimitive.Root data-slot="radio-group" className={cn("grid gap-3", className)} {...props} />;
}

function RadioGroupItem({ className, ...props }: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      className={cn(
        "peer relative flex size-5 shrink-0 items-center justify-center rounded-full border border-input bg-background shadow-xs",
        "after:absolute after:-inset-2.5",
        "transition-[border-color,background-color] duration-(--duration-fast) ease-out",
        "hover:border-foreground/40 active:scale-95",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        "disabled:pointer-events-none disabled:opacity-50",
        "aria-invalid:border-destructive",
        "data-[state=checked]:border-primary",
        className,
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator
        data-slot="radio-group-indicator"
        className="size-2.5 rounded-full bg-primary"
      />
    </RadioGroupPrimitive.Item>
  );
}

export { RadioGroup, RadioGroupItem };
