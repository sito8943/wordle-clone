import {
  useEffect,
  useRef,
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
  showChallengesSection,
  showDailySection,
  submitDeveloperPlayer,
  refreshRemoteDictionaryChecksum,
  isRefreshingDictionaryChecksum,
  dictionaryChecksumMessage,
  dictionaryChecksumMessageKind,
  refreshDailyChallengesForDeveloper,
  changeDailyChallengesForDeveloper,
  isRefreshingDailyChallengesForDeveloper,
  isChangingDailyChallengesForDeveloper,
  dailyChallengesDeveloperMessage,
  dailyChallengesDeveloperMessageKind,
  resetDailyForCurrentPlayerForDeveloper,
  resetDailyForAllPlayersForDeveloper,
  dailyModeDeveloperMessage,
  dailyModeDeveloperMessageKind,
}: DeveloperConsoleDialogProps): JSX.Element => {
  const { t } = useTranslation();
  const canRenderDialog =
    visible && developerConsoleEnabled && !showResumeDialog;

  const [name, setName] = useState(player.name);
  const [score, setScore] = useState(player.score.toString());
  const [streak, setStreak] = useState(player.streak.toString());
  const initializedForCurrentOpenRef = useRef(false);
  const { isClosing, closeWithAction } = useDialogCloseTransition(
    DIALOG_CLOSE_DURATION_MS,
  );
  const { backdropAnimationClassName, panelAnimationClassName } =
    getDialogTransitionClasses(isClosing);

  useEffect(() => {
    if (!canRenderDialog) {
      initializedForCurrentOpenRef.current = false;
      return;
    }

    if (initializedForCurrentOpenRef.current) {
      return;
    }

    initializedForCurrentOpenRef.current = true;
    setName(player.name);
    setScore(player.score.toString());
    setStreak(player.streak.toString());
  }, [canRenderDialog, player]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isClosing) {
      return;
    }

    submitDeveloperPlayer({
      name,
      score: Number(score),
      streak: Number(streak),
    });
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

        <div className="flex gap-2 flex-wrap">
          <div className="w-full max-w-36">
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
              className="mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100"
            />
          </div>
          <div className="w-full max-w-28">
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
          <div className="w-full max-w-28">
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

        {showChallengesSection ? (
          <div className="rounded-md border border-neutral-300 bg-neutral-50 p-3 dark:border-neutral-700 dark:bg-neutral-900">
            <p className="text-xs text-neutral-700 dark:text-neutral-300">
              {t("play.developerConsole.challengesDescription")}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={
                  isClosing ||
                  isRefreshingDailyChallengesForDeveloper ||
                  isChangingDailyChallengesForDeveloper
                }
                onClick={() => {
                  void refreshDailyChallengesForDeveloper();
                }}
              >
                {isRefreshingDailyChallengesForDeveloper
                  ? t("play.developerConsole.challengesRefreshing")
                  : t("play.developerConsole.refreshChallenges")}
              </Button>
              <Button
                type="button"
                variant="outline"
                color="danger"
                disabled={
                  isClosing ||
                  isRefreshingDailyChallengesForDeveloper ||
                  isChangingDailyChallengesForDeveloper
                }
                onClick={() => {
                  void changeDailyChallengesForDeveloper();
                }}
              >
                {isChangingDailyChallengesForDeveloper
                  ? t("play.developerConsole.challengesChanging")
                  : t("play.developerConsole.changeChallenges")}
              </Button>
            </div>
            {dailyChallengesDeveloperMessage && (
              <p
                className={`mt-2 text-sm ${
                  dailyChallengesDeveloperMessageKind === "error"
                    ? "text-red-600 dark:text-red-400"
                    : "text-emerald-700 dark:text-emerald-400"
                }`}
              >
                {dailyChallengesDeveloperMessage}
              </p>
            )}
          </div>
        ) : null}

        {showDailySection ? (
          <div className="rounded-md border border-neutral-300 bg-neutral-50 p-3 dark:border-neutral-700 dark:bg-neutral-900">
            <p className="text-xs text-neutral-700 dark:text-neutral-300">
              {t("play.developerConsole.dailyDescription")}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={isClosing}
                onClick={resetDailyForCurrentPlayerForDeveloper}
              >
                {t("play.developerConsole.resetDailyForCurrentPlayer")}
              </Button>
              <Button
                type="button"
                variant="outline"
                color="danger"
                disabled={isClosing}
                onClick={resetDailyForAllPlayersForDeveloper}
              >
                {t("play.developerConsole.resetDailyForAllPlayers")}
              </Button>
            </div>
            {dailyModeDeveloperMessage ? (
              <p
                className={`mt-2 text-sm ${
                  dailyModeDeveloperMessageKind === "error"
                    ? "text-red-600 dark:text-red-400"
                    : "text-emerald-700 dark:text-emerald-400"
                }`}
              >
                {dailyModeDeveloperMessage}
              </p>
            ) : null}
          </div>
        ) : null}

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
