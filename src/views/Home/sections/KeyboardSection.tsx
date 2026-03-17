import type { JSX } from "react";
import { ErrorBoundary, ErrorFallback } from "@components";
import { Keyboard } from "../components";
import { useHomeView } from "../providers/";
import { useNativeKeyboardInput } from "../hooks";

const KeyboardSection = (): JSX.Element => {
  const { controller, preferNativeKeyboard } = useHomeView();
  const {
    guesses,
    current,
    handleKey,
    gameOver,
    won,
    keyboardEntryAnimationEnabled,
    showResumeDialog,
  } = controller;

  const nativeKeyboardBlocked = showResumeDialog || gameOver;
  const {
    nativeKeyboardInputRef,
    focusNativeKeyboardInput,
    handleNativeKeyboardKeyDown,
    handleNativeKeyboardInput,
  } = useNativeKeyboardInput({
    enabled: preferNativeKeyboard,
    blocked: nativeKeyboardBlocked,
    onKey: handleKey,
  });

  return (
    <ErrorBoundary
      name="home-keyboard"
      resetKeys={[guesses.length, current, gameOver, won]}
      fallback={({ reset }) => (
        <div className="px-2 pb-2">
          <ErrorFallback
            title="The keyboard is unavailable."
            description="Retry to re-enable key input."
            actionLabel="Retry keyboard"
            onAction={reset}
          />
        </div>
      )}
    >
      {!preferNativeKeyboard ? (
        <Keyboard
          guesses={guesses}
          onKey={handleKey}
          isLoss={gameOver && !won}
          animateEntry={keyboardEntryAnimationEnabled}
        />
      ) : (
        <>
          <input
            ref={nativeKeyboardInputRef}
            type="text"
            inputMode="text"
            autoCapitalize="characters"
            autoCorrect="off"
            autoComplete="off"
            spellCheck={false}
            enterKeyHint="enter"
            aria-label="Device keyboard input"
            className="fixed bottom-0 left-0 h-px w-px opacity-0 pointer-events-none"
            onKeyDown={handleNativeKeyboardKeyDown}
            onInput={handleNativeKeyboardInput}
          />
          <div aria-hidden="true" className="h-16 sm:hidden" />
          <div className="fixed inset-x-0 bottom-0 z-10 border-t border-neutral-300 bg-neutral-100/95 px-3 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-2 backdrop-blur-sm dark:border-neutral-700 dark:bg-neutral-900/95 sm:hidden">
            <button
              type="button"
              onClick={focusNativeKeyboardInput}
              disabled={nativeKeyboardBlocked}
              className="w-full rounded-md border border-neutral-400 bg-white px-3 py-2 text-sm font-semibold text-neutral-900 disabled:opacity-60 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100"
            >
              Open device keyboard
            </button>
          </div>
          <div className="hidden sm:block">
            <Keyboard
              guesses={guesses}
              onKey={handleKey}
              isLoss={gameOver && !won}
              animateEntry={keyboardEntryAnimationEnabled}
            />
          </div>
        </>
      )}
    </ErrorBoundary>
  );
};

export default KeyboardSection;
