// Owner module mock data

export interface OwnerShop {
  id: string;
  name: string;
  address: string;
  operatingHours: string;
  status: 'active' | 'inactive';
  vehicleCount: number;
  rating: number;
  totalBookings: number;
  revenue: number;
}

export interface OwnerVehicle {
  id: string;
  shopId: string;
  type: 'car' | 'bike';
  name: string;
  brand: string;
  model: string;
  vehicleNumber: string;
  image: string;
  pricePerHour: number;
  pricePerDay: number;
  fuelType: string;
  transmission: string;
  seating?: number;
  isAvailable: boolean;
  features: string[];
  color?: string;
  year?: string;
}

export interface OwnerStaff {
  id: string;
  shopId: string;
  shopName: string;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive';
  assignedTasks: number;
  completedTasks: number;
  joinedDate: string;
}

export const mockOwnerShops: OwnerShop[] = [
  {
    id: 'os1',
    name: 'SpeedWheels Downtown',
    address: '123 Main Street, Downtown',
    operatingHours: '8:00 AM - 10:00 PM',
    status: 'active',
    vehicleCount: 15,
    rating: 4.8,
    totalBookings: 234,
    revenue: 18500,
  },
  {
    id: 'os2',
    name: 'SpeedWheels Midtown',
    address: '456 Oak Avenue, Midtown',
    operatingHours: '7:00 AM - 9:00 PM',
    status: 'active',
    vehicleCount: 20,
    rating: 4.6,
    totalBookings: 189,
    revenue: 15200,
  },
  {
    id: 'os3',
    name: 'SpeedWheels Airport',
    address: '789 Airport Road, Terminal 2',
    operatingHours: '6:00 AM - 11:00 PM',
    status: 'active',
    vehicleCount: 13,
    rating: 4.9,
    totalBookings: 156,
    revenue: 12100,
  },
];

export const mockOwnerVehicles: OwnerVehicle[] = [
  {
    id: 'ov1',
    shopId: 'os1',
    type: 'car',
    name: 'Toyota Camry',
    brand: 'Toyota',
    model: 'Camry 2024',
    vehicleNumber: 'TN-01-AB-1234',
    image: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&q=80',
    pricePerHour: 15,
    pricePerDay: 89,
    fuelType: 'Petrol',
    transmission: 'Automatic',
    seating: 5,
    isAvailable: true,
    features: ['GPS', 'Bluetooth', 'USB Charging', 'Air Conditioning'],
    color: 'White',
    year: '2024',
  },
  {
    id: 'ov2',
    shopId: 'os1',
    type: 'car',
    name: 'Honda Civic',
    brand: 'Honda',
    model: 'Civic 2023',
    vehicleNumber: 'TN-01-CD-5678',
    image: 'https://images.unsplash.com/photo-1606611013016-969c19ba27bb?w=800&q=80',
    pricePerHour: 12,
    pricePerDay: 75,
    fuelType: 'Petrol',
    transmission: 'Manual',
    seating: 5,
    isAvailable: true,
    features: ['GPS', 'Bluetooth', 'Backup Camera'],
    color: 'Black',
    year: '2023',
  },
  {
    id: 'ov3',
    shopId: 'os1',
    type: 'bike',
    name: 'Royal Enfield Classic',
    brand: 'Royal Enfield',
    model: 'Classic 350',
    vehicleNumber: 'TN-02-EF-9012',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
    pricePerHour: 8,
    pricePerDay: 45,
    fuelType: 'Petrol',
    transmission: 'Manual',
    isAvailable: false,
    features: ['Helmet Included', 'Luggage Box'],
    color: 'Red',
    year: '2023',
  },
  {
    id: 'ov4',
    shopId: 'os2',
    type: 'car',
    name: 'BMW 3 Series',
    brand: 'BMW',
    model: '330i 2024',
    vehicleNumber: 'TN-03-GH-3456',
    image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80',
    pricePerHour: 35,
    pricePerDay: 199,
    fuelType: 'Petrol',
    transmission: 'Automatic',
    seating: 5,
    isAvailable: true,
    features: ['GPS', 'Leather Seats', 'Sunroof', 'Premium Sound'],
    color: 'Blue',
    year: '2024',
  },
];

export const mockOwnerStaff: OwnerStaff[] = [
  {
    id: 'st1',
    shopId: 'os1',
    shopName: 'SpeedWheels Downtown',
    name: 'Mike Staff',
    email: 'mike@rental.com',
    phone: '+1 555-0300',
    status: 'active',
    assignedTasks: 5,
    completedTasks: 127,
    joinedDate: '2023-06-15',
  },
  {
    id: 'st2',
    shopId: 'os1',
    shopName: 'SpeedWheels Downtown',
    name: 'Jane Doe',
    email: 'jane@rental.com',
    phone: '+1 555-0301',
    status: 'active',
    assignedTasks: 3,
    completedTasks: 89,
    joinedDate: '2023-08-20',
  },
  {
    id: 'st3',
    shopId: 'os2',
    shopName: 'SpeedWheels Midtown',
    name: 'Tom Wilson',
    email: 'tom@rental.com',
    phone: '+1 555-0302',
    status: 'inactive',
    assignedTasks: 0,
    completedTasks: 45,
    joinedDate: '2023-10-01',
  },
];
