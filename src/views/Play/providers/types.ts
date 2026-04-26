import type {
  RemoteChallengeProgress,
  RemoteChallenges,
} from "@api/challenges";
import type { Player, WordleModeId } from "@domain/wordle";
import type { ReactNode } from "react";
import type { usePlayController } from "../hooks";

export type ChallengesState = {
  challenges: RemoteChallenges | null;
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
  challengesEnabled: boolean;
  preferNativeKeyboard: boolean;
  animateTileEntry: boolean;
  challenges: ChallengesState;
};

export type PlayViewProviderProps = {
  children: ReactNode;
  modeId?: WordleModeId;
  allowSubmitWhenModalOpen?: boolean;
};

export type PlayControllerState = ReturnType<typeof usePlayController>;
