/*
 * Tailwind v3 mapping of the ui-polish-kit tokens.
 *
 * Use this only on Tailwind v3 projects. Copy the `:root`, `.dark` and
 * `@layer base` blocks from tokens.css into your global stylesheet (drop the
 * `@import "tailwindcss"`, `@custom-variant`, `@theme` and `@utility` blocks,
 * which are v4 syntax), declare the font/shadow/ease variables from the
 * `@theme` block inside `:root`, then merge this file into tailwind.config.ts.
 */
import type { Config } from "tailwindcss";

/** Lets opacity modifiers (`bg-primary/90`) work with oklch variables in v3. */
const token = (name: string) =>
  `color-mix(in oklch, var(--${name}) calc(<alpha-value> * 100%), transparent)`;

const pair = (name: string) => ({
  DEFAULT: token(name),
  foreground: token(`${name}-foreground`),
});

const config: Config = {
  darkMode: ["class", '[data-theme="dark"]'],
  content: ["./src/**/*.{ts,tsx,js,jsx,mdx}", "./app/**/*.{ts,tsx,js,jsx,mdx}"],
  theme: {
    extend: {
      colors: {
        background: token("background"),
        foreground: token("foreground"),
        card: pair("card"),
        popover: pair("popover"),
        primary: pair("primary"),
        secondary: pair("secondary"),
        muted: pair("muted"),
        accent: pair("accent"),
        destructive: pair("destructive"),
        success: pair("success"),
        warning: pair("warning"),
        info: pair("info"),
        border: token("border"),
        input: token("input"),
        ring: token("ring"),
        overlay: "var(--overlay)",
      },
      borderRadius: {
        sm: "calc(var(--radius) - 4px)",
        md: "calc(var(--radius) - 2px)",
        lg: "var(--radius)",
        xl: "calc(var(--radius) + 4px)",
      },
      boxShadow: {
        xs: "var(--shadow-xs)",
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
      },
      fontFamily: {
        sans: "var(--font-sans)",
        display: "var(--font-display)",
        mono: "var(--font-mono)",
      },
      zIndex: {
        sticky: "var(--z-sticky)",
        dropdown: "var(--z-dropdown)",
        overlay: "var(--z-overlay)",
        modal: "var(--z-modal)",
        popover: "var(--z-popover)",
        toast: "var(--z-toast)",
        tooltip: "var(--z-tooltip)",
      },
      transitionDuration: {
        fast: "var(--duration-fast)",
        base: "var(--duration-base)",
        slow: "var(--duration-slow)",
      },
      transitionTimingFunction: {
        out: "var(--ease-out)",
        "in-out": "var(--ease-in-out)",
      },
      maxWidth: {
        prose: "65ch",
      },
      spacing: {
        section: "var(--space-section)",
        gutter: "var(--space-gutter)",
      },
      keyframes: {
        "fade-in": { from: { opacity: "0" } },
        "pop-in": { from: { opacity: "0", transform: "scale(0.97)" } },
      },
      animation: {
        "fade-in": "fade-in var(--duration-base) var(--ease-out)",
        "pop-in": "pop-in var(--duration-base) var(--ease-out)",
      },
    },
  },
};

/*
 * The components use v4 shorthand in a few places. On v3 replace:
 *   z-(--z-modal)                 -> z-modal
 *   duration-(--duration-fast)    -> duration-fast
 *   size-(--cell-size)            -> size-[var(--cell-size)]
 *   py-(--space-section)          -> py-section
 *   w-(--radix-…)                 -> w-[var(--radix-…)]
 */
export default config;
