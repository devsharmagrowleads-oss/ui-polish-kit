"use client";

import * as React from "react";
import { CircleAlertIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Label } from "./label";

type FieldControlProps = {
  id?: string;
  required?: boolean;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean;
  "aria-required"?: boolean;
};

type FieldProps = {
  label: string;
  /** Persistent help shown under the control. Use it instead of placeholder text for instructions. */
  hint?: string;
  /** Validation message. When set, the control is marked invalid and the message is announced. */
  error?: string;
  required?: boolean;
  /** Mark the minority case: if most fields are required, label the optional ones instead. */
  optional?: boolean;
  className?: string;
  /** Exactly one control: Input, Textarea, SelectTrigger, DatePicker, … */
  children: React.ReactElement<FieldControlProps>;
};

/**
 * Wires a label, hint and error to one control so the agent cannot forget
 * `htmlFor`, `aria-describedby` or `aria-invalid`.
 *
 *   <Field label="Work email" hint="We send invoices here." error={errors.email} required>
 *     <Input type="email" autoComplete="email" />
 *   </Field>
 */
function Field({ label, hint, error, required, optional, className, children }: FieldProps) {
  const generatedId = React.useId();
  const id = children.props.id ?? generatedId;
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy =
    [children.props["aria-describedby"], hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div data-slot="field" data-invalid={error ? true : undefined} className={cn("grid gap-2", className)}>
      <Label htmlFor={id}>
        {label}
        {required ? (
          <span className="text-destructive" aria-hidden="true">
            *
          </span>
        ) : null}
        {optional ? <span className="font-normal text-muted-foreground">(optional)</span> : null}
      </Label>

      {React.cloneElement(children, {
        id,
        required: required || children.props.required,
        "aria-required": required || undefined,
        "aria-invalid": error ? true : children.props["aria-invalid"],
        "aria-describedby": describedBy,
      })}

      {hint ? (
        <p id={hintId} className="text-sm text-muted-foreground">
          {hint}
        </p>
      ) : null}

      {/* Always rendered below the control and never colour-only: icon + text. */}
      {error ? (
        <p id={errorId} role="alert" className="flex items-start gap-2 text-sm text-destructive">
          <CircleAlertIcon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </p>
      ) : null}
    </div>
  );
}

export { Field };
export type { FieldProps };
