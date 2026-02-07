export interface RentalShop {
  id: string;
  name: string;
  image: string;
  address: string;
  distance: number;
  rating: number;
  reviewCount: number;
  operatingHours: string;
  isOpen: boolean;
  vehicleCount: {
    cars: number;
    bikes: number;
  };
}

export interface Vehicle {
  id: string;
  shopId: string;
  type: 'car' | 'bike';
  name: string;
  brand: string;
  model: string;
  vehicleNumber?: string;
  images: string[];
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

export interface Booking {
  id: string;
  vehicleId: string;
  vehicle: Vehicle;
  shop: RentalShop;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: 'upcoming' | 'active' | 'completed' | 'cancelled';
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  savedLocations: SavedLocation[];
}

export interface SavedLocation {
  id: string;
  name: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}
