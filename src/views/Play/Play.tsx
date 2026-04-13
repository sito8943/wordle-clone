import type { JSX } from "react";
import { env } from "@config";
import { PlayViewProvider } from "./providers";
import { PlayOfflineState } from "./sections/Offline";
import { PlayContent } from "./sections/PlayContent";

const Play = (): JSX.Element => {
  if (env.playOfflineStateEnabled) {
    return <PlayOfflineState />;
  }

  return (
    <PlayViewProvider>
      <PlayContent />
    </PlayViewProvider>
  );
};

export default Play;
