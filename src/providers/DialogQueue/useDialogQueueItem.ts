import { useEffect } from "react";
import { useDialogQueue } from "./useDialogQueue";

const useDialogQueueItem = (dialogId: string, enabled: boolean): boolean => {
  const { activeDialogId, enqueueDialog, removeDialog } = useDialogQueue();

  useEffect(() => {
    if (enabled) {
      enqueueDialog(dialogId);

      return () => {
        removeDialog(dialogId);
      };
    }

    removeDialog(dialogId);
  }, [dialogId, enabled, enqueueDialog, removeDialog]);

  return enabled && activeDialogId === dialogId;
};

export { useDialogQueueItem };
