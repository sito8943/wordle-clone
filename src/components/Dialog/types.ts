import type { ReactNode } from "react";

export type DialogProps = {
  visible: boolean;
  onClose: () => void;
  titleId: string;
  title: string;
  description?: string;
  children?: ReactNode;
  headerAction?: ReactNode;
  panelClassName?: string;
  zIndexClassName?: string;
  backdropAnimationClassName?: string;
  panelAnimationClassName?: string;
};
