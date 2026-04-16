import { useCallback, useMemo, useRef, useState } from "react";
import { DialogQueueContext } from "./DialogQueueContext";
import { DEFAULT_DIALOG_QUEUE_PRIORITY } from "./constants";
import type { DialogQueueItem, DialogQueueProviderProps } from "./types";

const compareDialogQueueItems = (
  leftItem: DialogQueueItem,
  rightItem: DialogQueueItem,
): number => {
  if (leftItem.priority !== rightItem.priority) {
    return rightItem.priority - leftItem.priority;
  }

  return leftItem.insertionOrder - rightItem.insertionOrder;
};

const DialogQueueProvider = ({ children }: DialogQueueProviderProps) => {
  const [dialogQueue, setDialogQueue] = useState<DialogQueueItem[]>([]);
  const insertionOrderRef = useRef(0);

  const enqueueDialog = useCallback((dialogId: string, priority?: number) => {
    if (dialogId.length === 0) {
      return;
    }

    const nextPriority = priority ?? DEFAULT_DIALOG_QUEUE_PRIORITY;

    setDialogQueue((currentQueue) => {
      const existingItemIndex = currentQueue.findIndex(
        (item) => item.dialogId === dialogId,
      );

      if (existingItemIndex >= 0) {
        const existingItem = currentQueue[existingItemIndex];
        if (existingItem.priority === nextPriority) {
          return currentQueue;
        }

        const nextQueue = [...currentQueue];
        nextQueue[existingItemIndex] = {
          ...existingItem,
          priority: nextPriority,
        };
        return nextQueue.sort(compareDialogQueueItems);
      }

      const nextItem: DialogQueueItem = {
        dialogId,
        priority: nextPriority,
        insertionOrder: insertionOrderRef.current,
      };
      insertionOrderRef.current += 1;

      return [...currentQueue, nextItem].sort(compareDialogQueueItems);
    });
  }, []);

  const removeDialog = useCallback((dialogId: string) => {
    setDialogQueue((currentQueue) => {
      if (!currentQueue.some((item) => item.dialogId === dialogId)) {
        return currentQueue;
      }

      return currentQueue.filter(
        (queuedDialogItem) => queuedDialogItem.dialogId !== dialogId,
      );
    });
  }, []);

  const activeDialogId = dialogQueue[0]?.dialogId ?? null;

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
