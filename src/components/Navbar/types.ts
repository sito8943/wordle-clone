import type { IconProp } from "@fortawesome/fontawesome-svg-core";

export type NavLinkPropsType = {
  to: string;
  label: string;
  extraLabel?: string;
  icon: IconProp;
  ariaLabel?: string;
  toneClassName?: string;
};

export type NavbarPropsType = {
  title: string;
  links: NavLinkPropsType[];
};
