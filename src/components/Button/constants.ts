import type { ButtonVariant, ButtonColor } from "./types";

export const BASE_STYLE =
  "inline-flex items-center justify-center gap-2 rounded px-4 py-2 text-sm font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-100 dark:focus-visible:ring-offset-neutral-900 disabled:cursor-not-allowed disabled:opacity-50";

export const STYLE_BY_VARIANT: Record<
  ButtonVariant,
  Record<ButtonColor, string>
> = {
  solid: {
    primary:
      "bg-primary text-white hover:bg-primary/90 focus-visible:ring-primary",
    secondary:
      "bg-secondary text-white hover:bg-secondary/90 focus-visible:ring-secondary",
    neutral:
      "bg-neutral-900 text-white hover:bg-neutral-700 focus-visible:ring-neutral-500 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200",
  },
  outline: {
    primary:
      "border border-primary text-primary hover:bg-primary/10 focus-visible:ring-primary dark:text-blue-300 dark:hover:bg-blue-500/15",
    secondary:
      "border border-secondary text-secondary hover:bg-secondary/10 focus-visible:ring-secondary dark:text-teal-300 dark:hover:bg-teal-500/15",
    neutral:
      "border border-neutral-300 text-neutral-800 hover:bg-neutral-100 focus-visible:ring-neutral-500 dark:border-neutral-600 dark:text-neutral-100 dark:hover:bg-neutral-800",
  },
  ghost: {
    primary:
      "text-primary hover:bg-primary/10 focus-visible:ring-primary dark:text-blue-300 dark:hover:bg-blue-500/15",
    secondary:
      "text-secondary hover:bg-secondary/10 focus-visible:ring-secondary dark:text-teal-300 dark:hover:bg-teal-500/15",
    neutral:
      "text-neutral-800 hover:bg-neutral-100 focus-visible:ring-neutral-500 dark:text-neutral-100 dark:hover:bg-neutral-800",
  },
};
