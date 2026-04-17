import type { JSX } from "react";
import { env } from "@config";
import {
  isWordleModeEnabled,
  resolveWordleModeId,
  type WordleModeId,
} from "@domain/wordle";
import { PlayViewProvider } from "./providers";
import { PlayOfflineState } from "./sections/Offline";
import { PlayContent } from "./sections/PlayContent";
import ModeGatePlaceholder from "./components/ModeGatePlaceholder";

type PlayProps = {
  modeId?: WordleModeId;
};

const Play = ({ modeId }: PlayProps): JSX.Element => {
  if (env.playOfflineStateEnabled) {
    return <PlayOfflineState />;
  }

  const resolvedModeId = resolveWordleModeId(modeId);
  if (!isWordleModeEnabled(resolvedModeId)) {
    return <ModeGatePlaceholder modeId={resolvedModeId} />;
  }

  return (
    <PlayViewProvider modeId={resolvedModeId}>
      <PlayContent />
    </PlayViewProvider>
  );
};

export default Play;
