export type DialogCloseAction = () => void;

export type UseDialogCloseTransitionResult = {
  isClosing: boolean;
  closeWithAction: (action: DialogCloseAction) => void;
};
