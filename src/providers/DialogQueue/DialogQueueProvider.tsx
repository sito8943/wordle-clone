import { useCallback, useMemo, useState } from "react";
import { DialogQueueContext } from "./DialogQueueContext";
import type { DialogQueueProviderProps } from "./types";

const DialogQueueProvider = ({ children }: DialogQueueProviderProps) => {
  const [dialogQueue, setDialogQueue] = useState<string[]>([]);

  const enqueueDialog = useCallback((dialogId: string) => {
    if (dialogId.length === 0) {
      return;
    }

    setDialogQueue((currentQueue) => {
      if (currentQueue.includes(dialogId)) {
        return currentQueue;
      }

      return [...currentQueue, dialogId];
    });
  }, []);

  const removeDialog = useCallback((dialogId: string) => {
    setDialogQueue((currentQueue) => {
      if (!currentQueue.includes(dialogId)) {
        return currentQueue;
      }

      return currentQueue.filter(
        (queuedDialogId) => queuedDialogId !== dialogId,
      );
    });
  }, []);

  const activeDialogId = dialogQueue[0] ?? null;

  const contextValue = useMemo(
    () => ({
      activeDialogId,
      enqueueDialog,
      removeDialog,
    }),
    [activeDialogId, enqueueDialog, removeDialog],
  );

  return (
    <DialogQueueContext.Provider value={contextValue}>
      {children}
    </DialogQueueContext.Provider>
  );
};

export { DialogQueueProvider };
