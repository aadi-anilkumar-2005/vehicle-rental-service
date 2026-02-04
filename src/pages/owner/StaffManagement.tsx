import { useState } from 'react';
import { ArrowLeft, Plus, Users, MoreVertical, Edit, Power, Trash2, Phone, Mail, CheckCircle, Clock } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { mockOwnerStaff, mockOwnerShops, OwnerStaff } from '@/data/ownerMockData';

export const StaffManagement = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [staffList, setStaffList] = useState<OwnerStaff[]>(mockOwnerStaff);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<OwnerStaff | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    shopId: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', phone: '', shopId: '' });
  };

  const handleAddStaff = () => {
    if (!formData.name || !formData.email || !formData.phone) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const shop = mockOwnerShops.find(s => s.id === formData.shopId) || mockOwnerShops[0];
    const newStaff: OwnerStaff = {
      id: `st${Date.now()}`,
      shopId: formData.shopId || mockOwnerShops[0].id,
      shopName: shop.name,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      status: 'active',
      assignedTasks: 0,
      completedTasks: 0,
      joinedDate: new Date().toISOString().split('T')[0],
    };

    setStaffList(prev => [...prev, newStaff]);
    toast({
      title: "Staff Added",
      description: `${formData.name} has been added successfully.`,
    });
    setShowAddDialog(false);
    resetForm();
  };

  const handleEditStaff = () => {
    if (!selectedStaff) return;

    const shop = mockOwnerShops.find(s => s.id === formData.shopId);
    setStaffList(prev =>
      prev.map(s =>
        s.id === selectedStaff.id
          ? {
              ...s,
              name: formData.name,
              email: formData.email,
              phone: formData.phone,
              shopId: formData.shopId,
              shopName: shop?.name || s.shopName,
            }
          : s
      )
    );
    toast({
      title: "Staff Updated",
      description: `${formData.name} has been updated successfully.`,
    });
    setShowEditDialog(false);
    setSelectedStaff(null);
    resetForm();
  };

  const openEditDialog = (staff: OwnerStaff) => {
    setSelectedStaff(staff);
    setFormData({
      name: staff.name,
      email: staff.email,
      phone: staff.phone,
      shopId: staff.shopId,
    });
    setShowEditDialog(true);
  };

  const toggleStaffStatus = (staffId: string) => {
    setStaffList(prev =>
      prev.map(s =>
        s.id === staffId
          ? { ...s, status: s.status === 'active' ? 'inactive' : 'active' }
          : s
      )
    );
    const staff = staffList.find(s => s.id === staffId);
    toast({
      title: staff?.status === 'active' ? "Staff Deactivated" : "Staff Activated",
      description: `${staff?.name} has been ${staff?.status === 'active' ? 'deactivated' : 'activated'}.`,
    });
  };

  const deleteStaff = (staffId: string) => {
    const staff = staffList.find(s => s.id === staffId);
    setStaffList(prev => prev.filter(s => s.id !== staffId));
    toast({
      title: "Staff Removed",
      description: `${staff?.name} has been removed.`,
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
            <h1 className="text-lg font-bold text-foreground">Staff Management</h1>
          </div>
          <Button size="sm" onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Add Staff
          </Button>
        </div>
      </header>

      <main className="px-4 py-6 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="border-border">
            <CardContent className="p-3 text-center">
              <p className="text-xl font-bold text-foreground">{staffList.length}</p>
              <p className="text-xs text-muted-foreground">Total Staff</p>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="p-3 text-center">
              <p className="text-xl font-bold text-green-500">
                {staffList.filter(s => s.status === 'active').length}
              </p>
              <p className="text-xs text-muted-foreground">Active</p>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="p-3 text-center">
              <p className="text-xl font-bold text-foreground">
                {staffList.reduce((sum, s) => sum + s.assignedTasks, 0)}
              </p>
              <p className="text-xs text-muted-foreground">Tasks Today</p>
            </CardContent>
          </Card>
        </div>

        {/* Staff List */}
        {staffList.length === 0 ? (
          <Card className="border-border">
            <CardContent className="p-8 text-center">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No staff members yet</p>
              <Button className="mt-4" onClick={() => setShowAddDialog(true)}>
                <Plus className="h-4 w-4 mr-1" />
                Add Your First Staff
              </Button>
            </CardContent>
          </Card>
        ) : (
          staffList.map(staff => (
            <Card key={staff.id} className="border-border">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                      <Users className="h-6 w-6 text-green-500" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground">{staff.name}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          staff.status === 'active'
                            ? 'bg-green-500/10 text-green-500'
                            : 'bg-destructive/10 text-destructive'
                        }`}>
                          {staff.status}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">{staff.shopName}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {staff.email}
                        </span>
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
                      <DropdownMenuItem onClick={() => openEditDialog(staff)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toggleStaffStatus(staff.id)}>
                        <Power className="h-4 w-4 mr-2" />
                        {staff.status === 'active' ? 'Deactivate' : 'Activate'}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => deleteStaff(staff.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 mt-4 pt-3 border-t border-border">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-orange-500" />
                    <span className="text-sm text-foreground">{staff.assignedTasks} pending</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-foreground">{staff.completedTasks} completed</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </main>

      {/* Add Staff Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-sm mx-4">
          <DialogHeader>
            <DialogTitle>Add New Staff</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Full Name *</label>
              <Input
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter staff name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Email *</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Enter email address"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Phone *</label>
              <Input
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="Enter phone number"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Assign to Shop *</label>
              <Select value={formData.shopId} onValueChange={(v) => handleInputChange('shopId', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a shop" />
                </SelectTrigger>
                <SelectContent>
                  {mockOwnerShops.map(shop => (
                    <SelectItem key={shop.id} value={shop.id}>{shop.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => { setShowAddDialog(false); resetForm(); }}>
              Cancel
            </Button>
            <Button onClick={handleAddStaff}>
              Add Staff
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Staff Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-sm mx-4">
          <DialogHeader>
            <DialogTitle>Edit Staff</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Full Name *</label>
              <Input
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Email *</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Phone *</label>
              <Input
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Assign to Shop *</label>
              <Select value={formData.shopId} onValueChange={(v) => handleInputChange('shopId', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {mockOwnerShops.map(shop => (
                    <SelectItem key={shop.id} value={shop.id}>{shop.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => { setShowEditDialog(false); resetForm(); }}>
              Cancel
            </Button>
            <Button onClick={handleEditStaff}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
