"use client";

import * as React from "react";
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { DayPicker, getDefaultClassNames, type DayButton } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "./button";

/*
 * Token-styled month grid (react-day-picker v9+). This is what replaces the
 * browser's own date popup: every colour, radius and focus ring comes from the
 * theme, so it matches the rest of the app in light and dark.
 * `--cell-size` is 40px so each day is a comfortable touch target.
 */
function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  components,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  const defaults = getDefaultClassNames();
  const navButton = cn(
    buttonVariants({ variant: "ghost", size: "icon" }),
    "size-(--cell-size) p-0 aria-disabled:opacity-50",
  );

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      captionLayout={captionLayout}
      className={cn("group/calendar w-fit bg-transparent p-3 [--cell-size:--spacing(10)]", className)}
      classNames={{
        root: cn("w-fit", defaults.root),
        months: cn("relative flex flex-col gap-4 md:flex-row", defaults.months),
        month: cn("flex w-full flex-col gap-4", defaults.month),
        nav: cn("absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1", defaults.nav),
        button_previous: cn(navButton, defaults.button_previous),
        button_next: cn(navButton, defaults.button_next),
        month_caption: cn(
          "flex h-(--cell-size) w-full items-center justify-center px-(--cell-size)",
          defaults.month_caption,
        ),
        dropdowns: cn(
          "flex h-(--cell-size) w-full items-center justify-center gap-2 text-sm font-medium",
          defaults.dropdowns,
        ),
        dropdown_root: cn(
          "relative rounded-md border border-input has-focus-visible:outline-2 has-focus-visible:outline-ring",
          defaults.dropdown_root,
        ),
        dropdown: cn("absolute inset-0 bg-popover opacity-0", defaults.dropdown),
        caption_label: cn(
          "text-sm font-medium select-none",
          captionLayout !== "label" &&
            "flex h-9 items-center gap-1 rounded-md pr-1 pl-2 [&>svg]:size-4 [&>svg]:text-muted-foreground",
          defaults.caption_label,
        ),
        month_grid: cn("w-full border-collapse", defaults.month_grid),
        weekdays: cn("flex", defaults.weekdays),
        weekday: cn("flex-1 text-xs font-normal text-muted-foreground select-none", defaults.weekday),
        week: cn("mt-1 flex w-full", defaults.week),
        day: cn(
          "group/day relative aspect-square h-full w-full p-0 text-center select-none",
          "[&:first-child[data-selected=true]_button]:rounded-l-md [&:last-child[data-selected=true]_button]:rounded-r-md",
          defaults.day,
        ),
        range_start: cn("rounded-l-md bg-accent", defaults.range_start),
        range_middle: cn("rounded-none", defaults.range_middle),
        range_end: cn("rounded-r-md bg-accent", defaults.range_end),
        today: cn("rounded-md font-semibold text-primary", defaults.today),
        outside: cn("text-muted-foreground aria-selected:text-muted-foreground", defaults.outside),
        disabled: cn("text-muted-foreground opacity-50", defaults.disabled),
        hidden: cn("invisible", defaults.hidden),
        ...classNames,
      }}
      components={{
        Chevron: ({ className: chevronClassName, orientation, ...chevronProps }) => {
          const Icon =
            orientation === "left" ? ChevronLeftIcon : orientation === "right" ? ChevronRightIcon : ChevronDownIcon;
          return <Icon className={cn("size-4", chevronClassName)} {...chevronProps} />;
        },
        DayButton: CalendarDayButton,
        ...components,
      }}
      {...props}
    />
  );
}

function CalendarDayButton({ className, day, modifiers, ...props }: React.ComponentProps<typeof DayButton>) {
  const ref = React.useRef<HTMLButtonElement>(null);

  // Arrow-key navigation is managed by DayPicker; it tells us which day should hold focus.
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus();
  }, [modifiers.focused]);

  return (
    <button
      ref={ref}
      type="button"
      data-day={day.date.toLocaleDateString()}
      data-selected-single={
        modifiers.selected && !modifiers.range_start && !modifiers.range_end && !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      className={cn(
        "tabular flex aspect-square w-full min-w-(--cell-size) items-center justify-center rounded-md text-sm font-normal",
        "transition-[color,background-color] duration-(--duration-fast) ease-out",
        "hover:bg-accent hover:text-accent-foreground active:bg-accent/80",
        "focus-visible:relative focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        "disabled:pointer-events-none disabled:opacity-50",
        "data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground",
        "data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground",
        "data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground",
        "data-[range-middle=true]:rounded-none data-[range-middle=true]:bg-accent data-[range-middle=true]:text-accent-foreground",
        className,
      )}
      {...props}
    />
  );
}

export { Calendar, CalendarDayButton };
