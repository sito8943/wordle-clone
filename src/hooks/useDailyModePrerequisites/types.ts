export type DailyModePrerequisitesStatus = "loading" | "ready" | "unavailable";

export type UseDailyModePrerequisitesResult = {
  status: DailyModePrerequisitesStatus;
  isLoading: boolean;
  isReady: boolean;
  isUnavailable: boolean;
  dailyWord: string | null;
  dailyMeaning: string | null;
  reload: () => void;
};
