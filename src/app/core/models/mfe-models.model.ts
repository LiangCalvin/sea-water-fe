import { RoleEnum } from '../enums/role.enum';

export interface HeaderStyle {
  bgColor?: string;
  titleTextColor?: string;
  iconUrl?: string;
  iconColors?: IconStyle;
  // eslint-disable-next-line rule-name-here
  hideIcon?: boolean;
  boxShadow?: string;
}

export interface IconStyle {
  primaryColor?: string;
  secondaryColor?: string;
  tertiaryColor?: string;
}

export interface MenuItemStyles {
  bgColor?: string;
  default?: MenuItemStyle;
  active?: MenuItemStyle;
  hover?: MenuItemStyle;
}

export interface MenuItemStyle {
  bgColor?: string;
  textColor?: string;
  iconColor?: string;
}

export interface NavigationSidebarStyle {
  bgColor?: string | string[];
  menuItem?: MenuItemStyles;
  childMenuItem?: MenuItemStyles;
}

export interface FooterStyle {
  bgColor?: string;
  textColor?: string;
  isVisible?: boolean;
}

export interface LayoutStyle {
  header?: HeaderStyle;
  navigation?: NavigationSidebarStyle;
  footer?: FooterStyle;
}

export interface NavItem {
  title: string;
  link?: string;
  target?: '_blank' | '_self' | '_parent' | '_top';
  // eslint-disable-next-line rule-name-here
  active?: boolean;
  iconPath: string;
  children?: NavItem[];
  isOpen?: boolean;
  // eslint-disable-next-line rule-name-here
  disabled?: boolean;
  path?: string;
  // eslint-disable-next-line rule-name-here
  hidden?: boolean;
  order?: number;
}

export interface ITitle {
  title: string;
  iconPath: string;
  tabletIconPath?: string;
}

export interface NavItemExtend extends NavItem {
  children?: NavItemExtend[];
  // eslint-disable-next-line rule-name-here
  disabledActiveClick?: boolean;
  permissions: RoleEnum[] | RoleEnum;
}
