import { useContext } from "react";
import { HomeViewContext } from "./HomeViewContext";
import type { HomeViewContextValue } from "./types";

const useHomeView = (): HomeViewContextValue => {
  const value = useContext(HomeViewContext);

  if (!value) {
    throw new Error("useHomeView must be used within HomeViewProvider.");
  }

  return value;
};

export { useHomeView };
