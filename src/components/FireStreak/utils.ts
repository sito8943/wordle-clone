export const sanitizeCounter = (value: number): number => {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, Math.floor(value));
};
