import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2Icon } from "lucide-react";
import { Slot } from "radix-ui";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    "inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap select-none",
    "transition-[color,background-color,border-color,box-shadow,transform] duration-(--duration-fast) ease-out",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
    "active:translate-y-px",
    "disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  ],
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 active:bg-primary/85",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/70 active:bg-secondary/60",
        outline:
          "border border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground active:bg-accent/80 aria-invalid:border-destructive",
        ghost: "text-foreground hover:bg-accent hover:text-accent-foreground active:bg-accent/80",
        destructive:
          "bg-destructive text-destructive-foreground shadow-xs hover:bg-destructive/90 active:bg-destructive/85 focus-visible:outline-destructive",
        link: "text-primary underline-offset-4 hover:underline active:translate-y-0",
      },
      size: {
        sm: "h-9 px-3",
        md: "h-10 px-4",
        lg: "h-11 px-6 text-base",
        icon: "size-10",
        "icon-sm": "size-9",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    /** Shows a spinner, blocks clicks and announces the busy state. The label stays visible so the button does not change width. */
    loading?: boolean;
  };

function Button({
  className,
  variant,
  size,
  asChild = false,
  loading = false,
  disabled,
  type,
  children,
  ...props
}: ButtonProps) {
  const classes = cn(buttonVariants({ variant, size }), loading && "cursor-progress", className);

  if (asChild) {
    return (
      <Slot.Root data-slot="button" className={classes} {...props}>
        {children}
      </Slot.Root>
    );
  }

  return (
    <button
      data-slot="button"
      // An implicit type="submit" inside a form is a classic accidental submit.
      type={type ?? "button"}
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? <Loader2Icon className="animate-spin" aria-hidden="true" /> : null}
      {children}
    </button>
  );
}

export { Button, buttonVariants };
export type { ButtonProps };
