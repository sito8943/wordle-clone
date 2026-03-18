import { createContext } from "react";
import type { ProfileViewContextValue } from "./types";

const ProfileViewContext = createContext<ProfileViewContextValue | null>(null);

export { ProfileViewContext };
