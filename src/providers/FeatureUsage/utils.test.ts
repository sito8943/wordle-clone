import { describe, expect, it } from "vitest";
import { isValidFeature, noopTracker } from "@sito/feature-usage";
import { ROUTES } from "@config/routes";
import { NON_FEATURE_ROUTE_KEYS, WORDLE_FEATURES } from "./constants";
import type { PageRouter, WordleFeature } from "./types";
import { pageFeatureOf, toPageFeature, trackRouterPages } from "./utils";

describe("wordle feature usage catalogue", () => {
  it("lists only valid, unique names the service accepts", () => {
    expect(WORDLE_FEATURES.every((feature) => isValidFeature(feature))).toBe(
      true,
    );
    expect(new Set(WORDLE_FEATURES).size).toBe(WORDLE_FEATURES.length);
  });

  it("has a page feature for every screen route", () => {
    const pages = Object.keys(ROUTES)
      .filter(
        (key) => !(NON_FEATURE_ROUTE_KEYS as readonly string[]).includes(key),
      )
      .map(toPageFeature);
    expect(new Set(pages)).toEqual(new Set(WORDLE_FEATURES));
    expect(pages).toHaveLength(WORDLE_FEATURES.length);
  });
});

describe("pageFeatureOf", () => {
  it.each([
    ["/", "page.home"],
    [ROUTES.PLAY, "page.play"],
    [ROUTES.CLASSIC, "page.classic"],
    [ROUTES.DAILY, "page.daily"],
    [ROUTES.LIGHTING, "page.lighting"],
    ["/changelog/0.0.23", "page.changelog"],
    [ROUTES.SETTINGS, "page.settings"],
  ])("%s → %s", (pathname, feature) => {
    expect(pageFeatureOf(pathname)).toBe(feature);
  });

  it("ignores unknown paths", () => {
    expect(pageFeatureOf("/nope")).toBeNull();
  });
});

describe("trackRouterPages", () => {
  it("counts the screen on view and each move to another one, once", () => {
    let listener: (state: { location: { pathname: string } }) => void = () =>
      undefined;
    const router: PageRouter = {
      state: { location: { pathname: "/" } },
      subscribe: (next) => {
        listener = next;
        return () => {
          listener = () => undefined;
        };
      },
    };
    const tracked: WordleFeature[] = [];
    const tracker = {
      ...noopTracker<WordleFeature>(),
      track: (feature: WordleFeature) => void tracked.push(feature),
    };

    const unsubscribe = trackRouterPages(router, tracker);
    listener({ location: { pathname: ROUTES.HELP } });
    listener({ location: { pathname: ROUTES.HELP } });
    listener({ location: { pathname: "/nope" } });
    unsubscribe();
    listener({ location: { pathname: ROUTES.ZEN } });

    expect(tracked).toEqual(["page.home", "page.help"]);
  });
});
