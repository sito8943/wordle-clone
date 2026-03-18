export type InitialPlayerDialogProps = {
  visible: boolean;
  onClose: () => void;
  initialName: string;
  onConfirm: (name: string) => Promise<string | null>;
  onRecover: (code: string) => Promise<string | null>;
  onValidateName?: (name: string) => Promise<string | null>;
};
