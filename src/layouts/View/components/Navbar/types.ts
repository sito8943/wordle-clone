import type { ReactNode } from "react";
import type { IconProp } from "@fortawesome/fontawesome-svg-core";

export type NavLinkPropsType = {
  to: string;
  label: string;
  extraLabel?: ReactNode;
  icon: IconProp;
  iconClassName?: string;
  ariaLabel?: string;
  toneClassName?: string;
};

export type ScoreboardExtraLabelProps = {
  currentClientRank: number | null;
  isCurrentClientRankLoading: boolean;
};

export type NavbarPropsType = {
  title: string;
  links: NavLinkPropsType[];
};
