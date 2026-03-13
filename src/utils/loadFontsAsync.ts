const FONT_CACHE_WARMED_KEY = "wordle:fonts:cache-warmed:v1";

let fontLoadPromise: Promise<void> | null = null;

type FontRegistration = {
  family: string;
  fontUrl: string;
  descriptors?: FontFaceDescriptors;
};

const hasWarmedCache = (): boolean => {
  try {
    return window.localStorage.getItem(FONT_CACHE_WARMED_KEY) === "1";
  } catch {
    return false;
  }
};

const markCacheAsWarmed = (): void => {
  try {
    window.localStorage.setItem(FONT_CACHE_WARMED_KEY, "1");
  } catch {
    // Ignore storage issues and keep runtime stable.
  }
};

const warmFontCache = async (fontUrls: readonly string[]): Promise<void> => {
  if (hasWarmedCache()) {
    return;
  }

  await Promise.allSettled(
    fontUrls.map(async (fontUrl) => {
      await fetch(fontUrl, { cache: "force-cache" });
    }),
  );
  markCacheAsWarmed();
};

const canRegisterFontFace = (): boolean => {
  return (
    typeof window !== "undefined" && "FontFace" in window && "fonts" in document
  );
};

const registerFontFace = async ({
  family,
  fontUrl,
  descriptors,
}: FontRegistration): Promise<void> => {
  if (!canRegisterFontFace()) {
    return;
  }

  const fontFace = new FontFace(
    family,
    `url(${fontUrl}) format("woff2")`,
    descriptors,
  );
  const loadedFontFace = await fontFace.load();
  document.fonts.add(loadedFontFace);
};

export const loadFontsAsync = (): Promise<void> => {
  if (fontLoadPromise) {
    return fontLoadPromise;
  }

  fontLoadPromise = (async () => {
    const [robotoFont, robotoSlabFont] = await Promise.all([
      import("@fontsource-variable/roboto/files/roboto-latin-wght-normal.woff2"),
      import("@fontsource-variable/roboto-slab/files/roboto-slab-latin-wght-normal.woff2"),
    ]);

    const fontUrls = [robotoFont.default, robotoSlabFont.default] as const;
    await warmFontCache(fontUrls);
    await Promise.allSettled([
      registerFontFace({
        family: "Roboto Variable",
        fontUrl: robotoFont.default,
        descriptors: { style: "normal", weight: "100 900" },
      }),
      registerFontFace({
        family: "Roboto Slab Variable",
        fontUrl: robotoSlabFont.default,
        descriptors: { style: "normal", weight: "100 900" },
      }),
    ]);
  })().catch(() => undefined);

  return fontLoadPromise;
};
