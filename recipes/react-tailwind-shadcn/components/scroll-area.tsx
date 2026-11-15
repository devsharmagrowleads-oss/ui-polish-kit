"use client";

import * as React from "react";
import { ScrollArea as ScrollAreaPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

/*
 * Overlay scrollbars for panels where the native bar would shift the layout
 * (sidebars, menus, code blocks). Scrolling itself stays native, so touch,
 * wheel and keyboard behave normally.
 *
 * The page-level scrollbar and any plain `overflow-auto` element are already
 * styled by tokens.css; reach for this component only when the bar must not
 * take up space.
 */
function ScrollArea({ className, children, ...props }: React.ComponentProps<typeof ScrollAreaPrimitive.Root>) {
  return (
    <ScrollAreaPrimitive.Root data-slot="scroll-area" className={cn("relative overflow-hidden", className)} {...props}>
      <ScrollAreaPrimitive.Viewport
        data-slot="scroll-area-viewport"
        // Focusable so keyboard users can scroll content that has no focusable children.
        tabIndex={0}
        className="size-full rounded-[inherit] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
      >
        {children}
      </ScrollAreaPrimitive.Viewport>
      <ScrollBar />
      <ScrollBar orientation="horizontal" />
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  );
}

function ScrollBar({
  className,
  orientation = "vertical",
  ...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>) {
  return (
    <ScrollAreaPrimitive.ScrollAreaScrollbar
      data-slot="scroll-area-scrollbar"
      orientation={orientation}
      className={cn(
        "flex touch-none p-0.5 select-none",
        "transition-[background-color] duration-(--duration-fast) ease-out hover:bg-muted",
        orientation === "vertical" && "h-full w-3",
        orientation === "horizontal" && "h-3 flex-col",
        className,
      )}
      {...props}
    >
      <ScrollAreaPrimitive.ScrollAreaThumb
        data-slot="scroll-area-thumb"
        className="relative flex-1 rounded-full bg-input hover:bg-muted-foreground"
      />
    </ScrollAreaPrimitive.ScrollAreaScrollbar>
  );
}

export { ScrollArea, ScrollBar };
