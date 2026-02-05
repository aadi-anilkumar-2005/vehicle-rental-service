 import { useState } from 'react';
 import { ArrowLeft, MapPin, Plus, Home, Briefcase, Star, MoreVertical, Edit, Trash2, Navigation } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { Card, CardContent } from '@/components/ui/card';
 import {
   Dialog,
   DialogContent,
   DialogHeader,
   DialogTitle,
   DialogFooter,
 } from '@/components/ui/dialog';
 import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuTrigger,
 } from '@/components/ui/dropdown-menu';
 import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
 } from '@/components/ui/select';
 import { useNavigate } from 'react-router-dom';
 import { useToast } from '@/hooks/use-toast';
 import { BottomNav } from '@/components/BottomNav';
 
 interface SavedLocation {
   id: string;
   name: string;
   address: string;
   type: 'home' | 'work' | 'favorite' | 'other';
 }
 
 const initialLocations: SavedLocation[] = [
   { id: '1', name: 'Home', address: '123 Main Street, Downtown, City 12345', type: 'home' },
   { id: '2', name: 'Office', address: '456 Business Park, Corporate Zone, City 67890', type: 'work' },
   { id: '3', name: 'Gym', address: '789 Fitness Avenue, Sports District', type: 'favorite' },
 ];
 
 const getLocationIcon = (type: string) => {
   switch (type) {
     case 'home': return Home;
     case 'work': return Briefcase;
     case 'favorite': return Star;
     default: return MapPin;
   }
 };
 
 export const SavedLocations = () => {
   const navigate = useNavigate();
   const { toast } = useToast();
   const [locations, setLocations] = useState<SavedLocation[]>(initialLocations);
   const [showAddDialog, setShowAddDialog] = useState(false);
   const [showEditDialog, setShowEditDialog] = useState(false);
   const [selectedLocation, setSelectedLocation] = useState<SavedLocation | null>(null);
   const [formData, setFormData] = useState({
     name: '',
     address: '',
     type: 'other' as 'home' | 'work' | 'favorite' | 'other',
   });
 
   const resetForm = () => {
     setFormData({ name: '', address: '', type: 'other' });
   };
 
   const handleAddLocation = () => {
     if (!formData.name || !formData.address) {
       toast({ title: "Error", description: "Please fill in all fields.", variant: "destructive" });
       return;
     }
     const newLocation: SavedLocation = { id: Date.now().toString(), ...formData };
     setLocations(prev => [...prev, newLocation]);
     toast({ title: "Location Saved", description: `${formData.name} has been added.` });
     setShowAddDialog(false);
     resetForm();
   };
 
   const handleEditLocation = () => {
     if (!selectedLocation) return;
     setLocations(prev => prev.map(loc => loc.id === selectedLocation.id ? { ...loc, ...formData } : loc));
     toast({ title: "Location Updated", description: `${formData.name} has been updated.` });
     setShowEditDialog(false);
     resetForm();
   };
 
   const openEditDialog = (location: SavedLocation) => {
     setSelectedLocation(location);
     setFormData({ name: location.name, address: location.address, type: location.type });
     setShowEditDialog(true);
   };
 
   const deleteLocation = (id: string) => {
     const location = locations.find(l => l.id === id);
     setLocations(prev => prev.filter(l => l.id !== id));
     toast({ title: "Location Deleted", description: `${location?.name} has been removed.` });
   };
 
   return (
     <div className="min-h-screen bg-background pb-24">
       <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur-xl">
         <div className="flex items-center justify-between px-4 py-4">
           <div className="flex items-center gap-3">
             <Button variant="ghost" size="icon" onClick={() => navigate('/profile')}>
               <ArrowLeft className="h-5 w-5" />
             </Button>
             <h1 className="text-lg font-bold text-foreground">Saved Locations</h1>
           </div>
           <Button size="sm" onClick={() => setShowAddDialog(true)}>
             <Plus className="h-4 w-4 mr-1" />Add
           </Button>
         </div>
       </header>
 
       <main className="px-4 py-6 space-y-4">
         {locations.length === 0 ? (
           <Card className="border-border">
             <CardContent className="p-8 text-center">
               <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
               <p className="text-muted-foreground">No saved locations yet</p>
               <Button className="mt-4" onClick={() => setShowAddDialog(true)}>
                 <Plus className="h-4 w-4 mr-1" />Add Location
               </Button>
             </CardContent>
           </Card>
         ) : (
           locations.map(location => {
             const Icon = getLocationIcon(location.type);
             return (
               <Card key={location.id} className="border-border">
                 <CardContent className="p-4">
                   <div className="flex items-start justify-between">
                     <div className="flex items-start gap-3">
                       <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                         location.type === 'home' ? 'bg-primary/10' :
                         location.type === 'work' ? 'bg-purple-500/10' :
                         location.type === 'favorite' ? 'bg-orange-500/10' : 'bg-secondary'
                       }`}>
                         <Icon className={`h-5 w-5 ${
                           location.type === 'home' ? 'text-primary' :
                           location.type === 'work' ? 'text-purple-500' :
                           location.type === 'favorite' ? 'text-orange-500' : 'text-muted-foreground'
                         }`} />
                       </div>
                       <div className="flex-1">
                         <p className="font-medium text-foreground">{location.name}</p>
                         <p className="text-sm text-muted-foreground mt-1">{location.address}</p>
                       </div>
                     </div>
                     <DropdownMenu>
                       <DropdownMenuTrigger asChild>
                         <Button variant="ghost" size="icon" className="h-8 w-8">
                           <MoreVertical className="h-4 w-4" />
                         </Button>
                       </DropdownMenuTrigger>
                       <DropdownMenuContent align="end">
                         <DropdownMenuItem onClick={() => toast({ title: "Opening Navigation" })}>
                           <Navigation className="h-4 w-4 mr-2" />Navigate
                         </DropdownMenuItem>
                         <DropdownMenuItem onClick={() => openEditDialog(location)}>
                           <Edit className="h-4 w-4 mr-2" />Edit
                         </DropdownMenuItem>
                         <DropdownMenuItem className="text-destructive" onClick={() => deleteLocation(location.id)}>
                           <Trash2 className="h-4 w-4 mr-2" />Delete
                         </DropdownMenuItem>
                       </DropdownMenuContent>
                     </DropdownMenu>
                   </div>
                 </CardContent>
               </Card>
             );
           })
         )}
       </main>
 
       <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
         <DialogContent className="max-w-sm mx-4">
           <DialogHeader><DialogTitle>Add New Location</DialogTitle></DialogHeader>
           <div className="space-y-4">
             <div className="space-y-2">
               <label className="text-sm font-medium text-foreground">Location Name *</label>
               <Input value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} placeholder="e.g., Home, Office" />
             </div>
             <div className="space-y-2">
               <label className="text-sm font-medium text-foreground">Address *</label>
               <Input value={formData.address} onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))} placeholder="Enter full address" />
             </div>
             <div className="space-y-2">
               <label className="text-sm font-medium text-foreground">Type</label>
               <Select value={formData.type} onValueChange={(v: 'home' | 'work' | 'favorite' | 'other') => setFormData(prev => ({ ...prev, type: v }))}>
                 <SelectTrigger><SelectValue /></SelectTrigger>
                 <SelectContent>
                   <SelectItem value="home">Home</SelectItem>
                   <SelectItem value="work">Work</SelectItem>
                   <SelectItem value="favorite">Favorite</SelectItem>
                   <SelectItem value="other">Other</SelectItem>
                 </SelectContent>
               </Select>
             </div>
           </div>
           <DialogFooter className="flex gap-2">
             <Button variant="outline" onClick={() => { setShowAddDialog(false); resetForm(); }}>Cancel</Button>
             <Button onClick={handleAddLocation}>Save Location</Button>
           </DialogFooter>
         </DialogContent>
       </Dialog>
 
       <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
         <DialogContent className="max-w-sm mx-4">
           <DialogHeader><DialogTitle>Edit Location</DialogTitle></DialogHeader>
           <div className="space-y-4">
             <div className="space-y-2">
               <label className="text-sm font-medium text-foreground">Location Name *</label>
               <Input value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} />
             </div>
             <div className="space-y-2">
               <label className="text-sm font-medium text-foreground">Address *</label>
               <Input value={formData.address} onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))} />
             </div>
             <div className="space-y-2">
               <label className="text-sm font-medium text-foreground">Type</label>
               <Select value={formData.type} onValueChange={(v: 'home' | 'work' | 'favorite' | 'other') => setFormData(prev => ({ ...prev, type: v }))}>
                 <SelectTrigger><SelectValue /></SelectTrigger>
                 <SelectContent>
                   <SelectItem value="home">Home</SelectItem>
                   <SelectItem value="work">Work</SelectItem>
                   <SelectItem value="favorite">Favorite</SelectItem>
                   <SelectItem value="other">Other</SelectItem>
                 </SelectContent>
               </Select>
             </div>
           </div>
           <DialogFooter className="flex gap-2">
             <Button variant="outline" onClick={() => { setShowEditDialog(false); resetForm(); }}>Cancel</Button>
             <Button onClick={handleEditLocation}>Save Changes</Button>
           </DialogFooter>
         </DialogContent>
       </Dialog>
 
       <BottomNav />
     </div>
   );
 };