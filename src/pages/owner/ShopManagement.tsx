import { useState } from 'react';
import { ArrowLeft, Plus, Store, MapPin, Clock, Star, MoreVertical, Edit, Power, Trash2, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { mockOwnerShops, OwnerShop } from '@/data/ownerMockData';

export const ShopManagement = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [shops, setShops] = useState<OwnerShop[]>(mockOwnerShops);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedShop, setSelectedShop] = useState<OwnerShop | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    operatingHours: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData({ name: '', address: '', operatingHours: '' });
  };

  const handleAddShop = () => {
    if (!formData.name || !formData.address) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const newShop: OwnerShop = {
      id: `os${Date.now()}`,
      name: formData.name,
      address: formData.address,
      operatingHours: formData.operatingHours || '9:00 AM - 6:00 PM',
      status: 'active',
      vehicleCount: 0,
      rating: 0,
      totalBookings: 0,
      revenue: 0,
    };

    setShops(prev => [...prev, newShop]);
    toast({
      title: "Shop Added",
      description: `${formData.name} has been added successfully.`,
    });
    setShowAddDialog(false);
    resetForm();
  };

  const handleEditShop = () => {
    if (!selectedShop) return;

    setShops(prev =>
      prev.map(shop =>
        shop.id === selectedShop.id
          ? { ...shop, ...formData }
          : shop
      )
    );
    toast({
      title: "Shop Updated",
      description: `${formData.name} has been updated successfully.`,
    });
    setShowEditDialog(false);
    setSelectedShop(null);
    resetForm();
  };

  const openEditDialog = (shop: OwnerShop) => {
    setSelectedShop(shop);
    setFormData({
      name: shop.name,
      address: shop.address,
      operatingHours: shop.operatingHours,
    });
    setShowEditDialog(true);
  };

  const toggleShopStatus = (shopId: string) => {
    setShops(prev =>
      prev.map(shop =>
        shop.id === shopId
          ? { ...shop, status: shop.status === 'active' ? 'inactive' : 'active' }
          : shop
      )
    );
    const shop = shops.find(s => s.id === shopId);
    toast({
      title: shop?.status === 'active' ? "Shop Disabled" : "Shop Enabled",
      description: `${shop?.name} has been ${shop?.status === 'active' ? 'disabled' : 'enabled'}.`,
    });
  };

  const deleteShop = (shopId: string) => {
    const shop = shops.find(s => s.id === shopId);
    setShops(prev => prev.filter(s => s.id !== shopId));
    toast({
      title: "Shop Deleted",
      description: `${shop?.name} has been deleted.`,
      variant: "destructive",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur-xl">
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/owner')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-bold text-foreground">Shop Management</h1>
          </div>
          <Button size="sm" onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Add Shop
          </Button>
        </div>
      </header>

      <main className="px-4 py-6 space-y-4">
        {/* Shop List */}
        {shops.length === 0 ? (
          <Card className="border-border">
            <CardContent className="p-8 text-center">
              <Store className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No shops yet</p>
              <Button className="mt-4" onClick={() => setShowAddDialog(true)}>
                <Plus className="h-4 w-4 mr-1" />
                Add Your First Shop
              </Button>
            </CardContent>
          </Card>
        ) : (
          shops.map(shop => (
            <Card key={shop.id} className="border-border">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
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
                      <div className="flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">{shop.address}</p>
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">{shop.operatingHours}</p>
                      </div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEditDialog(shop)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toggleShopStatus(shop.id)}>
                        <Power className="h-4 w-4 mr-2" />
                        {shop.status === 'active' ? 'Disable' : 'Enable'}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => deleteShop(shop.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-2 mt-4 pt-4 border-t border-border">
                  <div className="text-center">
                    <p className="text-lg font-bold text-foreground">{shop.vehicleCount}</p>
                    <p className="text-xs text-muted-foreground">Vehicles</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-foreground">{shop.totalBookings}</p>
                    <p className="text-xs text-muted-foreground">Bookings</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-foreground flex items-center justify-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                      {shop.rating || '-'}
                    </p>
                    <p className="text-xs text-muted-foreground">Rating</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-green-500">${shop.revenue.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Revenue</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </main>

      {/* Add Shop Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-sm mx-4">
          <DialogHeader>
            <DialogTitle>Add New Shop</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Shop Name *</label>
              <Input
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter shop name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Address *</label>
              <Input
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Enter address"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Operating Hours</label>
              <Input
                value={formData.operatingHours}
                onChange={(e) => handleInputChange('operatingHours', e.target.value)}
                placeholder="e.g., 9:00 AM - 6:00 PM"
              />
            </div>
          </div>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => { setShowAddDialog(false); resetForm(); }}>
              Cancel
            </Button>
            <Button onClick={handleAddShop}>
              Add Shop
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Shop Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-sm mx-4">
          <DialogHeader>
            <DialogTitle>Edit Shop</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Shop Name *</label>
              <Input
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter shop name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Address *</label>
              <Input
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Enter address"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Operating Hours</label>
              <Input
                value={formData.operatingHours}
                onChange={(e) => handleInputChange('operatingHours', e.target.value)}
                placeholder="e.g., 9:00 AM - 6:00 PM"
              />
            </div>
          </div>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => { setShowEditDialog(false); resetForm(); }}>
              Cancel
            </Button>
            <Button onClick={handleEditShop}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
