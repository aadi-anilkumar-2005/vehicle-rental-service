// Admin module mock data

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'user' | 'owner' | 'staff' | 'admin';
  status: 'active' | 'inactive';
  registeredDate: string;
  bookingCount: number;
}

export interface ShopOwner {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'pending' | 'approved' | 'blocked';
  appliedDate: string;
  shopCount: number;
  totalRevenue: number;
}

export interface AdminShop {
  id: string;
  name: string;
  ownerId: string;
  ownerName: string;
  address: string;
  status: 'active' | 'inactive';
  vehicleCount: number;
  rating: number;
  totalBookings: number;
}

export const mockAdminUsers: AdminUser[] = [
  {
    id: 'u1',
    name: 'Sarah Customer',
    email: 'sarah@email.com',
    phone: '+1 555-0400',
    role: 'user',
    status: 'active',
    registeredDate: '2024-01-15',
    bookingCount: 12,
  },
  {
    id: 'u2',
    name: 'Mike Johnson',
    email: 'mike@email.com',
    phone: '+1 555-0401',
    role: 'user',
    status: 'active',
    registeredDate: '2024-01-20',
    bookingCount: 5,
  },
  {
    id: 'u3',
    name: 'Emily Davis',
    email: 'emily@email.com',
    phone: '+1 555-0402',
    role: 'user',
    status: 'inactive',
    registeredDate: '2024-02-01',
    bookingCount: 0,
  },
  {
    id: 'u4',
    name: 'James Wilson',
    email: 'james@email.com',
    phone: '+1 555-0403',
    role: 'user',
    status: 'active',
    registeredDate: '2024-02-10',
    bookingCount: 8,
  },
];

export const mockShopOwners: ShopOwner[] = [
  {
    id: 'o1',
    name: 'John Owner',
    email: 'john@autorental.com',
    phone: '+1 555-0200',
    status: 'approved',
    appliedDate: '2023-12-01',
    shopCount: 3,
    totalRevenue: 45000,
  },
  {
    id: 'o2',
    name: 'City Bikes Hub',
    email: 'info@citybikes.com',
    phone: '+1 555-0201',
    status: 'pending',
    appliedDate: '2024-02-02',
    shopCount: 0,
    totalRevenue: 0,
  },
  {
    id: 'o3',
    name: 'Premium Rides Co',
    email: 'contact@premiumrides.com',
    phone: '+1 555-0202',
    status: 'pending',
    appliedDate: '2024-02-03',
    shopCount: 0,
    totalRevenue: 0,
  },
  {
    id: 'o4',
    name: 'Blocked Owner',
    email: 'blocked@email.com',
    phone: '+1 555-0203',
    status: 'blocked',
    appliedDate: '2023-11-15',
    shopCount: 1,
    totalRevenue: 2000,
  },
];

export const mockAdminShops: AdminShop[] = [
  {
    id: 's1',
    name: 'SpeedWheels Downtown',
    ownerId: 'o1',
    ownerName: 'John Owner',
    address: '123 Main Street, Downtown',
    status: 'active',
    vehicleCount: 15,
    rating: 4.8,
    totalBookings: 234,
  },
  {
    id: 's2',
    name: 'SpeedWheels Midtown',
    ownerId: 'o1',
    ownerName: 'John Owner',
    address: '456 Oak Avenue, Midtown',
    status: 'active',
    vehicleCount: 20,
    rating: 4.6,
    totalBookings: 189,
  },
  {
    id: 's3',
    name: 'SpeedWheels Airport',
    ownerId: 'o1',
    ownerName: 'John Owner',
    address: '789 Airport Road, Terminal 2',
    status: 'active',
    vehicleCount: 13,
    rating: 4.9,
    totalBookings: 156,
  },
  {
    id: 's4',
    name: 'EcoRide Station',
    ownerId: 'o4',
    ownerName: 'Blocked Owner',
    address: '321 Green Street, Eco District',
    status: 'inactive',
    vehicleCount: 6,
    rating: 4.2,
    totalBookings: 45,
  },
];
