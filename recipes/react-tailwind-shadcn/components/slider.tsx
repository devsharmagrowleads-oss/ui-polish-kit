"use client";

import * as React from "react";
import { Slider as SliderPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

type SliderProps = React.ComponentProps<typeof SliderPrimitive.Root> & {
  /** One accessible name per thumb, e.g. ["Minimum price", "Maximum price"]. */
  thumbLabels: string[];
};

/** Replaces <input type="range">, whose track and thumb look different in every browser. */
function Slider({ className, defaultValue, value, min = 0, max = 100, thumbLabels, ...props }: SliderProps) {
  const thumbs = value ?? defaultValue ?? [min];

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      className={cn(
        // min-h-10 gives the whole control a 40px touch area even though the track is thin.
        "relative flex min-h-10 w-full touch-none items-center select-none data-[disabled]:opacity-50",
        "data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-40 data-[orientation=vertical]:w-10 data-[orientation=vertical]:flex-col",
        className,
      )}
      {...props}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        className="relative grow overflow-hidden rounded-full bg-muted data-[orientation=horizontal]:h-1.5 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1.5"
      >
        <SliderPrimitive.Range
          data-slot="slider-range"
          className="absolute bg-primary data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full"
        />
      </SliderPrimitive.Track>

      {thumbs.map((_, index) => (
        <SliderPrimitive.Thumb
          key={index}
          data-slot="slider-thumb"
          aria-label={thumbLabels[index]}
          className={cn(
            "block size-5 shrink-0 rounded-full border-2 border-primary bg-background shadow-sm",
            "transition-[box-shadow,transform] duration-(--duration-fast) ease-out",
            "hover:shadow-md active:scale-110",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
            "data-[disabled]:pointer-events-none",
          )}
        />
      ))}
    </SliderPrimitive.Root>
  );
}

export { Slider };
export type { SliderProps };
