import type { Player } from "@domain/wordle";
import type { useHomeController } from "@views/Home/hooks/useHomeController";

type HomeControllerState = ReturnType<typeof useHomeController>;

export type DeveloperConsoleDialogProps = {
  visible: boolean;
  onClose: () => void;
  developerConsoleEnabled: boolean;
  player: Player;
  showResumeDialog: boolean;
  submitDeveloperPlayer: HomeControllerState["submitDeveloperPlayer"];
  refreshRemoteDictionaryChecksum:
    HomeControllerState["refreshRemoteDictionaryChecksum"];
  isRefreshingDictionaryChecksum: boolean;
  dictionaryChecksumMessage: string | null;
  dictionaryChecksumMessageKind: "success" | "error" | null;
};
