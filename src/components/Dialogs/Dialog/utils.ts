import { cn } from "@utils/cn";

export const joinClassNames = (
  ...classNames: Array<string | undefined>
): string => {
  return cn(...classNames);
};
