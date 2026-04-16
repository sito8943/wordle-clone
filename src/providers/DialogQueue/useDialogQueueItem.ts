import { useEffect } from "react";
import { DEFAULT_DIALOG_QUEUE_PRIORITY } from "./constants";
import { useDialogQueue } from "./useDialogQueue";

const useDialogQueueItem = (
  dialogId: string,
  enabled: boolean,
  priority = DEFAULT_DIALOG_QUEUE_PRIORITY,
): boolean => {
  const { activeDialogId, enqueueDialog, removeDialog } = useDialogQueue();

  useEffect(() => {
    if (enabled) {
      enqueueDialog(dialogId, priority);

      return () => {
        removeDialog(dialogId);
      };
    }

    removeDialog(dialogId);
  }, [dialogId, enabled, enqueueDialog, priority, removeDialog]);

  return enabled && activeDialogId === dialogId;
};

export { useDialogQueueItem };
