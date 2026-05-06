import { WORDLE_MODE_IDS } from "@domain/wordle";
import type { GameplayTourStepMap } from "./types";

export const TOUR_TARGET_SELECTORS = {
  BOARD: "#board",
  KEYBOARD: '[data-tour="keyboard"]',
  STREAK_BADGE: '[data-tour="streak-badge"]',
  HINT_BUTTON: '[data-tour="hint-button"]',
  CHALLENGES_BUTTON: '[data-tour="challenges-button"]',
  REFRESH_BUTTON: '[data-wordle-refresh="true"]',
  HARD_MODE_TIMER: '[data-tour="hard-mode-timer"]',
  DAILY_MEANING_BUTTON: '[data-tour="daily-meaning-button"]',
} as const;

export const GAMEPLAY_TOUR_STEPS_BY_MODE: GameplayTourStepMap = {
  [WORDLE_MODE_IDS.CLASSIC]: [
    {
      id: "board",
      selector: TOUR_TARGET_SELECTORS.BOARD,
      titleKey: "play.gameplayTour.steps.board.title",
      descriptionKey: "play.gameplayTour.steps.board.description",
    },
    {
      id: "keyboard",
      selector: TOUR_TARGET_SELECTORS.KEYBOARD,
      titleKey: "play.gameplayTour.steps.keyboard.title",
      descriptionKey: "play.gameplayTour.steps.keyboard.description",
    },
    {
      id: "streak",
      selector: TOUR_TARGET_SELECTORS.STREAK_BADGE,
      titleKey: "play.gameplayTour.steps.streak.title",
      descriptionKey: "play.gameplayTour.steps.streak.description",
    },
    {
      id: "hint",
      selector: TOUR_TARGET_SELECTORS.HINT_BUTTON,
      titleKey: "play.gameplayTour.steps.hint.title",
      descriptionKey: "play.gameplayTour.steps.hint.description",
    },
    {
      id: "challenges",
      selector: TOUR_TARGET_SELECTORS.CHALLENGES_BUTTON,
      titleKey: "play.gameplayTour.steps.challenges.title",
      descriptionKey: "play.gameplayTour.steps.challenges.description",
    },
    {
      id: "refresh",
      selector: TOUR_TARGET_SELECTORS.REFRESH_BUTTON,
      titleKey: "play.gameplayTour.steps.refresh.title",
      descriptionKey: "play.gameplayTour.steps.refresh.description",
    },
  ],
  [WORDLE_MODE_IDS.LIGHTNING]: [
    {
      id: "board",
      selector: TOUR_TARGET_SELECTORS.BOARD,
      titleKey: "play.gameplayTour.steps.board.title",
      descriptionKey: "play.gameplayTour.steps.board.description",
    },
    {
      id: "keyboard",
      selector: TOUR_TARGET_SELECTORS.KEYBOARD,
      titleKey: "play.gameplayTour.steps.keyboard.title",
      descriptionKey: "play.gameplayTour.steps.keyboard.description",
    },
    {
      id: "streak",
      selector: TOUR_TARGET_SELECTORS.STREAK_BADGE,
      titleKey: "play.gameplayTour.steps.streak.title",
      descriptionKey: "play.gameplayTour.steps.streak.description",
    },
    {
      id: "hint",
      selector: TOUR_TARGET_SELECTORS.HINT_BUTTON,
      titleKey: "play.gameplayTour.steps.hint.title",
      descriptionKey: "play.gameplayTour.steps.hint.description",
    },
    {
      id: "timer",
      selector: TOUR_TARGET_SELECTORS.HARD_MODE_TIMER,
      titleKey: "play.gameplayTour.steps.timer.title",
      descriptionKey: "play.gameplayTour.steps.timer.description",
    },
    {
      id: "refresh",
      selector: TOUR_TARGET_SELECTORS.REFRESH_BUTTON,
      titleKey: "play.gameplayTour.steps.refresh.title",
      descriptionKey: "play.gameplayTour.steps.refresh.description",
    },
  ],
  [WORDLE_MODE_IDS.ZEN]: [
    {
      id: "board",
      selector: TOUR_TARGET_SELECTORS.BOARD,
      titleKey: "play.gameplayTour.steps.board.title",
      descriptionKey: "play.gameplayTour.steps.board.description",
    },
    {
      id: "keyboard",
      selector: TOUR_TARGET_SELECTORS.KEYBOARD,
      titleKey: "play.gameplayTour.steps.keyboard.title",
      descriptionKey: "play.gameplayTour.steps.keyboard.description",
    },
    {
      id: "hint",
      selector: TOUR_TARGET_SELECTORS.HINT_BUTTON,
      titleKey: "play.gameplayTour.steps.hint.title",
      descriptionKey: "play.gameplayTour.steps.hint.description",
    },
  ],
  [WORDLE_MODE_IDS.DAILY]: [
    {
      id: "board",
      selector: TOUR_TARGET_SELECTORS.BOARD,
      titleKey: "play.gameplayTour.steps.board.title",
      descriptionKey: "play.gameplayTour.steps.board.description",
    },
    {
      id: "keyboard",
      selector: TOUR_TARGET_SELECTORS.KEYBOARD,
      titleKey: "play.gameplayTour.steps.keyboard.title",
      descriptionKey: "play.gameplayTour.steps.keyboard.description",
    },
    {
      id: "hint",
      selector: TOUR_TARGET_SELECTORS.HINT_BUTTON,
      titleKey: "play.gameplayTour.steps.hint.title",
      descriptionKey: "play.gameplayTour.steps.hint.description",
    },
    {
      id: "daily-meaning",
      selector: TOUR_TARGET_SELECTORS.DAILY_MEANING_BUTTON,
      titleKey: "play.gameplayTour.steps.dailyMeaning.title",
      descriptionKey: "play.gameplayTour.steps.dailyMeaning.description",
    },
  ],
};
