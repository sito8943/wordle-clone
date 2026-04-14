export const formatScoreSummaryValue = (key: string, value: number): string => {
  if (key === "difficulty" || key === "streak") {
    return `x${Number.isInteger(value) ? value : value.toFixed(2)}`;
  }

  return `+${Number.isInteger(value) ? value : value.toFixed(1)}`;
};
