import * as React from "react";

import { cn } from "@/lib/utils";
import { controlClasses } from "./input";

function Textarea({ className, rows = 4, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      rows={rows}
      // field-sizing grows the box with its content where supported; rows is the floor.
      className={cn(controlClasses, "h-auto min-h-20 resize-y py-2 leading-normal field-sizing-content read-only:bg-muted", className)}
      {...props}
    />
  );
}

export { Textarea };
