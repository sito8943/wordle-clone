import type { ReactNode } from "react";

export type DialogProps = {
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
