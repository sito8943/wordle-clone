import type {
  KeyboardEventHandler,
  MouseEventHandler,
  ReactElement,
  ReactNode,
  Ref,
} from "react";

export type PopupPlacement = "top" | "bottom";
export type PopupMotionState = "hidden" | "entering" | "open" | "exiting";

export type PopupCoordinates = {
  top: number;
  left: number;
  visible: boolean;
};

export type PopupTriggerProps = {
  ref?: Ref<HTMLElement>;
  onClick?: MouseEventHandler<HTMLElement>;
  onKeyDown?: KeyboardEventHandler<HTMLElement>;
  tabIndex?: number;
  role?: string;
  "aria-controls"?: string;
  "aria-expanded"?: boolean;
  "aria-haspopup"?: "dialog";
  "aria-describedby"?: string;
};

export type PopupProps = {
  content: ReactNode;
  children: ReactElement<PopupTriggerProps>;
  disabled?: boolean;
  placement?: PopupPlacement;
  offsetPx?: number;
  panelClassName?: string;
};
