import { useEffect, useMemo, useRef, useState } from "react";
import { Dialog } from "@components/Dialogs/Dialog";
import { useTranslation } from "@i18n";
import { WORD_LIST_DIALOG_TITLE_ID } from "./constants";
import type { WordListDialogProps } from "./types";

const WordListDialog = ({
  visible,
  language,
  words,
  onClose,
}: WordListDialogProps) => {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredWords = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (normalizedQuery.length === 0) {
      return words;
    }

    return words.filter((word) => word.includes(normalizedQuery));
  }, [query, words]);

  useEffect(() => {
    if (visible) inputRef.current?.focus();
  }, [visible]);

  return (
    <Dialog
      visible={visible}
      onClose={onClose}
      titleId={WORD_LIST_DIALOG_TITLE_ID}
      title={t("home.wordListDialog.title")}
      description={t("home.wordListDialog.description", {
        language: language.toUpperCase(),
        filtered: filteredWords.length,
        total: words.length,
      })}
      panelClassName="max-w-2xl"
    >
      <div className="mt-4">
        <label
          htmlFor="word-list-search"
          className="text-sm font-semibold text-neutral-700 dark:text-neutral-200"
        >
          {t("home.wordListDialog.searchLabel")}
        </label>
        <input
          id="word-list-search"
          type="search"
          value={query}
          ref={inputRef}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t("home.wordListDialog.searchPlaceholder")}
          className="mt-1 w-full rounded border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none ring-primary/40 focus:ring-2 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100"
        />
      </div>

      <div className="mt-4 max-h-[50vh] overflow-y-auto rounded border border-neutral-200 bg-neutral-50 p-3 dark:border-neutral-700 dark:bg-neutral-950/40">
        {filteredWords.length === 0 ? (
          <p className="text-sm text-neutral-700 dark:text-neutral-300">
            {t("home.wordListDialog.empty")}
          </p>
        ) : (
          <ul className="grid grid-cols-2 gap-2 text-xs font-semibold uppercase sm:grid-cols-3 md:grid-cols-4">
            {filteredWords.map((word) => (
              <li
                key={word}
                className="rounded border border-neutral-200 bg-white px-2 py-1 text-center tracking-wide text-neutral-700 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200"
              >
                {word}
              </li>
            ))}
          </ul>
        )}
      </div>
    </Dialog>
  );
};

export default WordListDialog;
