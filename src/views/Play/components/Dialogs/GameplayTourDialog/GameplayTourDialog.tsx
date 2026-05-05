import { Button } from "@components";
import { useTranslation } from "@i18n";
import {
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type JSX,
} from "react";
import { createPortal } from "react-dom";
import type { GameplayTourDialogProps } from "./types";

const HIGHLIGHT_BOX_SHADOW = "0 0 0 9999px rgba(0, 0, 0, 0.62)";
const HIGHLIGHT_BORDER_COLOR = "rgba(59, 130, 246, 0.9)";
const HIGHLIGHT_PADDING_PX = 10;
const HIGHLIGHT_VIEWPORT_MARGIN_PX = 8;
const TOUR_DIALOG_VIEWPORT_MARGIN_PX = 16;
const GAMEPLAY_TOUR_DIALOG_TITLE_ID = "play-gameplay-tour-dialog-title";

const clamp = (value: number, minValue: number, maxValue: number): number =>
  Math.min(maxValue, Math.max(minValue, value));

const resolveHighlightStyle = (targetRect: DOMRect | null): CSSProperties | null => {
  if (!targetRect || typeof window === "undefined") {
    return null;
  }

  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  const left = clamp(
    targetRect.left - HIGHLIGHT_PADDING_PX,
    HIGHLIGHT_VIEWPORT_MARGIN_PX,
    Math.max(HIGHLIGHT_VIEWPORT_MARGIN_PX, viewportWidth - HIGHLIGHT_VIEWPORT_MARGIN_PX),
  );
  const top = clamp(
    targetRect.top - HIGHLIGHT_PADDING_PX,
    HIGHLIGHT_VIEWPORT_MARGIN_PX,
    Math.max(HIGHLIGHT_VIEWPORT_MARGIN_PX, viewportHeight - HIGHLIGHT_VIEWPORT_MARGIN_PX),
  );
  const right = clamp(
    targetRect.right + HIGHLIGHT_PADDING_PX,
    HIGHLIGHT_VIEWPORT_MARGIN_PX,
    Math.max(HIGHLIGHT_VIEWPORT_MARGIN_PX, viewportWidth - HIGHLIGHT_VIEWPORT_MARGIN_PX),
  );
  const bottom = clamp(
    targetRect.bottom + HIGHLIGHT_PADDING_PX,
    HIGHLIGHT_VIEWPORT_MARGIN_PX,
    Math.max(HIGHLIGHT_VIEWPORT_MARGIN_PX, viewportHeight - HIGHLIGHT_VIEWPORT_MARGIN_PX),
  );

  return {
    left,
    top,
    width: Math.max(0, right - left),
    height: Math.max(0, bottom - top),
    boxShadow: HIGHLIGHT_BOX_SHADOW,
    borderColor: HIGHLIGHT_BORDER_COLOR,
  };
};

const resolveTargetRect = (selector: string | null): DOMRect | null => {
  if (!selector || typeof document === "undefined") {
    return null;
  }

  const targetElement = document.querySelector<HTMLElement>(selector);
  if (!targetElement) {
    return null;
  }

  const style = window.getComputedStyle(targetElement);
  if (style.display === "none" || style.visibility === "hidden") {
    return null;
  }

  const targetRect = targetElement.getBoundingClientRect();
  if (targetRect.width <= 0 || targetRect.height <= 0) {
    return null;
  }

  return targetRect;
};

const GameplayTourDialog = ({
  visible,
  steps,
  stepIndex,
  canGoPrevious,
  onClose,
  onNextStep,
  onPreviousStep,
  onOpenHelp,
}: GameplayTourDialogProps): JSX.Element | null => {
  const { t } = useTranslation();
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const activeStep = steps[stepIndex] ?? null;

  useEffect(() => {
    if (!visible || !activeStep) {
      setTargetRect(null);
      return;
    }

    const updateRect = () => {
      setTargetRect(resolveTargetRect(activeStep.selector));
    };

    updateRect();
    const frameId = window.requestAnimationFrame(updateRect);
    window.addEventListener("resize", updateRect);
    window.addEventListener("scroll", updateRect, true);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect, true);
    };
  }, [activeStep, visible]);

  useEffect(() => {
    if (!visible) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose, visible]);

  const highlightStyle = useMemo(
    () => resolveHighlightStyle(targetRect),
    [targetRect],
  );

  if (!visible || !activeStep || typeof document === "undefined") {
    return null;
  }

  const showDialogAboveKeyboard = activeStep.id === "keyboard";
  const isLastStep = stepIndex >= steps.length - 1;

  const advanceStep = () => {
    if (isLastStep) {
      onClose();
      return;
    }

    onNextStep();
  };

  return createPortal(
    <div className="fixed inset-0 z-30" aria-live="polite">
      {highlightStyle ? (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed rounded-xl border-2 transition-all duration-150"
          style={highlightStyle}
        />
      ) : (
        <div
          aria-hidden="true"
          className="fixed inset-0 bg-black/62 backdrop-blur-[2px]"
        />
      )}

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={GAMEPLAY_TOUR_DIALOG_TITLE_ID}
        className={`fixed inset-x-0 z-40 mx-auto w-[min(92vw,36rem)] rounded-2xl border border-neutral-300 bg-white p-5 shadow-2xl dark:border-neutral-700 dark:bg-neutral-900 ${
          showDialogAboveKeyboard ? "top-4 bottom-auto" : "bottom-0 mb-4"
        }`}
        style={{
          top: showDialogAboveKeyboard
            ? `calc(env(safe-area-inset-top) + ${TOUR_DIALOG_VIEWPORT_MARGIN_PX}px)`
            : undefined,
        }}
      >
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">
          {t("play.gameplayTour.progress", {
            current: stepIndex + 1,
            total: steps.length,
          })}
        </p>
        <h2 id={GAMEPLAY_TOUR_DIALOG_TITLE_ID} className="dialog-title mt-1">
          {t(activeStep.titleKey)}
        </h2>
        <p className="dialog-description">{t(activeStep.descriptionKey)}</p>
        {!highlightStyle ? (
          <p className="mt-2 text-xs text-neutral-600 dark:text-neutral-300">
            {t("play.gameplayTour.fallbackNotice")}
          </p>
        ) : null}

        <div className="mt-4 flex flex-wrap justify-end gap-2">
          <Button onClick={onOpenHelp} variant="ghost" color="secondary">
            {t("play.gameplayTour.actions.help")}
          </Button>
          <Button onClick={onClose} variant="outline" color="neutral">
            {t("play.gameplayTour.actions.skip")}
          </Button>
          {canGoPrevious ? (
            <Button onClick={onPreviousStep} variant="outline" color="primary">
              {t("play.gameplayTour.actions.back")}
            </Button>
          ) : null}
          <Button onClick={advanceStep}>
            {t(
              isLastStep
                ? "play.gameplayTour.actions.finish"
                : "play.gameplayTour.actions.next",
            )}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default GameplayTourDialog;
