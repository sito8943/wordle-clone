import type { IconProp } from "@fortawesome/fontawesome-svg-core";

export type NavLinkPropsType = {
  to: string;
  label: string;
  icon: IconProp;
};

export type NavbarPropsType = {
  title: string;
  links: NavLinkPropsType[];
};
