import {
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
  type JSX,
} from "react";
import { Button, Dialog, useDialogCloseTransition } from "@components";
import { useTranslation } from "@i18n";
import {
  DIALOG_CLOSE_DURATION_MS,
  getDialogTransitionClasses,
} from "@components/Dialogs/ConfirmationDialog";
import type { DeveloperConsoleDialogProps } from "./types";
import {
  DEVELOPER_CONSOLE_DIALOG_TITLE_ID,
  DEVELOPER_CONSOLE_DIFFICULTY_INPUT_ID,
  DEVELOPER_CONSOLE_KEYBOARD_INPUT_ID,
  DEVELOPER_CONSOLE_NAME_INPUT_ID,
  DEVELOPER_CONSOLE_SCORE_INPUT_ID,
  DEVELOPER_CONSOLE_STREAK_INPUT_ID,
} from "@views/Play/constants";

const DeveloperConsoleDialog = ({
  visible,
  onClose,
  developerConsoleEnabled,
  answer,
  player,
  showResumeDialog,
  submitDeveloperPlayer,
  refreshRemoteDictionaryChecksum,
  isRefreshingDictionaryChecksum,
  dictionaryChecksumMessage,
  dictionaryChecksumMessageKind,
}: DeveloperConsoleDialogProps): JSX.Element => {
  const { t } = useTranslation();
  const canRenderDialog =
    visible && developerConsoleEnabled && !showResumeDialog;

  const [name, setName] = useState(player.name);
  const [score, setScore] = useState(player.score.toString());
  const [streak, setStreak] = useState(player.streak.toString());
  const [difficulty, setDifficulty] = useState(player.difficulty);
  const [keyboardPreference, setKeyboardPreference] = useState(
    player.keyboardPreference,
  );
  const { isClosing, closeWithAction } = useDialogCloseTransition(
    DIALOG_CLOSE_DURATION_MS,
  );
  const { backdropAnimationClassName, panelAnimationClassName } =
    getDialogTransitionClasses(isClosing);

  useEffect(() => {
    if (!canRenderDialog) {
      return;
    }

    setName(player.name);
    setScore(player.score.toString());
    setStreak(player.streak.toString());
    setDifficulty(player.difficulty);
    setKeyboardPreference(player.keyboardPreference);
  }, [canRenderDialog, player]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isClosing) {
      return;
    }

    closeWithAction(() =>
      submitDeveloperPlayer({
        name,
        score: Number(score),
        streak: Number(streak),
        difficulty,
        keyboardPreference,
      }),
    );
  };

  return (
    <Dialog
      visible={canRenderDialog}
      onClose={onClose}
      isClosing={isClosing}
      titleId={DEVELOPER_CONSOLE_DIALOG_TITLE_ID}
      title={t("play.developerConsole.title")}
      description={t("play.developerConsole.description")}
      panelClassName="max-w-lg"
      zIndexClassName="z-30"
      backdropAnimationClassName={backdropAnimationClassName}
      panelAnimationClassName={panelAnimationClassName}
    >
      <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
        <div className="rounded-md border border-amber-300 bg-amber-50 p-3 dark:border-amber-700 dark:bg-amber-950/35">
          <p className="text-xs font-semibold text-amber-900 dark:text-amber-300">
            {t("play.developerConsole.currentAnswerLabel")}
          </p>
          <p className="mt-1 font-mono text-lg font-black tracking-[0.18em] text-amber-950 dark:text-amber-100">
            {answer}
          </p>
        </div>

        <label
          htmlFor={DEVELOPER_CONSOLE_NAME_INPUT_ID}
          className="block text-sm font-semibold text-neutral-900 dark:text-neutral-200"
        >
          {t("play.developerConsole.nameLabel")}
        </label>
        <input
          id={DEVELOPER_CONSOLE_NAME_INPUT_ID}
          type="text"
          value={name}
          maxLength={30}
          disabled={isClosing}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            setName(event.target.value)
          }
          className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100"
        />

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label
              htmlFor={DEVELOPER_CONSOLE_SCORE_INPUT_ID}
              className="block text-sm font-semibold text-neutral-900 dark:text-neutral-200"
            >
              {t("common.score")}
            </label>
            <input
              id={DEVELOPER_CONSOLE_SCORE_INPUT_ID}
              type="number"
              min={0}
              step={1}
              value={score}
              disabled={isClosing}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                setScore(event.target.value)
              }
              className="mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100"
            />
          </div>
          <div>
            <label
              htmlFor={DEVELOPER_CONSOLE_STREAK_INPUT_ID}
              className="block text-sm font-semibold text-neutral-900 dark:text-neutral-200"
            >
              {t("common.streak")}
            </label>
            <input
              id={DEVELOPER_CONSOLE_STREAK_INPUT_ID}
              type="number"
              min={0}
              step={1}
              value={streak}
              disabled={isClosing}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                setStreak(event.target.value)
              }
              className="mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label
              htmlFor={DEVELOPER_CONSOLE_DIFFICULTY_INPUT_ID}
              className="block text-sm font-semibold text-neutral-900 dark:text-neutral-200"
            >
              {t("play.developerConsole.difficultyLabel")}
            </label>
            <select
              id={DEVELOPER_CONSOLE_DIFFICULTY_INPUT_ID}
              value={difficulty}
              disabled={isClosing}
              onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                setDifficulty(event.target.value as typeof player.difficulty)
              }
              className="mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100"
            >
              <option value="easy">
                {t("profile.difficultyOptions.easy")}
              </option>
              <option value="normal">
                {t("profile.difficultyOptions.normal")}
              </option>
              <option value="hard">
                {t("profile.difficultyOptions.hard")}
              </option>
              <option value="insane">
                {t("profile.difficultyOptions.insane")}
              </option>
            </select>
          </div>
          <div>
            <label
              htmlFor={DEVELOPER_CONSOLE_KEYBOARD_INPUT_ID}
              className="block text-sm font-semibold text-neutral-900 dark:text-neutral-200"
            >
              {t("play.developerConsole.keyboardModeLabel")}
            </label>
            <select
              id={DEVELOPER_CONSOLE_KEYBOARD_INPUT_ID}
              value={keyboardPreference}
              disabled={isClosing}
              onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                setKeyboardPreference(
                  event.target.value as typeof player.keyboardPreference,
                )
              }
              className="mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100"
            >
              <option value="onscreen">
                {t("profile.keyboardOptions.onscreen")}
              </option>
              <option value="native">
                {t("profile.keyboardOptions.native")}
              </option>
            </select>
          </div>
        </div>

        <div className="rounded-md border border-neutral-300 bg-neutral-50 p-3 dark:border-neutral-700 dark:bg-neutral-900">
          <p className="text-xs text-neutral-700 dark:text-neutral-300">
            {t("play.developerConsole.checksumDescription")}
          </p>
          <div className="mt-2">
            <Button
              type="button"
              variant="outline"
              disabled={isClosing || isRefreshingDictionaryChecksum}
              onClick={() => {
                void refreshRemoteDictionaryChecksum();
              }}
            >
              {isRefreshingDictionaryChecksum
                ? t("play.developerConsole.refreshing")
                : t("play.developerConsole.refreshChecksum")}
            </Button>
          </div>
          {dictionaryChecksumMessage && (
            <p
              className={`mt-2 text-sm ${
                dictionaryChecksumMessageKind === "error"
                  ? "text-red-600 dark:text-red-400"
                  : "text-emerald-700 dark:text-emerald-400"
              }`}
            >
              {dictionaryChecksumMessage}
            </p>
          )}
        </div>

        <div className="mt-5 flex flex-wrap justify-end gap-3">
          <Button type="submit" disabled={isClosing}>
            {t("play.developerConsole.apply")}
          </Button>
          <Button
            onClick={() => closeWithAction(onClose)}
            variant="outline"
            disabled={isClosing}
          >
            {t("play.developerConsole.cancel")}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};

export default DeveloperConsoleDialog;
