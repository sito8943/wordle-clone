import { i18n } from "@i18n";
import type { ErrorFallbackProps } from "./types";
import { reloadPage } from "./utils";

export const ErrorFallback = ({
  title = i18n.t("errors.generic.title"),
  description = i18n.t("errors.generic.description"),
  actionLabel = i18n.t("errors.generic.action"),
  onAction = reloadPage,
}: ErrorFallbackProps) => (
  <section
    role="alert"
    className="w-full max-w-xl rounded border border-red-300 bg-red-100 px-4 py-3 text-red-900 dark:border-red-700 dark:bg-red-950/40 dark:text-red-200"
  >
    <p className="text-sm font-semibold">{title}</p>
    <p className="mt-1 text-sm">{description}</p>
    {onAction ? (
      <button
        type="button"
        onClick={onAction}
        className="mt-3 rounded border border-red-400 bg-red-200 px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-red-300 dark:border-red-600 dark:bg-red-900/40 dark:hover:bg-red-900/70"
      >
        {actionLabel}
      </button>
    ) : null}
  </section>
);
