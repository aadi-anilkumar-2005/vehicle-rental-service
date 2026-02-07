import { useState } from 'react';
import { ArrowLeft, Plus, Car, Bike, MoreVertical, Edit, Trash2, Power, DollarSign, Fuel, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { mockOwnerVehicles, mockOwnerShops, OwnerVehicle } from '@/data/ownerMockData';

export const VehicleManagement = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [vehicles, setVehicles] = useState<OwnerVehicle[]>(mockOwnerVehicles);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<OwnerVehicle | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [formData, setFormData] = useState({
    shopId: '',
    type: 'car' as 'car' | 'bike',
    name: '',
    brand: '',
    model: '',
    vehicleNumber: '',
    pricePerHour: '',
    pricePerDay: '',
    fuelType: 'Petrol',
    transmission: 'Automatic',
    seating: '5',
    color: '',
    year: '',
  });

  const filteredVehicles = vehicles.filter(v => {
    if (activeTab === 'all') return true;
    return v.type === activeTab;
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData({
      shopId: '',
      type: 'car',
      name: '',
      brand: '',
      model: '',
      vehicleNumber: '',
      pricePerHour: '',
      pricePerDay: '',
      fuelType: 'Petrol',
      transmission: 'Automatic',
      seating: '5',
      color: '',
      year: '',
    });
  };

  const handleAddVehicle = () => {
    if (!formData.name || !formData.brand || !formData.pricePerDay || !formData.vehicleNumber) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const newVehicle: OwnerVehicle = {
      id: `ov${Date.now()}`,
      shopId: formData.shopId || mockOwnerShops[0].id,
      type: formData.type,
      name: formData.name,
      brand: formData.brand,
      model: formData.model,
      vehicleNumber: formData.vehicleNumber,
      image: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&q=80',
      pricePerHour: parseInt(formData.pricePerHour) || 0,
      pricePerDay: parseInt(formData.pricePerDay) || 0,
      fuelType: formData.fuelType,
      transmission: formData.transmission,
      seating: formData.type === 'car' ? parseInt(formData.seating) : undefined,
      isAvailable: true,
      features: [],
      color: formData.color || undefined,
      year: formData.year || undefined,
    };

    setVehicles(prev => [...prev, newVehicle]);
    toast({
      title: "Vehicle Added",
      description: `${formData.name} has been added successfully.`,
    });
    setShowAddDialog(false);
    resetForm();
  };

  const handleEditVehicle = () => {
    if (!selectedVehicle) return;

    setVehicles(prev =>
      prev.map(v =>
        v.id === selectedVehicle.id
          ? {
              ...v,
              name: formData.name,
              brand: formData.brand,
              model: formData.model,
              pricePerHour: parseInt(formData.pricePerHour) || 0,
              pricePerDay: parseInt(formData.pricePerDay) || 0,
              fuelType: formData.fuelType,
              transmission: formData.transmission,
            }
          : v
      )
    );
    toast({
      title: "Vehicle Updated",
      description: `${formData.name} has been updated successfully.`,
    });
    setShowEditDialog(false);
    setSelectedVehicle(null);
    resetForm();
  };

  const openEditDialog = (vehicle: OwnerVehicle) => {
    setSelectedVehicle(vehicle);
    setFormData({
      shopId: vehicle.shopId,
      type: vehicle.type,
      name: vehicle.name,
      brand: vehicle.brand,
      model: vehicle.model,
      vehicleNumber: vehicle.vehicleNumber,
      pricePerHour: vehicle.pricePerHour.toString(),
      pricePerDay: vehicle.pricePerDay.toString(),
      fuelType: vehicle.fuelType,
      transmission: vehicle.transmission,
      seating: vehicle.seating?.toString() || '5',
      color: vehicle.color || '',
      year: vehicle.year || '',
    });
    setShowEditDialog(true);
  };

  const toggleAvailability = (vehicleId: string) => {
    setVehicles(prev =>
      prev.map(v =>
        v.id === vehicleId
          ? { ...v, isAvailable: !v.isAvailable }
          : v
      )
    );
    const vehicle = vehicles.find(v => v.id === vehicleId);
    toast({
      title: vehicle?.isAvailable ? "Vehicle Unavailable" : "Vehicle Available",
      description: `${vehicle?.name} is now ${vehicle?.isAvailable ? 'unavailable' : 'available'}.`,
    });
  };

  const deleteVehicle = (vehicleId: string) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    setVehicles(prev => prev.filter(v => v.id !== vehicleId));
    toast({
      title: "Vehicle Deleted",
      description: `${vehicle?.name} has been deleted.`,
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
            <h1 className="text-lg font-bold text-foreground">Vehicle Management</h1>
          </div>
          <Button size="sm" onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Add Vehicle
          </Button>
        </div>
      </header>

      <main className="px-4 py-6 space-y-4">
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All ({vehicles.length})</TabsTrigger>
            <TabsTrigger value="car">Cars ({vehicles.filter(v => v.type === 'car').length})</TabsTrigger>
            <TabsTrigger value="bike">Bikes ({vehicles.filter(v => v.type === 'bike').length})</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4 space-y-3">
            {filteredVehicles.length === 0 ? (
              <Card className="border-border">
                <CardContent className="p-8 text-center">
                  <Car className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No vehicles yet</p>
                  <Button className="mt-4" onClick={() => setShowAddDialog(true)}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Your First Vehicle
                  </Button>
                </CardContent>
              </Card>
            ) : (
              filteredVehicles.map(vehicle => (
                <Card key={vehicle.id} className="border-border overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex">
                      <img
                        src={vehicle.image}
                        alt={vehicle.name}
                        className="w-28 h-28 object-cover"
                      />
                      <div className="flex-1 p-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              {vehicle.type === 'car' ? (
                                <Car className="h-4 w-4 text-primary" />
                              ) : (
                                <Bike className="h-4 w-4 text-primary" />
                              )}
                              <p className="font-medium text-foreground">{vehicle.name}</p>
                            </div>
                            <p className="text-xs text-muted-foreground">{vehicle.brand} • {vehicle.model}</p>
                            <p className="text-xs font-medium text-primary">{vehicle.vehicleNumber}</p>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openEditDialog(vehicle)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => toggleAvailability(vehicle.id)}>
                                <Power className="h-4 w-4 mr-2" />
                                {vehicle.isAvailable ? 'Mark Unavailable' : 'Mark Available'}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => deleteVehicle(vehicle.id)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Fuel className="h-3 w-3" />
                            {vehicle.fuelType}
                          </span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Settings2 className="h-3 w-3" />
                            {vehicle.transmission}
                          </span>
                        </div>

                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3 text-green-500" />
                            <span className="text-sm font-bold text-foreground">${vehicle.pricePerDay}</span>
                            <span className="text-xs text-muted-foreground">/day</span>
                          </div>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            vehicle.isAvailable
                              ? 'bg-green-500/10 text-green-500'
                              : 'bg-orange-500/10 text-orange-500'
                          }`}>
                            {vehicle.isAvailable ? 'Available' : 'Unavailable'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Add Vehicle Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-sm mx-4 max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Vehicle</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Vehicle Type *</label>
              <Select value={formData.type} onValueChange={(v: 'car' | 'bike') => handleInputChange('type', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="car">Car</SelectItem>
                  <SelectItem value="bike">Bike</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Shop *</label>
              <Select value={formData.shopId} onValueChange={(v) => handleInputChange('shopId', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select shop" />
                </SelectTrigger>
                <SelectContent>
                  {mockOwnerShops.map(shop => (
                    <SelectItem key={shop.id} value={shop.id}>{shop.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Vehicle Name *</label>
              <Input
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="e.g., Toyota Camry"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Vehicle Number *</label>
              <Input
                value={formData.vehicleNumber}
                onChange={(e) => handleInputChange('vehicleNumber', e.target.value)}
                placeholder="e.g., TN-01-AB-1234"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Brand *</label>
                <Input
                  value={formData.brand}
                  onChange={(e) => handleInputChange('brand', e.target.value)}
                  placeholder="e.g., Toyota"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Model</label>
                <Input
                  value={formData.model}
                  onChange={(e) => handleInputChange('model', e.target.value)}
                  placeholder="e.g., Camry"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Year</label>
                <Input
                  value={formData.year}
                  onChange={(e) => handleInputChange('year', e.target.value)}
                  placeholder="e.g., 2024"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Color</label>
                <Input
                  value={formData.color}
                  onChange={(e) => handleInputChange('color', e.target.value)}
                  placeholder="e.g., White"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Price/Hour ($)</label>
                <Input
                  type="number"
                  value={formData.pricePerHour}
                  onChange={(e) => handleInputChange('pricePerHour', e.target.value)}
                  placeholder="15"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Price/Day ($) *</label>
                <Input
                  type="number"
                  value={formData.pricePerDay}
                  onChange={(e) => handleInputChange('pricePerDay', e.target.value)}
                  placeholder="89"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Fuel Type</label>
                <Select value={formData.fuelType} onValueChange={(v) => handleInputChange('fuelType', v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Petrol">Petrol</SelectItem>
                    <SelectItem value="Diesel">Diesel</SelectItem>
                    <SelectItem value="Electric">Electric</SelectItem>
                    <SelectItem value="Hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Transmission</label>
                <Select value={formData.transmission} onValueChange={(v) => handleInputChange('transmission', v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Automatic">Automatic</SelectItem>
                    <SelectItem value="Manual">Manual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => { setShowAddDialog(false); resetForm(); }}>
              Cancel
            </Button>
            <Button onClick={handleAddVehicle}>
              Add Vehicle
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Vehicle Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-sm mx-4 max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Vehicle</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Vehicle Name *</label>
              <Input
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Vehicle Number *</label>
              <Input
                value={formData.vehicleNumber}
                onChange={(e) => handleInputChange('vehicleNumber', e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Brand *</label>
                <Input
                  value={formData.brand}
                  onChange={(e) => handleInputChange('brand', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Model</label>
                <Input
                  value={formData.model}
                  onChange={(e) => handleInputChange('model', e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Year</label>
                <Input
                  value={formData.year}
                  onChange={(e) => handleInputChange('year', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Color</label>
                <Input
                  value={formData.color}
                  onChange={(e) => handleInputChange('color', e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Price/Hour ($)</label>
                <Input
                  type="number"
                  value={formData.pricePerHour}
                  onChange={(e) => handleInputChange('pricePerHour', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Price/Day ($) *</label>
                <Input
                  type="number"
                  value={formData.pricePerDay}
                  onChange={(e) => handleInputChange('pricePerDay', e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Fuel Type</label>
                <Select value={formData.fuelType} onValueChange={(v) => handleInputChange('fuelType', v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Petrol">Petrol</SelectItem>
                    <SelectItem value="Diesel">Diesel</SelectItem>
                    <SelectItem value="Electric">Electric</SelectItem>
                    <SelectItem value="Hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Transmission</label>
                <Select value={formData.transmission} onValueChange={(v) => handleInputChange('transmission', v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Automatic">Automatic</SelectItem>
                    <SelectItem value="Manual">Manual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => { setShowEditDialog(false); resetForm(); }}>
              Cancel
            </Button>
            <Button onClick={handleEditVehicle}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
