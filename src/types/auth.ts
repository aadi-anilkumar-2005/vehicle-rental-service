export type UserRole = 'admin' | 'owner' | 'staff' | 'user';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  role: UserRole;
}

export interface MockCredentials {
  email: string;
  password: string;
  user: AuthUser;
}

// Mock users for each role
export const mockUsers: MockCredentials[] = [
  {
    email: 'admin@rental.com',
    password: 'admin123',
    user: {
      id: 'admin-1',
      name: 'System Admin',
      email: 'admin@rental.com',
      phone: '+1 555-0100',
      role: 'admin',
    },
  },
  {
    email: 'owner@rental.com',
    password: 'owner123',
    user: {
      id: 'owner-1',
      name: 'John Owner',
      email: 'owner@rental.com',
      phone: '+1 555-0200',
      role: 'owner',
    },
  },
  {
    email: 'staff@rental.com',
    password: 'staff123',
    user: {
      id: 'staff-1',
      name: 'Mike Staff',
      email: 'staff@rental.com',
      phone: '+1 555-0300',
      role: 'staff',
    },
  },
  {
    email: 'user@rental.com',
    password: 'user123',
    user: {
      id: 'user-1',
      name: 'Sarah Customer',
      email: 'user@rental.com',
      phone: '+1 555-0400',
      role: 'user',
    },
  },
];

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
      return 'hsl(0, 84%, 60%)'; // Red
    case 'owner':
      return 'hsl(262, 83%, 58%)'; // Purple
    case 'staff':
      return 'hsl(142, 76%, 36%)'; // Green
    case 'user':
      return 'hsl(221, 83%, 53%)'; // Blue
    default:
      return 'hsl(221, 83%, 53%)';
  }
};
