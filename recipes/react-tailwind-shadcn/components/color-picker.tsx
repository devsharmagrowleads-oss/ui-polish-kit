"use client";

import * as React from "react";
import { CheckIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { controlClasses, Input } from "./input";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

type ColorPreset = {
  /** Human name read by screen readers, e.g. "Forest green". */
  label: string;
  /** Any CSS colour string. Comes from data (brand palette, user settings), never from this file. */
  value: string;
};

type ColorPickerProps = {
  value: string;
  onValueChange: (value: string) => void;
  presets: ColorPreset[];
  /** Accessible name of the trigger, e.g. "Label colour". */
  label: string;
  /** Allow typing a custom six-digit hex value. */
  allowCustom?: boolean;
  disabled?: boolean;
  id?: string;
  className?: string;
};

const HEX_DIGITS = /^[0-9a-f]{6}$/i;

/**
 * Replaces <input type="color">, which opens an OS dialog that ignores the
 * app's theme. Most products only need a curated set of swatches anyway;
 * `allowCustom` adds a hex field for the rest.
 */
function ColorPicker({
  value,
  onValueChange,
  presets,
  label,
  allowCustom = true,
  disabled,
  id,
  className,
}: ColorPickerProps) {
  const hexId = React.useId();
  const errorId = `${hexId}-error`;
  const [draft, setDraft] = React.useState("");
  const [invalid, setInvalid] = React.useState(false);
  const current = presets.find((preset) => preset.value.toLowerCase() === value.toLowerCase());

  const commitDraft = () => {
    const digits = draft.trim().replace(/^#/, "");
    if (digits === "") return;
    if (!HEX_DIGITS.test(digits)) {
      setInvalid(true);
      return;
    }
    setInvalid(false);
    onValueChange(`#${digits.toLowerCase()}`);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          id={id}
          disabled={disabled}
          aria-label={`${label}: ${current?.label ?? value}`}
          data-slot="color-picker-trigger"
          className={cn(controlClasses, "flex items-center gap-2 text-left data-[state=open]:border-ring", className)}
        >
          <span
            className="size-5 shrink-0 rounded-sm border border-foreground/15"
            style={{ backgroundColor: value }}
            aria-hidden="true"
          />
          <span className="truncate">{current?.label ?? value}</span>
        </button>
      </PopoverTrigger>

      <PopoverContent className="w-64">
        <div role="group" aria-label={label} className="grid grid-cols-6 gap-2">
          {presets.map((preset) => {
            const selected = preset === current;
            return (
              <button
                key={preset.value}
                type="button"
                aria-label={preset.label}
                aria-pressed={selected}
                onClick={() => onValueChange(preset.value)}
                className={cn(
                  "flex size-8 items-center justify-center rounded-md border border-foreground/15",
                  "transition-transform duration-(--duration-fast) ease-out",
                  "hover:scale-110 active:scale-95",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                )}
                style={{ backgroundColor: preset.value }}
              >
                {/* A check on a pill, so it stays visible on any swatch colour. */}
                {selected ? (
                  <span className="flex size-4 items-center justify-center rounded-full bg-background text-foreground">
                    <CheckIcon className="size-3" aria-hidden="true" />
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>

        {allowCustom ? (
          <div className="mt-4 grid gap-2">
            <label htmlFor={hexId} className="text-sm font-medium">
              Custom hex
            </label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground" aria-hidden="true">
                #
              </span>
              <Input
                id={hexId}
                value={draft}
                maxLength={7}
                placeholder="RRGGBB"
                autoCapitalize="off"
                autoComplete="off"
                spellCheck={false}
                aria-invalid={invalid || undefined}
                aria-describedby={invalid ? errorId : undefined}
                className="font-mono"
                onChange={(event) => {
                  setDraft(event.target.value);
                  setInvalid(false);
                }}
                onBlur={commitDraft}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    commitDraft();
                  }
                }}
              />
            </div>
            {invalid ? (
              <p id={errorId} role="alert" className="text-sm text-destructive">
                Enter six hex digits, using 0–9 and A–F.
              </p>
            ) : null}
          </div>
        ) : null}
      </PopoverContent>
    </Popover>
  );
}

export { ColorPicker };
export type { ColorPickerProps, ColorPreset };
