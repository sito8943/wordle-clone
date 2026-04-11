import type {
  RemoteChallengeProgress,
  RemoteDailyChallenges,
} from "@api/challenges";
import type { Player } from "@domain/wordle";
import type { ReactNode } from "react";
import type { usePlayController } from "../hooks";

export type DailyChallengesState = {
  challenges: RemoteDailyChallenges | null;
  progress: RemoteChallengeProgress[];
  loading: boolean;
  showDialog: boolean;
  millisUntilEndOfDay: number;
  openDialog: () => void;
  closeDialog: () => void;
  refreshProgress: () => Promise<void>;
};

export type PlayViewContextValue = {
  controller: PlayControllerState;
  player: Player;
  wordListButtonEnabled: boolean;
  developerConsoleEnabled: boolean;
  dailyChallengesEnabled: boolean;
  preferNativeKeyboard: boolean;
  animateTileEntry: boolean;
  dailyChallenges: DailyChallengesState;
};

export type PlayViewProviderProps = {
  children: ReactNode;
};

export type PlayControllerState = ReturnType<typeof usePlayController>;
