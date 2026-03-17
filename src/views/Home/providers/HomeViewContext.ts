import { createContext } from "react";
import type { HomeViewContextValue } from "./types";

const HomeViewContext = createContext<HomeViewContextValue | null>(null);

export { HomeViewContext };
