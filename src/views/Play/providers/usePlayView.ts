import { useContext } from "react";
import { PlayViewContext } from "./PlayViewContext";
import type { PlayViewContextValue } from "./types";

const usePlayView = (): PlayViewContextValue => {
  const value = useContext(PlayViewContext);

  if (!value) {
    throw new Error("usePlayView must be used within PlayViewProvider.");
  }

  return value;
};

export { usePlayView };
