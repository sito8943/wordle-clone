export type InitialPlayerDialogProps = {
  initialName: string;
  onConfirm: (name: string) => void;
  onValidateName?: (name: string) => Promise<string | null>;
};
