export type UserRole = 'admin' | 'staff';

export interface User {
  id: string;
  name: string;
  role: UserRole;
}

export function isAdmin(user: User) {
  return user.role === 'admin';
}

export function isStaff(user: User) {
  return user.role === 'staff';
}
