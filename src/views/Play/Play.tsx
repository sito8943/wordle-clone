import { useEffect, type JSX } from "react";
import { env } from "@config";
import {
  isWordleModeEnabled,
  persistCurrentWordleModeId,
  resolveWordleModeId,
  WORDLE_MODE_IDS,
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
  const resolvedModeId = resolveWordleModeId(modeId);
  const lightningGated =
    resolvedModeId === WORDLE_MODE_IDS.LIGHTNING && !env.lightningModeEnabled;
  const blockedMode = !isWordleModeEnabled(resolvedModeId) || lightningGated;

  useEffect(() => {
    if (blockedMode) {
      return;
    }

    persistCurrentWordleModeId(resolvedModeId);
  }, [blockedMode, resolvedModeId]);

  if (env.playOfflineStateEnabled) {
    return <PlayOfflineState />;
  }

  if (blockedMode) {
    return <ModeGatePlaceholder modeId={resolvedModeId} />;
  }

  return (
    <PlayViewProvider modeId={resolvedModeId}>
      <PlayContent />
    </PlayViewProvider>
  );
};

export default Play;
