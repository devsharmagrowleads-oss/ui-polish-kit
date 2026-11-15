"use client";

import * as React from "react";
import { Tooltip as TooltipPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

/*
 * Replaces the `title` attribute, which is unstyled, slow to appear, invisible
 * to keyboard and touch users, and cannot be themed. Radix shows the tooltip on
 * hover AND on keyboard focus.
 *
 * A tooltip is a hint, not a label: an icon-only button still needs `aria-label`.
 * Never put essential or interactive content in one (touch users will not see it).
 *
 *   <Tooltip>
 *     <TooltipTrigger asChild>
 *       <Button variant="ghost" size="icon" aria-label="Archive invoice"><ArchiveIcon /></Button>
 *     </TooltipTrigger>
 *     <TooltipContent>Archive invoice</TooltipContent>
 *   </Tooltip>
 */

/** Mount once near the app root so tooltips share one delay and skip it when moving between triggers. */
function TooltipProvider({ delayDuration = 300, ...props }: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return <TooltipPrimitive.Provider data-slot="tooltip-provider" delayDuration={delayDuration} {...props} />;
}

function Tooltip(props: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  return <TooltipPrimitive.Root data-slot="tooltip" {...props} />;
}

function TooltipTrigger(props: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />;
}

function TooltipContent({
  className,
  sideOffset = 6,
  collisionPadding = 8,
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        collisionPadding={collisionPadding}
        className={cn(
          "z-(--z-tooltip) max-w-64 rounded-md bg-foreground px-3 py-1.5 text-xs text-balance text-background shadow-md",
          "origin-(--radix-tooltip-content-transform-origin) animate-fade-in",
          className,
        )}
        {...props}
      >
        {children}
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
}

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger };
