import { useState } from 'react';
import { ArrowLeft, Search, Store, Car, Star, MapPin, Eye, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useNavigate } from 'react-router-dom';
import { mockAdminShops, AdminShop } from '@/data/adminMockData';
import { vehicles } from '@/data/mockData';

export const ShopMonitoring = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedShop, setSelectedShop] = useState<AdminShop | null>(null);
  const [showShopDetails, setShowShopDetails] = useState(false);

  const filteredShops = mockAdminShops.filter(shop =>
    shop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    shop.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const viewShopDetails = (shop: AdminShop) => {
    setSelectedShop(shop);
    setShowShopDetails(true);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur-xl">
        <div className="flex items-center gap-3 px-4 py-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-bold text-foreground">Shop Monitoring</h1>
        </div>
      </header>

      <main className="px-4 py-6 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search shops..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="border-border">
            <CardContent className="p-3 text-center">
              <p className="text-xl font-bold text-foreground">{mockAdminShops.length}</p>
              <p className="text-xs text-muted-foreground">Total Shops</p>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="p-3 text-center">
              <p className="text-xl font-bold text-green-500">
                {mockAdminShops.filter(s => s.status === 'active').length}
              </p>
              <p className="text-xs text-muted-foreground">Active</p>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="p-3 text-center">
              <p className="text-xl font-bold text-foreground">
                {mockAdminShops.reduce((sum, s) => sum + s.vehicleCount, 0)}
              </p>
              <p className="text-xs text-muted-foreground">Vehicles</p>
            </CardContent>
          </Card>
        </div>

        {/* Shop List */}
        <div className="space-y-3">
          {filteredShops.map(shop => (
            <Card
              key={shop.id}
              className="border-border cursor-pointer hover:bg-secondary/30 transition-colors"
              onClick={() => viewShopDetails(shop)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                      <Store className="h-6 w-6 text-purple-500" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground">{shop.name}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          shop.status === 'active'
                            ? 'bg-green-500/10 text-green-500'
                            : 'bg-destructive/10 text-destructive'
                        }`}>
                          {shop.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground truncate">{shop.address}</p>
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Car className="h-3 w-3" />
                          {shop.vehicleCount} vehicles
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                          {shop.rating}
                        </span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      {/* Shop Details Dialog */}
      <Dialog open={showShopDetails} onOpenChange={setShowShopDetails}>
        <DialogContent className="max-w-sm mx-4 max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Shop Details</DialogTitle>
          </DialogHeader>
          {selectedShop && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-16 w-16 rounded-xl bg-purple-500/10 flex items-center justify-center">
                  <Store className="h-8 w-8 text-purple-500" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{selectedShop.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedShop.ownerName}</p>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-secondary">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <p className="text-sm text-foreground">{selectedShop.address}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-secondary">
                  <p className="text-xs text-muted-foreground">Status</p>
                  <p className={`font-medium ${
                    selectedShop.status === 'active' ? 'text-green-500' : 'text-destructive'
                  }`}>
                    {selectedShop.status}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-secondary">
                  <p className="text-xs text-muted-foreground">Rating</p>
                  <p className="font-medium text-foreground flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                    {selectedShop.rating}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-secondary">
                  <p className="text-xs text-muted-foreground">Vehicles</p>
                  <p className="font-medium text-foreground">{selectedShop.vehicleCount}</p>
                </div>
                <div className="p-3 rounded-lg bg-secondary">
                  <p className="text-xs text-muted-foreground">Total Bookings</p>
                  <p className="font-medium text-foreground">{selectedShop.totalBookings}</p>
                </div>
              </div>

              {/* Vehicles in Shop */}
              <Card className="border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Vehicles</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {vehicles.slice(0, 3).map(vehicle => (
                    <div key={vehicle.id} className="flex items-center justify-between p-2 rounded-lg bg-secondary/50">
                      <div className="flex items-center gap-2">
                        <Car className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium text-foreground">{vehicle.name}</p>
                          <p className="text-xs text-muted-foreground">${vehicle.pricePerDay}/day</p>
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        vehicle.isAvailable
                          ? 'bg-green-500/10 text-green-500'
                          : 'bg-orange-500/10 text-orange-500'
                      }`}>
                        {vehicle.isAvailable ? 'Available' : 'Booked'}
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
