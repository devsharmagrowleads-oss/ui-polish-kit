"use client";

import * as React from "react";
import { Command as CommandPrimitive } from "cmdk";
import { SearchIcon, type LucideIcon } from "lucide-react";

import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type CommandItem = {
  id: string;
  label: string;
  icon?: LucideIcon;
  /** Extra words the search should match: "bill", "charge" for "Create invoice". */
  keywords?: string[];
  /** Shown on the right, e.g. "G I". Display only; register real shortcuts elsewhere. */
  shortcut?: string;
  onSelect: () => void;
};

type CommandGroup = { heading: string; items: CommandItem[] };

type CommandPaletteProps = {
  /** "Go to" (pages), "Create" (actions), "Recent" (records). Keep each group short. */
  groups: CommandGroup[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** e.g. "Search pages, invoices and actions". */
  placeholder?: string;
};

/**
 * A command palette for power users (Ctrl/⌘ K): one search over pages,
 * actions and recent records, operated entirely from the keyboard. Built on
 * the Dialog recipe (focus trap, Escape, focus returned to the trigger) and
 * cmdk (listbox semantics, arrow keys, filtering). It complements visible
 * navigation; never make it the only way to reach something.
 */
function CommandPalette({ groups, open, onOpenChange, placeholder = "Search pages and actions" }: CommandPaletteProps) {
  const [query, setQuery] = React.useState("");
  React.useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="top-24 max-w-xl translate-y-0 gap-0 overflow-hidden p-0">
        <DialogTitle className="sr-only">Command palette</DialogTitle>
        <DialogDescription className="sr-only">Type to search, use the arrow keys to choose, and press Enter to run.</DialogDescription>
        <CommandPrimitive label="Command palette" loop className="flex flex-col">
          <div className="flex items-center gap-3 border-b px-4">
            <SearchIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <CommandPrimitive.Input
              value={query}
              onValueChange={setQuery}
              placeholder={placeholder}
              className="h-12 w-full rounded-sm bg-transparent text-base outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset md:text-sm"
            />
          </div>
          <CommandPrimitive.List className="max-h-96 overflow-y-auto overscroll-contain p-2">
            <CommandPrimitive.Empty className="px-3 py-8 text-center text-sm text-muted-foreground">
              Nothing matches “{query}”. Try a page name, an invoice number or a client.
            </CommandPrimitive.Empty>
            {groups.map((group) => (
              <CommandPrimitive.Group
                key={group.heading}
                heading={group.heading}
                className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:pt-3 [&_[cmdk-group-heading]]:pb-1 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground"
              >
                {group.items.map((item) => (
                  <CommandPrimitive.Item
                    key={item.id}
                    value={`${group.heading} ${item.label}`}
                    keywords={item.keywords}
                    onSelect={() => {
                      onOpenChange(false);
                      item.onSelect();
                    }}
                    className={cn(
                      "flex h-10 cursor-pointer items-center gap-3 rounded-md px-3 text-sm select-none",
                      "data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground data-[disabled=true]:opacity-50",
                    )}
                  >
                    {item.icon ? <item.icon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" /> : null}
                    <span className="flex-1 truncate">{item.label}</span>
                    {item.shortcut ? <kbd className="font-mono text-xs text-muted-foreground">{item.shortcut}</kbd> : null}
                  </CommandPrimitive.Item>
                ))}
              </CommandPrimitive.Group>
            ))}
          </CommandPrimitive.List>
        </CommandPrimitive>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Opens the palette on Ctrl+K / ⌘K. Ignores the shortcut while an IME is
 * composing, and does not steal it from a focused editor that uses it.
 */
function useCommandPaletteShortcut(setOpen: React.Dispatch<React.SetStateAction<boolean>>) {
  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.isComposing || event.key.toLowerCase() !== "k" || !(event.metaKey || event.ctrlKey)) return;
      const target = event.target as HTMLElement | null;
      if (target?.closest("[data-own-mod-k]")) return;
      event.preventDefault();
      setOpen((open) => !open);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [setOpen]);
}

type CommandPaletteTriggerProps = React.ComponentProps<"button">;

/** The visible way in, for the top bar: looks like a search field and shows the shortcut. */
function CommandPaletteTrigger({ className, ...props }: CommandPaletteTriggerProps) {
  return (
    <button
      type="button"
      className={cn(
        "flex h-9 w-full max-w-xs items-center gap-2 rounded-md border border-input bg-background px-3 text-sm text-muted-foreground",
        "transition-[border-color,color] duration-(--duration-fast) ease-out hover:border-ring hover:text-foreground",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        className,
      )}
      {...props}
    >
      <SearchIcon className="size-4" aria-hidden="true" />
      <span className="flex-1 text-start">Search</span>
      <kbd className="font-mono text-xs" aria-label="Control K">
        Ctrl K
      </kbd>
    </button>
  );
}

export { CommandPalette, CommandPaletteTrigger, useCommandPaletteShortcut };
export type { CommandPaletteProps, CommandGroup, CommandItem };
