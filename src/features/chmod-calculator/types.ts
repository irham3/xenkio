export interface PermissionBit {
  read: boolean;
  write: boolean;
  execute: boolean;
}

export interface ChmodPermissions {
  owner: PermissionBit;
  group: PermissionBit;
  others: PermissionBit;
  sticky: boolean;
  setgid: boolean;
  setuid: boolean;
}

export interface ChmodResult {
  octal: string;
  symbolic: string;
  numeric: number;
  description: string;
}

export type PermissionEntity = 'owner' | 'group' | 'others';
export type PermissionType = 'read' | 'write' | 'execute';
