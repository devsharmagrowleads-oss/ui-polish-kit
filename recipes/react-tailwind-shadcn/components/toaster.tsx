"use client";

import * as React from "react";
import { CircleCheckIcon, InfoIcon, Loader2Icon, OctagonXIcon, TriangleAlertIcon } from "lucide-react";
import { Toaster as Sonner, toast, type ToasterProps } from "sonner";

/*
 * Replaces alert() for feedback. Mount <Toaster /> once in the root layout, then:
 *
 *   toast.success("Invoice INV-2041 sent to billing@northwind.com");
 *   toast.error("Couldn't save the draft", { description: "You're offline. We'll retry when you reconnect." });
 *   toast("Project archived", { action: { label: "Undo", onClick: restoreProject } });
 *
 * Toasts are for confirmations and recoverable errors. Validation errors
 * belong next to the field, and anything the user must decide belongs in a dialog.
 *
 * `theme` defaults to "system". If the app has its own theme switch (class or
 * data-theme on <html>), pass the active theme so toasts follow it.
 */
function Toaster({ theme = "system", position = "bottom-right", ...props }: ToasterProps) {
  return (
    <Sonner
      theme={theme}
      position={position}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" aria-hidden="true" />,
        info: <InfoIcon className="size-4" aria-hidden="true" />,
        warning: <TriangleAlertIcon className="size-4" aria-hidden="true" />,
        error: <OctagonXIcon className="size-4" aria-hidden="true" />,
        loading: <Loader2Icon className="size-4 animate-spin" aria-hidden="true" />,
      }}
      toastOptions={{
        classNames: {
          toast: "font-sans shadow-lg",
          description: "text-muted-foreground",
          actionButton: "bg-primary text-primary-foreground",
          cancelButton: "bg-muted text-muted-foreground",
        },
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
          zIndex: "var(--z-toast)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
}

export { Toaster, toast };
