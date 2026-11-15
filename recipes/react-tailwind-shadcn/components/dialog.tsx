"use client";

import * as React from "react";
import { XIcon } from "lucide-react";
import { Dialog as DialogPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

/*
 * Modal dialog. Radix supplies the parts that hand-rolled modals miss: focus
 * trap, focus return to the trigger, Escape to close, scroll lock, and
 * `aria-modal` semantics. Always render a DialogTitle (visually hide it with
 * `sr-only` if the design has no heading) — it is the dialog's accessible name.
 */

function Dialog(props: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

function DialogTrigger(props: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

function DialogClose(props: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

function DialogOverlay({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn("fixed inset-0 z-(--z-overlay) bg-overlay data-[state=open]:animate-fade-in", className)}
      {...props}
    />
  );
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & { showCloseButton?: boolean }) {
  return (
    <DialogPrimitive.Portal>
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          // Leaves a 16px gutter on phones and scrolls inside when content is taller than the screen.
          "fixed top-1/2 left-1/2 z-(--z-modal) grid max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 overflow-y-auto rounded-lg border bg-popover p-6 text-popover-foreground shadow-lg",
          "data-[state=open]:animate-fade-in",
          className,
        )}
        {...props}
      >
        {children}
        {showCloseButton ? (
          <DialogPrimitive.Close
            data-slot="dialog-close"
            aria-label="Close dialog"
            className={cn(
              "absolute top-3 right-3 flex size-10 items-center justify-center rounded-md text-muted-foreground",
              "transition-[color,background-color] duration-(--duration-fast) ease-out",
              "hover:bg-accent hover:text-accent-foreground active:bg-accent/80",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
              "disabled:pointer-events-none disabled:opacity-50",
            )}
          >
            <XIcon className="size-4" aria-hidden="true" />
          </DialogPrimitive.Close>
        ) : null}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  // pr-10 keeps a long title clear of the close button.
  return <div data-slot="dialog-header" className={cn("grid gap-2 pr-10", className)} {...props} />;
}

/** Primary action on the right on desktop; stacked with the primary action on top on phones. */
function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)}
      {...props}
    />
  );
}

function DialogTitle({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn("font-display text-lg leading-tight font-semibold", className)}
      {...props}
    />
  );
}

function DialogDescription({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
  DialogTrigger,
};
