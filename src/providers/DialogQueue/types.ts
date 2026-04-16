import type { ReactNode } from "react";

export type DialogQueueContextType = {
  activeDialogId: string | null;
  enqueueDialog: (dialogId: string) => void;
  removeDialog: (dialogId: string) => void;
};

export type DialogQueueProviderProps = {
  children: ReactNode;
};
