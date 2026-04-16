import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { DIALOG_QUEUE_PRIORITIES } from "./constants";
import { DialogQueueProvider } from "./DialogQueueProvider";
import { useDialogQueue } from "./useDialogQueue";

const wrapper = ({ children }: { children: ReactNode }) => (
  <DialogQueueProvider>{children}</DialogQueueProvider>
);

describe("DialogQueueProvider", () => {
  it("keeps dialogs in FIFO order", () => {
    const { result } = renderHook(() => useDialogQueue(), { wrapper });

    act(() => {
      result.current.enqueueDialog("dialog-a");
      result.current.enqueueDialog("dialog-b");
    });

    expect(result.current.activeDialogId).toBe("dialog-a");

    act(() => {
      result.current.removeDialog("dialog-a");
    });

    expect(result.current.activeDialogId).toBe("dialog-b");
  });

  it("prioritizes higher-priority dialogs over previously enqueued lower-priority dialogs", () => {
    const { result } = renderHook(() => useDialogQueue(), { wrapper });

    act(() => {
      result.current.enqueueDialog("play-dialog", DIALOG_QUEUE_PRIORITIES.PLAY);
      result.current.enqueueDialog("view-dialog", DIALOG_QUEUE_PRIORITIES.VIEW);
    });

    expect(result.current.activeDialogId).toBe("view-dialog");

    act(() => {
      result.current.removeDialog("view-dialog");
    });

    expect(result.current.activeDialogId).toBe("play-dialog");
  });

  it("throws when used outside DialogQueueProvider", () => {
    const consoleSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    expect(() => renderHook(() => useDialogQueue())).toThrow(
      "useDialogQueue must be used within a DialogQueueProvider",
    );

    consoleSpy.mockRestore();
  });
});
