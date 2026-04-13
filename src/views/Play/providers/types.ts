import type {
  RemoteChallengeProgress,
  RemoteChallenges,
} from "@api/challenges";
import type { Player } from "@domain/wordle";
import type { ReactNode } from "react";
import type { usePlayController } from "../hooks";

export type ChallengesState = {
  challenges: RemoteChallenges | null;
  progress: RemoteChallengeProgress[];
  weeklyProgress: RemoteChallengeProgress[];
  loading: boolean;
  showDialog: boolean;
  millisUntilEndOfDay: number;
  millisUntilEndOfWeek: number;
  openDialog: () => void;
  closeDialog: () => void;
  refreshProgress: () => Promise<void>;
};

export type PlayViewContextValue = {
  controller: PlayControllerState;
  player: Player;
  wordListButtonEnabled: boolean;
  developerConsoleEnabled: boolean;
  challengesEnabled: boolean;
  preferNativeKeyboard: boolean;
  animateTileEntry: boolean;
  challenges: ChallengesState;
};

export type PlayViewProviderProps = {
  children: ReactNode;
};

export type PlayControllerState = ReturnType<typeof usePlayController>;
