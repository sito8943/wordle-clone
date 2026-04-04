import type { Player } from "@domain/wordle";
import type { usePlayController } from "@views/Play/hooks/usePlayController";

type PlayControllerState = ReturnType<typeof usePlayController>;

export type DeveloperConsoleDialogProps = {
  visible: boolean;
  onClose: () => void;
  developerConsoleEnabled: boolean;
  answer: string;
  player: Player;
  showResumeDialog: boolean;
  submitDeveloperPlayer: PlayControllerState["submitDeveloperPlayer"];
  refreshRemoteDictionaryChecksum: PlayControllerState["refreshRemoteDictionaryChecksum"];
  isRefreshingDictionaryChecksum: boolean;
  dictionaryChecksumMessage: string | null;
  dictionaryChecksumMessageKind: "success" | "error" | null;
};
