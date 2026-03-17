export const joinClassNames = (
  ...classNames: Array<string | undefined>
): string => {
  return classNames.filter(Boolean).join(" ");
};
