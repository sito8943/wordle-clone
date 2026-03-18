import {
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
  type JSX,
} from "react";
import { Button, Dialog, useDialogCloseTransition } from "@components";
import { DIALOG_CLOSE_DURATION_MS } from "@components/Dialogs/ConfirmationDialog";
import type { HomeDeveloperConsoleDialogProps } from "@views/Home/hooks/useNativeKeyboardingInput/types";
import { useHomeView } from "@views/Home/providers";
import {
  DEVELOPER_CONSOLE_CANCEL_ACTION_LABEL,
  DEVELOPER_CONSOLE_DIALOG_DESCRIPTION,
  DEVELOPER_CONSOLE_DIALOG_TITLE,
  DEVELOPER_CONSOLE_DIALOG_TITLE_ID,
  DEVELOPER_CONSOLE_DIFFICULTY_INPUT_ID,
  DEVELOPER_CONSOLE_KEYBOARD_INPUT_ID,
  DEVELOPER_CONSOLE_NAME_INPUT_ID,
  DEVELOPER_CONSOLE_REFRESH_CHECKSUM_ACTION_LABEL,
  DEVELOPER_CONSOLE_SCORE_INPUT_ID,
  DEVELOPER_CONSOLE_STREAK_INPUT_ID,
  DEVELOPER_CONSOLE_SUBMIT_ACTION_LABEL,
} from "@views/Home/constants";

const DeveloperConsoleDialog = ({
  visible,
  onClose,
}: HomeDeveloperConsoleDialogProps): JSX.Element => {
  const { controller, player, developerConsoleEnabled } = useHomeView();
  const {
    showResumeDialog,
    submitDeveloperPlayer,
    refreshRemoteDictionaryChecksum,
    isRefreshingDictionaryChecksum,
    dictionaryChecksumMessage,
    dictionaryChecksumMessageKind,
  } = controller;
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
      titleId={DEVELOPER_CONSOLE_DIALOG_TITLE_ID}
      title={DEVELOPER_CONSOLE_DIALOG_TITLE}
      description={DEVELOPER_CONSOLE_DIALOG_DESCRIPTION}
      panelClassName="max-w-lg"
      zIndexClassName="z-30"
    >
      <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
        <label
          htmlFor={DEVELOPER_CONSOLE_NAME_INPUT_ID}
          className="block text-sm font-semibold text-neutral-900 dark:text-neutral-200"
        >
          Player name
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
              Score
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
              Streak
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
              Difficulty
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
              <option value="easy">Easy</option>
              <option value="normal">Normal</option>
              <option value="hard">Hard</option>
              <option value="insane">Insane</option>
            </select>
          </div>
          <div>
            <label
              htmlFor={DEVELOPER_CONSOLE_KEYBOARD_INPUT_ID}
              className="block text-sm font-semibold text-neutral-900 dark:text-neutral-200"
            >
              Keyboard mode
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
              <option value="onscreen">On-screen keyboard</option>
              <option value="native">Device keyboard (mobile)</option>
            </select>
          </div>
        </div>

        <div className="rounded-md border border-neutral-300 bg-neutral-50 p-3 dark:border-neutral-700 dark:bg-neutral-900">
          <p className="text-xs text-neutral-700 dark:text-neutral-300">
            Recompute checksum from current Convex words and patch existing
            words metadata.
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
                ? "Refreshing..."
                : DEVELOPER_CONSOLE_REFRESH_CHECKSUM_ACTION_LABEL}
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
            {DEVELOPER_CONSOLE_SUBMIT_ACTION_LABEL}
          </Button>
          <Button
            onClick={() => closeWithAction(onClose)}
            variant="outline"
            disabled={isClosing}
          >
            {DEVELOPER_CONSOLE_CANCEL_ACTION_LABEL}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};

export default DeveloperConsoleDialog;
