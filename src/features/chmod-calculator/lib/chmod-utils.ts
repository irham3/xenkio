import type { ChmodPermissions, ChmodResult, PermissionBit } from '../types';

export function permissionsToOctal(permissions: ChmodPermissions): string {
  const specialBits =
    (permissions.setuid ? 4 : 0) +
    (permissions.setgid ? 2 : 0) +
    (permissions.sticky ? 1 : 0);

  const ownerBits =
    (permissions.owner.read ? 4 : 0) +
    (permissions.owner.write ? 2 : 0) +
    (permissions.owner.execute ? 1 : 0);

  const groupBits =
    (permissions.group.read ? 4 : 0) +
    (permissions.group.write ? 2 : 0) +
    (permissions.group.execute ? 1 : 0);

  const othersBits =
    (permissions.others.read ? 4 : 0) +
    (permissions.others.write ? 2 : 0) +
    (permissions.others.execute ? 1 : 0);

  if (specialBits > 0) {
    return `${specialBits}${ownerBits}${groupBits}${othersBits}`;
  }
  return `${ownerBits}${groupBits}${othersBits}`;
}

function bitToSymbolic(bit: PermissionBit, entity: 'owner' | 'group' | 'others', permissions: ChmodPermissions): string {
  const r = bit.read ? 'r' : '-';
  const w = bit.write ? 'w' : '-';

  let x: string;
  if (entity === 'owner') {
    if (permissions.setuid) {
      x = bit.execute ? 's' : 'S';
    } else {
      x = bit.execute ? 'x' : '-';
    }
  } else if (entity === 'group') {
    if (permissions.setgid) {
      x = bit.execute ? 's' : 'S';
    } else {
      x = bit.execute ? 'x' : '-';
    }
  } else {
    if (permissions.sticky) {
      x = bit.execute ? 't' : 'T';
    } else {
      x = bit.execute ? 'x' : '-';
    }
  }

  return `${r}${w}${x}`;
}

export function permissionsToSymbolic(permissions: ChmodPermissions): string {
  const owner = bitToSymbolic(permissions.owner, 'owner', permissions);
  const group = bitToSymbolic(permissions.group, 'group', permissions);
  const others = bitToSymbolic(permissions.others, 'others', permissions);
  return `${owner}${group}${others}`;
}

export function calculateResult(permissions: ChmodPermissions): ChmodResult {
  const octal = permissionsToOctal(permissions);
  const symbolic = permissionsToSymbolic(permissions);
  const numeric = parseInt(octal, 8);

  const descriptions: string[] = [];
  if (permissions.owner.read) descriptions.push('owner can read');
  if (permissions.owner.write) descriptions.push('owner can write');
  if (permissions.owner.execute) descriptions.push('owner can execute');
  if (permissions.group.read) descriptions.push('group can read');
  if (permissions.group.write) descriptions.push('group can write');
  if (permissions.group.execute) descriptions.push('group can execute');
  if (permissions.others.read) descriptions.push('others can read');
  if (permissions.others.write) descriptions.push('others can write');
  if (permissions.others.execute) descriptions.push('others can execute');
  if (permissions.setuid) descriptions.push('setuid bit');
  if (permissions.setgid) descriptions.push('setgid bit');
  if (permissions.sticky) descriptions.push('sticky bit');

  const description =
    descriptions.length > 0
      ? descriptions.join(', ')
      : 'no permissions';

  return { octal, symbolic, numeric, description };
}

export function octalToPermissions(octalStr: string): ChmodPermissions | null {
  const cleaned = octalStr.replace(/^0+/, '') || '0';

  if (!/^\d{1,4}$/.test(cleaned)) return null;

  const padded = cleaned.padStart(4, '0');
  const [special, owner, group, others] = padded.split('').map(Number);

  if ([special, owner, group, others].some((n) => n > 7)) return null;

  return {
    setuid: (special & 4) !== 0,
    setgid: (special & 2) !== 0,
    sticky: (special & 1) !== 0,
    owner: {
      read: (owner & 4) !== 0,
      write: (owner & 2) !== 0,
      execute: (owner & 1) !== 0,
    },
    group: {
      read: (group & 4) !== 0,
      write: (group & 2) !== 0,
      execute: (group & 1) !== 0,
    },
    others: {
      read: (others & 4) !== 0,
      write: (others & 2) !== 0,
      execute: (others & 1) !== 0,
    },
  };
}

export const COMMON_PRESETS: { label: string; octal: string; description: string }[] = [
  { label: '644', octal: '644', description: 'Standard file — owner read/write, others read-only' },
  { label: '755', octal: '755', description: 'Executable / directory — owner full, others read+execute' },
  { label: '600', octal: '600', description: 'Private file — owner read/write only' },
  { label: '700', octal: '700', description: 'Private executable — owner only' },
  { label: '777', octal: '777', description: 'Full permissions for everyone (use with caution)' },
  { label: '664', octal: '664', description: 'Group writable — owner + group read/write, others read' },
  { label: '775', octal: '775', description: 'Group directory — owner + group full, others read+execute' },
  { label: '444', octal: '444', description: 'Read-only for all' },
  { label: '400', octal: '400', description: 'Read-only for owner' },
  { label: '000', octal: '000', description: 'No permissions' },
];
