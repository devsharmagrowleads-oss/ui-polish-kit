import * as React from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SettingsSectionProps = Omit<React.ComponentProps<"form">, "title"> & {
  /** A short noun phrase: "Invoice defaults". */
  title: string;
  /** What these settings change, in one or two sentences. */
  description: string;
  /** Fields built with the Field recipe, three to seven per section (UX-04, FM-09). */
  children: React.ReactNode;
  /** Shows the save bar only when something changed, and blocks double submits (FM-08). */
  dirty?: boolean;
  saving?: boolean;
  /** Label the action by what it does: "Save invoice defaults" (CP-04). */
  saveLabel?: string;
  onReset?: () => void;
  /** Danger-zone styling for destructive sections; keep them last on the page (UX-01). */
  tone?: "default" | "danger";
};

/**
 * A settings page section: the title and description on the left, the fields
 * on the right in a card, and a save bar that appears only when something
 * changed. Each section is its own form, so saving one does not submit the
 * others. Stack sections with gap-10 and a border between them.
 */
function SettingsSection({
  title,
  description,
  children,
  dirty = false,
  saving = false,
  saveLabel = "Save changes",
  onReset,
  tone = "default",
  className,
  ...props
}: SettingsSectionProps) {
  const headingId = React.useId();
  return (
    <form aria-labelledby={headingId} className={cn("grid gap-6 lg:grid-cols-3 lg:gap-10", className)} {...props}>
      <div className="flex flex-col gap-1">
        <h2 id={headingId} className={cn("text-base font-semibold", tone === "danger" && "text-destructive")}>
          {title}
        </h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className={cn("rounded-lg border bg-card text-card-foreground lg:col-span-2", tone === "danger" && "border-destructive")}>
        <div className="flex flex-col gap-5 p-6">{children}</div>
        {dirty || saving ? (
          <div className="flex items-center justify-end gap-2 border-t bg-muted px-6 py-3">
            {onReset ? (
              <Button type="button" variant="ghost" onClick={onReset} disabled={saving}>
                Discard
              </Button>
            ) : null}
            <Button type="submit" loading={saving}>
              {saveLabel}
            </Button>
          </div>
        ) : null}
      </div>
    </form>
  );
}

export { SettingsSection };
export type { SettingsSectionProps };
