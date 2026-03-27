import { createContext } from "react";
import type { PlayViewContextValue } from "./types";

const PlayViewContext = createContext<PlayViewContextValue | null>(null);

export { PlayViewContext };
