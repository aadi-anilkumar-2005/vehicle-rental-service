import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Car, Bike, MoreVertical, Edit, Trash2, Power, DollarSign, Fuel, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface DbVehicle {
  id: string;
  shop_id: string;
  type: string;
  name: string;
  brand: string;
  model: string;
  price_per_hour: number;
  price_per_day: number;
  fuel_type: string | null;
  transmission: string | null;
  seating: number | null;
  is_available: boolean;
  features: string[] | null;
  images: string[] | null;
}

interface DbShop {
  id: string;
  name: string;
}

export const VehicleManagement = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [vehicles, setVehicles] = useState<DbVehicle[]>([]);
  const [shops, setShops] = useState<DbShop[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<DbVehicle | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [formData, setFormData] = useState({
    shopId: '', type: 'car', name: '', brand: '', model: '',
    pricePerHour: '', pricePerDay: '', fuelType: 'Petrol',
    transmission: 'Automatic', seating: '5',
  });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    const [vRes, sRes] = await Promise.all([
      supabase.from('vehicles').select('*').order('created_at', { ascending: false }),
      supabase.from('shops').select('id, name'),
    ]);
    setVehicles(vRes.data || []);
    setShops(sRes.data || []);
    setLoading(false);
  };

  const filteredVehicles = vehicles.filter(v => activeTab === 'all' || v.type === activeTab);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData({ shopId: '', type: 'car', name: '', brand: '', model: '', pricePerHour: '', pricePerDay: '', fuelType: 'Petrol', transmission: 'Automatic', seating: '5' });
  };

  const handleAddVehicle = async () => {
    if (!formData.name || !formData.brand || !formData.pricePerDay || !formData.shopId) {
      toast({ title: 'Error', description: 'Please fill in all required fields.', variant: 'destructive' });
      return;
    }
    setSaving(true);
    const { error } = await supabase.from('vehicles').insert({
      shop_id: formData.shopId,
      type: formData.type,
      name: formData.name.trim(),
      brand: formData.brand.trim(),
      model: formData.model.trim(),
      price_per_hour: parseInt(formData.pricePerHour) || 0,
      price_per_day: parseInt(formData.pricePerDay) || 0,
      fuel_type: formData.fuelType,
      transmission: formData.transmission,
      seating: formData.type === 'car' ? parseInt(formData.seating) : null,
    });
    setSaving(false);
    if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
    toast({ title: 'Vehicle Added', description: `${formData.name} has been added.` });
    setShowAddDialog(false);
    resetForm();
    fetchData();
  };

  const handleEditVehicle = async () => {
    if (!selectedVehicle) return;
    setSaving(true);
    const { error } = await supabase.from('vehicles').update({
      name: formData.name.trim(),
      brand: formData.brand.trim(),
      model: formData.model.trim(),
      price_per_hour: parseInt(formData.pricePerHour) || 0,
      price_per_day: parseInt(formData.pricePerDay) || 0,
      fuel_type: formData.fuelType,
      transmission: formData.transmission,
      seating: formData.type === 'car' ? parseInt(formData.seating) : null,
    }).eq('id', selectedVehicle.id);
    setSaving(false);
    if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
    toast({ title: 'Vehicle Updated', description: `${formData.name} has been updated.` });
    setShowEditDialog(false);
    setSelectedVehicle(null);
    resetForm();
    fetchData();
  };

  const openEditDialog = (vehicle: DbVehicle) => {
    setSelectedVehicle(vehicle);
    setFormData({
      shopId: vehicle.shop_id, type: vehicle.type, name: vehicle.name,
      brand: vehicle.brand, model: vehicle.model,
      pricePerHour: vehicle.price_per_hour.toString(),
      pricePerDay: vehicle.price_per_day.toString(),
      fuelType: vehicle.fuel_type || 'Petrol',
      transmission: vehicle.transmission || 'Automatic',
      seating: vehicle.seating?.toString() || '5',
    });
    setShowEditDialog(true);
  };

  const toggleAvailability = async (vehicle: DbVehicle) => {
    const { error } = await supabase.from('vehicles').update({ is_available: !vehicle.is_available }).eq('id', vehicle.id);
    if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
    toast({ title: vehicle.is_available ? 'Vehicle Unavailable' : 'Vehicle Available' });
    fetchData();
  };

  const deleteVehicle = async (vehicle: DbVehicle) => {
    const { error } = await supabase.from('vehicles').delete().eq('id', vehicle.id);
    if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
    toast({ title: 'Vehicle Deleted', description: `${vehicle.name} has been deleted.`, variant: 'destructive' });
    fetchData();
  };

  const shopSelect = (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">Shop *</label>
      <Select value={formData.shopId} onValueChange={(v) => handleInputChange('shopId', v)}>
        <SelectTrigger><SelectValue placeholder="Select shop" /></SelectTrigger>
        <SelectContent>
          {shops.map(shop => (<SelectItem key={shop.id} value={shop.id}>{shop.name}</SelectItem>))}
        </SelectContent>
      </Select>
    </div>
  );

  const vehicleFormFields = (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Vehicle Type *</label>
        <Select value={formData.type} onValueChange={(v) => handleInputChange('type', v)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="car">Car</SelectItem>
            <SelectItem value="bike">Bike</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Vehicle Name *</label>
        <Input value={formData.name} onChange={(e) => handleInputChange('name', e.target.value)} placeholder="e.g., Toyota Camry" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Brand *</label>
          <Input value={formData.brand} onChange={(e) => handleInputChange('brand', e.target.value)} placeholder="e.g., Toyota" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Model</label>
          <Input value={formData.model} onChange={(e) => handleInputChange('model', e.target.value)} placeholder="e.g., Camry" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Price/Hour ($)</label>
          <Input type="number" value={formData.pricePerHour} onChange={(e) => handleInputChange('pricePerHour', e.target.value)} placeholder="15" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Price/Day ($) *</label>
          <Input type="number" value={formData.pricePerDay} onChange={(e) => handleInputChange('pricePerDay', e.target.value)} placeholder="89" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Fuel Type</label>
          <Select value={formData.fuelType} onValueChange={(v) => handleInputChange('fuelType', v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
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
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Automatic">Automatic</SelectItem>
              <SelectItem value="Manual">Manual</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur-xl">
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/owner')}><ArrowLeft className="h-5 w-5" /></Button>
            <h1 className="text-lg font-bold text-foreground">Vehicle Management</h1>
          </div>
          <Button size="sm" onClick={() => setShowAddDialog(true)}><Plus className="h-4 w-4 mr-1" />Add Vehicle</Button>
        </div>
      </header>

      <main className="px-4 py-6 space-y-4">
        {loading ? (
          <p className="text-center text-muted-foreground py-8">Loading vehicles...</p>
        ) : (
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
                      <Plus className="h-4 w-4 mr-1" />Add Your First Vehicle
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                filteredVehicles.map(vehicle => (
                  <Card key={vehicle.id} className="border-border overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            {vehicle.type === 'car' ? <Car className="h-4 w-4 text-primary" /> : <Bike className="h-4 w-4 text-primary" />}
                            <p className="font-medium text-foreground">{vehicle.name}</p>
                          </div>
                          <p className="text-xs text-muted-foreground">{vehicle.brand} • {vehicle.model}</p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditDialog(vehicle)}><Edit className="h-4 w-4 mr-2" />Edit</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toggleAvailability(vehicle)}><Power className="h-4 w-4 mr-2" />{vehicle.is_available ? 'Mark Unavailable' : 'Mark Available'}</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={() => deleteVehicle(vehicle)}><Trash2 className="h-4 w-4 mr-2" />Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs text-muted-foreground flex items-center gap-1"><Fuel className="h-3 w-3" />{vehicle.fuel_type}</span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1"><Settings2 className="h-3 w-3" />{vehicle.transmission}</span>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3 text-green-500" />
                          <span className="text-sm font-bold text-foreground">${vehicle.price_per_day}</span>
                          <span className="text-xs text-muted-foreground">/day</span>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${vehicle.is_available ? 'bg-green-500/10 text-green-500' : 'bg-orange-500/10 text-orange-500'}`}>
                          {vehicle.is_available ? 'Available' : 'Unavailable'}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        )}
      </main>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-sm mx-4 max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Add New Vehicle</DialogTitle></DialogHeader>
          {shopSelect}
          {vehicleFormFields}
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => { setShowAddDialog(false); resetForm(); }}>Cancel</Button>
            <Button onClick={handleAddVehicle} disabled={saving}>{saving ? 'Adding...' : 'Add Vehicle'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-sm mx-4 max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Edit Vehicle</DialogTitle></DialogHeader>
          {vehicleFormFields}
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => { setShowEditDialog(false); resetForm(); }}>Cancel</Button>
            <Button onClick={handleEditVehicle} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
