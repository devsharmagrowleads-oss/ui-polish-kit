"use client";

import * as React from "react";
import { Command as CommandPrimitive } from "cmdk";
import { CheckIcon, ChevronsUpDownIcon, SearchIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { controlClasses } from "./input";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

type ComboboxOption = {
  value: string;
  label: string;
  /** Extra words the search should match, e.g. an ISO code next to a country name. */
  keywords?: string[];
  disabled?: boolean;
};

type ComboboxProps = {
  options: ComboboxOption[];
  value?: string;
  onValueChange?: (value: string | undefined) => void;
  /** Shown in the trigger when nothing is selected, e.g. "Select a country". */
  placeholder: string;
  /** Shown in the search field, e.g. "Search countries". */
  searchPlaceholder: string;
  /** Shown when the search matches nothing. Say what was searched, not just "No results". */
  emptyMessage: string;
  disabled?: boolean;
  id?: string;
  className?: string;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
};

/** Searchable select. Use it instead of Select once a list passes roughly ten options. */
function Combobox({
  options,
  value,
  onValueChange,
  placeholder,
  searchPlaceholder,
  emptyMessage,
  disabled,
  id,
  className,
  ...aria
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const listId = React.useId();
  const selected = options.find((option) => option.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          id={id}
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-haspopup="listbox"
          disabled={disabled}
          data-slot="combobox-trigger"
          className={cn(
            controlClasses,
            "flex items-center justify-between gap-2 text-left data-[state=open]:border-ring",
            !selected && "text-muted-foreground",
            className,
          )}
          {...aria}
        >
          <span className="truncate">{selected ? selected.label : placeholder}</span>
          <ChevronsUpDownIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        </button>
      </PopoverTrigger>

      <PopoverContent className="w-(--radix-popover-trigger-width) min-w-56 p-0">
        <CommandPrimitive data-slot="combobox" className="flex flex-col overflow-hidden rounded-md">
          <div className="flex items-center gap-2 border-b px-3 focus-within:border-ring">
            <SearchIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <CommandPrimitive.Input
              placeholder={searchPlaceholder}
              aria-label={searchPlaceholder}
              // The wrapper's border colour is the focus indicator for this embedded field.
              className="h-10 w-full bg-transparent text-base outline-hidden placeholder:text-muted-foreground focus-visible:outline-hidden md:text-sm"
            />
          </div>

          <CommandPrimitive.List id={listId} className="max-h-72 scroll-py-1 overflow-y-auto p-1">
            <CommandPrimitive.Empty className="px-2 py-6 text-center text-sm text-muted-foreground">
              {emptyMessage}
            </CommandPrimitive.Empty>

            {options.map((option) => (
              <CommandPrimitive.Item
                key={option.value}
                value={option.label}
                keywords={option.keywords}
                disabled={option.disabled}
                onSelect={() => {
                  // Selecting the current value again clears it.
                  onValueChange?.(option.value === value ? undefined : option.value);
                  setOpen(false);
                }}
                className={cn(
                  "relative flex min-h-9 cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm select-none",
                  "data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground",
                  "data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50",
                )}
              >
                <span className="truncate">{option.label}</span>
                {option.value === value ? (
                  <CheckIcon className="absolute right-2 size-4" aria-hidden="true" />
                ) : null}
              </CommandPrimitive.Item>
            ))}
          </CommandPrimitive.List>
        </CommandPrimitive>
      </PopoverContent>
    </Popover>
  );
}

export { Combobox };
export type { ComboboxOption, ComboboxProps };
