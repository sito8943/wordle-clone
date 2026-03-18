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
    danger:
      "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600 dark:bg-red-500 dark:hover:bg-red-400",
    warning:
      "bg-amber-500 text-neutral-950 hover:bg-amber-600 focus-visible:ring-amber-500 dark:bg-amber-400 dark:text-neutral-950 dark:hover:bg-amber-300",
    info: "bg-sky-600 text-white hover:bg-sky-700 focus-visible:ring-sky-600 dark:bg-sky-500 dark:hover:bg-sky-400",
    success:
      "bg-green-600 text-white hover:bg-green-700 focus-visible:ring-green-600 dark:bg-green-500 dark:hover:bg-green-400",
  },
  outline: {
    primary:
      "border border-primary text-primary hover:bg-primary/10 focus-visible:ring-primary dark:text-blue-300 dark:hover:bg-blue-500/15",
    secondary:
      "border border-secondary text-secondary hover:bg-secondary/10 focus-visible:ring-secondary dark:text-teal-300 dark:hover:bg-teal-500/15",
    neutral:
      "border border-neutral-300 text-neutral-800 hover:bg-neutral-100 focus-visible:ring-neutral-500 dark:border-neutral-600 dark:text-neutral-100 dark:hover:bg-neutral-800",
    danger:
      "border border-red-600 text-red-600 hover:bg-red-50 focus-visible:ring-red-600 dark:border-red-500 dark:text-red-400 dark:hover:bg-red-500/15",
    warning:
      "border border-amber-500 text-amber-700 hover:bg-amber-50 focus-visible:ring-amber-500 dark:border-amber-400 dark:text-amber-300 dark:hover:bg-amber-500/15",
    info: "border border-sky-600 text-sky-600 hover:bg-sky-50 focus-visible:ring-sky-600 dark:border-sky-500 dark:text-sky-300 dark:hover:bg-sky-500/15",
    success:
      "border border-green-600 text-green-600 hover:bg-green-50 focus-visible:ring-green-600 dark:border-green-500 dark:text-green-400 dark:hover:bg-green-500/15",
  },
  ghost: {
    primary:
      "text-primary hover:bg-primary/10 focus-visible:ring-primary dark:text-blue-300 dark:hover:bg-blue-500/15",
    secondary:
      "text-secondary hover:bg-secondary/10 focus-visible:ring-secondary dark:text-teal-300 dark:hover:bg-teal-500/15",
    neutral:
      "text-neutral-800 hover:bg-neutral-100 focus-visible:ring-neutral-500 dark:text-neutral-100 dark:hover:bg-neutral-800",
    danger:
      "text-red-600 hover:bg-red-50 focus-visible:ring-red-600 dark:text-red-400 dark:hover:bg-red-500/15",
    warning:
      "text-amber-700 hover:bg-amber-50 focus-visible:ring-amber-500 dark:text-amber-300 dark:hover:bg-amber-500/15",
    info: "text-sky-600 hover:bg-sky-50 focus-visible:ring-sky-600 dark:text-sky-300 dark:hover:bg-sky-500/15",
    success:
      "text-green-600 hover:bg-green-50 focus-visible:ring-green-600 dark:text-green-400 dark:hover:bg-green-500/15",
  },
};
