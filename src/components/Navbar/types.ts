export type NavLinkPropsType = {
  to: string;
  label: string;
  icon: React.ReactNode;
};

export type NavbarPropsType = {
  title: string;
  links: NavLinkPropsType[];
};
