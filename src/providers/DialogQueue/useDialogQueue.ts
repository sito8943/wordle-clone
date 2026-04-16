import { useContext } from "react";
import { DialogQueueContext } from "./DialogQueueContext";
import type { DialogQueueContextType } from "./types";

const useDialogQueue = (): DialogQueueContextType => {
  const context = useContext(DialogQueueContext);

  if (context === undefined) {
    throw new Error("useDialogQueue must be used within a DialogQueueProvider");
  }

  return context;
};

export { useDialogQueue };
