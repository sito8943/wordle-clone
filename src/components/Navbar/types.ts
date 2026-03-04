export type NavLinkPropsType = {
  to: string;
  children: React.ReactNode;
};

export type NavbarPropsType = {
  title: string;
  links: NavLinkPropsType[];
};
