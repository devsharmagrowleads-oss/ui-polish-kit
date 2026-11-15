"use client";

import * as React from "react";
import { ClockIcon } from "lucide-react";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";

type TimePickerProps = {
  /** 24-hour "HH:mm", e.g. "14:30". Display follows the user's locale (12h or 24h). */
  value?: string;
  onValueChange?: (value: string) => void;
  /** Shown while empty, e.g. "Select a start time". */
  placeholder: string;
  /** Minutes between options. */
  step?: 5 | 10 | 15 | 30 | 60;
  /** Earliest and latest selectable times, "HH:mm". */
  min?: string;
  max?: string;
  disabled?: boolean;
  locale?: string;
  id?: string;
  className?: string;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
};

const toMinutes = (value: string) => {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
};

const pad = (value: number) => String(value).padStart(2, "0");

/**
 * Replaces <input type="time">, whose popup and segment editing differ in
 * every browser. A list of slots is also faster for scheduling, where times
 * fall on a grid anyway.
 */
function TimePicker({
  value,
  onValueChange,
  placeholder,
  step = 30,
  min = "00:00",
  max = "23:59",
  disabled,
  locale,
  id,
  className,
  ...aria
}: TimePickerProps) {
  const slots = React.useMemo(() => {
    const format = new Intl.DateTimeFormat(locale, { hour: "numeric", minute: "2-digit" });
    const result: { value: string; label: string }[] = [];
    for (let total = toMinutes(min); total <= toMinutes(max); total += step) {
      const hours = Math.floor(total / 60);
      const minutes = total % 60;
      result.push({
        value: `${pad(hours)}:${pad(minutes)}`,
        label: format.format(new Date(2000, 0, 1, hours, minutes)),
      });
    }
    return result;
  }, [locale, min, max, step]);

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger id={id} className={className} {...aria}>
        <span className="flex items-center gap-2">
          <ClockIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          <span className="tabular">
            <SelectValue placeholder={placeholder} />
          </span>
        </span>
      </SelectTrigger>
      <SelectContent className="max-h-72">
        {slots.map((slot) => (
          <SelectItem key={slot.value} value={slot.value} className="tabular">
            {slot.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export { TimePicker };
export type { TimePickerProps };
