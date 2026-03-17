export type InitialPlayerDialogProps = {
  visible: boolean;
  onClose: () => void;
  initialName: string;
  onConfirm: (name: string) => void;
  onValidateName?: (name: string) => Promise<string | null>;
};
