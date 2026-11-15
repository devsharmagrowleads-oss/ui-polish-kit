"use client";

import * as React from "react";
import { AlertDialog as AlertDialogPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";
import { buttonVariants } from "./button";

/*
 * Replaces window.confirm(), which blocks the page, cannot be styled, and
 * always says "OK / Cancel".
 *
 * Declarative:
 *   <ConfirmDialog
 *     open={open} onOpenChange={setOpen}
 *     title="Delete the Q3 forecast?"
 *     description="The forecast and its 14 comments are removed for everyone. This cannot be undone."
 *     confirmLabel="Delete forecast" destructive
 *     onConfirm={deleteForecast}
 *   />
 *
 * Imperative (drop-in for `if (confirm(...))`): wrap the app in <ConfirmProvider>, then
 *   const confirm = useConfirm();
 *   if (await confirm({ title: "Discard unsaved changes?", confirmLabel: "Discard changes" })) { … }
 */

type ConfirmOptions = {
  /** A specific question naming the object, e.g. "Delete the Q3 forecast?" — not "Are you sure?". */
  title: string;
  /** The consequence, in one or two sentences. */
  description?: string;
  /** The verb of the action, e.g. "Delete forecast" — never "OK" or "Yes". */
  confirmLabel: string;
  cancelLabel?: string;
  /** Styles the confirm button as destructive and focuses Cancel first. */
  destructive?: boolean;
};

type ConfirmDialogProps = ConfirmOptions & {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  onCancel?: () => void;
};

function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  cancelLabel = "Cancel",
  destructive = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <AlertDialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialogPrimitive.Portal>
        <AlertDialogPrimitive.Overlay
          data-slot="confirm-dialog-overlay"
          className="fixed inset-0 z-(--z-overlay) bg-overlay data-[state=open]:animate-fade-in"
        />
        <AlertDialogPrimitive.Content
          data-slot="confirm-dialog"
          className={cn(
            "fixed top-1/2 left-1/2 z-(--z-modal) grid w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 gap-4 rounded-lg border bg-popover p-6 text-popover-foreground shadow-lg",
            "data-[state=open]:animate-fade-in",
          )}
        >
          <div className="grid gap-2">
            <AlertDialogPrimitive.Title className="font-display text-lg leading-tight font-semibold">
              {title}
            </AlertDialogPrimitive.Title>
            {description ? (
              <AlertDialogPrimitive.Description className="text-sm text-muted-foreground">
                {description}
              </AlertDialogPrimitive.Description>
            ) : null}
          </div>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            {/* Radix focuses Cancel first, so Enter on a destructive prompt is the safe choice. */}
            <AlertDialogPrimitive.Cancel className={buttonVariants({ variant: "outline" })} onClick={onCancel}>
              {cancelLabel}
            </AlertDialogPrimitive.Cancel>
            <AlertDialogPrimitive.Action
              className={buttonVariants({ variant: destructive ? "destructive" : "primary" })}
              onClick={onConfirm}
            >
              {confirmLabel}
            </AlertDialogPrimitive.Action>
          </div>
        </AlertDialogPrimitive.Content>
      </AlertDialogPrimitive.Portal>
    </AlertDialogPrimitive.Root>
  );
}

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = React.createContext<ConfirmFn | null>(null);

function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [options, setOptions] = React.useState<ConfirmOptions | null>(null);
  const [open, setOpen] = React.useState(false);
  const resolver = React.useRef<((confirmed: boolean) => void) | null>(null);

  const settle = React.useCallback((confirmed: boolean) => {
    resolver.current?.(confirmed);
    resolver.current = null;
    setOpen(false);
  }, []);

  const confirm = React.useCallback<ConfirmFn>((next) => {
    // A second request while one is open cancels the first rather than stacking dialogs.
    resolver.current?.(false);
    setOptions(next);
    setOpen(true);
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {options ? (
        <ConfirmDialog
          {...options}
          open={open}
          onOpenChange={(next) => {
            // Escape closes the dialog without a button press; treat it as Cancel.
            if (!next) settle(false);
          }}
          onConfirm={() => settle(true)}
        />
      ) : null}
    </ConfirmContext.Provider>
  );
}

function useConfirm(): ConfirmFn {
  const confirm = React.useContext(ConfirmContext);
  if (!confirm) throw new Error("useConfirm must be used inside <ConfirmProvider>.");
  return confirm;
}

export { ConfirmDialog, ConfirmProvider, useConfirm };
export type { ConfirmDialogProps, ConfirmOptions };
