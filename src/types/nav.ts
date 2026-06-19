export interface NavSubMenu {
  id: number;
  name: string;
  path: string;
  icon: string;
  position: number;
}

export interface NavMenu {
  id: number;
  name: string;
  icon: string;
  position: number;
  subMenus: NavSubMenu[];
}

export interface NavModule {
  id: number;
  name: string;
  shortName: string;
  icon: string;
  position: number;
  menus: NavMenu[];
}

export interface CrmRole {
  roleId: number;
  roleName: string;
  description: string | null;
  isSystem: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface NavSubMenuWithRoles extends NavSubMenu {
  roleAssignments: { role: { roleId: number; roleName: string } }[];
}

export interface NavModuleFull {
  id: number;
  name: string;
  shortName: string;
  icon: string;
  position: number;
  menus: NavMenuFull[];
}

export interface NavMenuFull {
  id: number;
  name: string;
  icon: string;
  position: number;
  subMenus: NavSubMenuWithRoles[];
}
