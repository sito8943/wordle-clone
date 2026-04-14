export const hasResetKeysChanged = (
  previous: ReadonlyArray<unknown> = [],
  next: ReadonlyArray<unknown> = [],
): boolean =>
  previous.length !== next.length ||
  previous.some((value, index) => !Object.is(value, next[index]));

export const reloadPage = (): void => {
  window.location.reload();
};
