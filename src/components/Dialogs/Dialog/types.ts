import type { ReactNode } from "react";

export type DialogProps = {
  visible: boolean;
  onClose: () => void;
  isClosing?: boolean;
  titleId: string;
  title: string | ReactNode;
  description?: string;
  children?: ReactNode;
  headerAction?: ReactNode;
  panelClassName?: string;
  zIndexClassName?: string;
  backdropAnimationClassName?: string;
  panelAnimationClassName?: string;
};
