import { matchPath } from "react-router";
import type { Tracker } from "@sito/feature-usage";
import { ROUTES } from "@config/routes";
import { NON_FEATURE_ROUTE_KEYS, WORDLE_FEATURES } from "./constants";
import type { PageRouter, WordleFeature } from "./types";

const catalogue: ReadonlySet<string> = new Set(WORDLE_FEATURES);

/** `NOT_FOUND` → `page.not_found`. */
export const toPageFeature = (routeKey: string): string =>
  `page.${routeKey.toLowerCase()}`;

export const isWordleFeature = (feature: string): feature is WordleFeature =>
  catalogue.has(feature);

/** The page feature of a pathname (without the basename), or null when it is not a screen. */
export const pageFeatureOf = (pathname: string): WordleFeature | null => {
  for (const [key, path] of Object.entries(ROUTES)) {
    if ((NON_FEATURE_ROUTE_KEYS as readonly string[]).includes(key)) {
      continue;
    }
    if (!matchPath({ path, end: true }, pathname)) {
      continue;
    }
    const feature = toPageFeature(key);
    return isWordleFeature(feature) ? feature : null;
  }
  return null;
};

/**
 * Counts one use of the screen on view now and on each navigation to another
 * one, straight from the data router (no component inside the layout).
 * Returns the unsubscribe.
 */
export const trackRouterPages = (
  router: PageRouter,
  tracker: Tracker<WordleFeature>,
): (() => void) => {
  let last: WordleFeature | null = null;
  const trackPage = (pathname: string) => {
    const feature = pageFeatureOf(pathname);
    if (!feature || feature === last) {
      return;
    }
    last = feature;
    tracker.track(feature);
  };
  trackPage(router.state.location.pathname);
  return router.subscribe((state) => trackPage(state.location.pathname));
};
