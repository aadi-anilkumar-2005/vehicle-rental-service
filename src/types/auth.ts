export type UserRole = 'admin' | 'owner' | 'staff' | 'user';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  role: UserRole;
}

export const getRoleDashboardPath = (role: UserRole): string => {
  switch (role) {
    case 'admin':
      return '/admin';
    case 'owner':
      return '/owner';
    case 'staff':
      return '/staff';
    case 'user':
      return '/home';
    default:
      return '/home';
  }
};

export const getRoleColor = (role: UserRole): string => {
  switch (role) {
    case 'admin':
      return 'hsl(0, 84%, 60%)';
    case 'owner':
      return 'hsl(262, 83%, 58%)';
    case 'staff':
      return 'hsl(142, 76%, 36%)';
    case 'user':
      return 'hsl(221, 83%, 53%)';
    default:
      return 'hsl(221, 83%, 53%)';
  }
};
