import type { ReactNode } from "react";

export type DialogQueueContextType = {
  activeDialogId: string | null;
  enqueueDialog: (dialogId: string, priority?: number) => void;
  removeDialog: (dialogId: string) => void;
};

export type DialogQueueProviderProps = {
  children: ReactNode;
};

export type DialogQueueItem = {
  dialogId: string;
  priority: number;
  insertionOrder: number;
};
