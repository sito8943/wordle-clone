export const clamp = (
  value: number,
  minValue: number,
  maxValue: number,
): number => Math.min(maxValue, Math.max(minValue, value));
