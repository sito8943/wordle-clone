import type { ButtonColor } from "@components/Button/types";

export const ALERT_BASE_STYLE = "rounded border px-3 py-2 text-sm";

export const ALERT_COLOR_STYLE: Record<ButtonColor, string> = {
  primary:
    "border-primary/30 bg-primary/10 text-primary dark:border-blue-700 dark:bg-blue-950/40 dark:text-blue-200",
  secondary:
    "border-secondary/30 bg-secondary/10 text-secondary dark:border-teal-700 dark:bg-teal-950/40 dark:text-teal-200",
  neutral:
    "border-neutral-300 bg-neutral-100 text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950/40 dark:text-neutral-200",
  danger:
    "border-red-300 bg-red-100 text-red-900 dark:border-red-700 dark:bg-red-950/40 dark:text-red-200",
  warning:
    "border-amber-300 bg-amber-100 text-amber-900 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-200",
  info: "border-sky-300 bg-sky-100 text-sky-900 dark:border-sky-700 dark:bg-sky-950/40 dark:text-sky-200",
  success:
    "border-green-300 bg-green-100 text-green-900 dark:border-green-700 dark:bg-green-950/40 dark:text-green-200",
};
