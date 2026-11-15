"use client";

import * as React from "react";
import { CalendarIcon } from "lucide-react";
import type { DateRange, Matcher } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Calendar } from "./calendar";
import { controlClasses } from "./input";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

/*
 * Replaces <input type="date">. The trigger looks like every other field; the
 * popup is our Calendar, not the browser's. Dates are formatted with Intl in
 * the user's locale — never hand-built "MM/DD/YYYY" strings.
 */

type TriggerAria = {
  id?: string;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
  "aria-required"?: boolean;
};

type SharedProps = TriggerAria & {
  /** Shown while empty, e.g. "Pick a start date". */
  placeholder: string;
  /** Days that cannot be chosen, e.g. `{ before: new Date() }`. */
  disabledDays?: Matcher | Matcher[];
  disabled?: boolean;
  locale?: string;
  className?: string;
};

const formatDate = (date: Date, locale?: string) =>
  new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(date);

function PickerTrigger({
  label,
  empty,
  className,
  ...props
}: React.ComponentProps<"button"> & { label: string; empty: boolean }) {
  return (
    <button
      type="button"
      data-slot="date-picker-trigger"
      className={cn(
        controlClasses,
        "flex items-center gap-2 text-left data-[state=open]:border-ring",
        empty && "text-muted-foreground",
        className,
      )}
      {...props}
    >
      <CalendarIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      <span className="tabular truncate">{label}</span>
    </button>
  );
}

type DatePickerProps = SharedProps & {
  value?: Date;
  onValueChange?: (date: Date | undefined) => void;
};

function DatePicker({
  value,
  onValueChange,
  placeholder,
  disabledDays,
  disabled,
  locale,
  className,
  ...aria
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <PickerTrigger
          label={value ? formatDate(value, locale) : placeholder}
          empty={!value}
          disabled={disabled}
          className={className}
          {...aria}
        />
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={value}
          defaultMonth={value}
          disabled={disabledDays}
          autoFocus
          onSelect={(date) => {
            onValueChange?.(date);
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}

type DateRangePickerProps = SharedProps & {
  value?: DateRange;
  onValueChange?: (range: DateRange | undefined) => void;
};

function DateRangePicker({
  value,
  onValueChange,
  placeholder,
  disabledDays,
  disabled,
  locale,
  className,
  ...aria
}: DateRangePickerProps) {
  const label = value?.from
    ? value.to
      ? `${formatDate(value.from, locale)} – ${formatDate(value.to, locale)}`
      : formatDate(value.from, locale)
    : placeholder;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <PickerTrigger label={label} empty={!value?.from} disabled={disabled} className={className} {...aria} />
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        {/* Two months side by side from md up; DayPicker stacks them on small screens. */}
        <Calendar
          mode="range"
          selected={value}
          defaultMonth={value?.from}
          numberOfMonths={2}
          disabled={disabledDays}
          autoFocus
          onSelect={onValueChange}
        />
      </PopoverContent>
    </Popover>
  );
}

export { DatePicker, DateRangePicker };
export type { DatePickerProps, DateRangePickerProps };
