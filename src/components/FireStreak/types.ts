export type FireProps = {
  streak: number;
  size?: number;
  className?: string;
};

export type FireStreakProps = {
  streak: number;
  size?: "sm" | "md";
  className?: string;
  noLabel?: boolean;
};
