"use client";

import * as React from "react";
import { Switch as SwitchPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

/**
 * For settings that apply immediately. If the change only takes effect after
 * "Save", use a Checkbox instead — a switch promises an instant effect.
 */
function Switch({ className, ...props }: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer relative inline-flex h-6 w-10 shrink-0 items-center rounded-full border border-transparent bg-input",
        "after:absolute after:-inset-2",
        "transition-[background-color] duration-(--duration-base) ease-out",
        "hover:bg-muted-foreground",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        "disabled:pointer-events-none disabled:opacity-50",
        "data-[state=checked]:bg-primary data-[state=checked]:hover:bg-primary/90",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block size-5 rounded-full bg-background shadow-sm",
          "transition-transform duration-(--duration-base) ease-out",
          "data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0",
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
