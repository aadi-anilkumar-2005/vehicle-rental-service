import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Users, MoreVertical, Edit, Power, Trash2, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
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
import { useAuth } from '@/contexts/AuthContext';

interface StaffMember {
  id: string;
  user_id: string;
  shop_id: string | null;
  is_active: boolean;
  profile?: { name: string; email: string; phone: string | null };
  shop?: { name: string } | null;
}

interface DbShop { id: string; name: string; }

export const StaffManagement = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [shops, setShops] = useState<DbShop[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', password: '', shopId: '',
  });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    const [staffRes, shopRes] = await Promise.all([
      supabase.from('staff').select('*, profile:profiles!staff_user_id_fkey(name, email, phone), shop:shops!staff_shop_id_fkey(name)').order('created_at', { ascending: false }),
      supabase.from('shops').select('id, name'),
    ]);
    
    // If the join doesn't work due to missing FK names, fetch profiles separately
    if (staffRes.error) {
      const basicStaff = await supabase.from('staff').select('*').order('created_at', { ascending: false });
      const staffData = basicStaff.data || [];
      
      // Fetch profiles for each staff member
      const enriched: StaffMember[] = [];
      for (const s of staffData) {
        const { data: profile } = await supabase.from('profiles').select('name, email, phone').eq('user_id', s.user_id).maybeSingle();
        const shop = (shopRes.data || []).find(sh => sh.id === s.shop_id);
        enriched.push({ ...s, profile: profile || undefined, shop: shop || null });
      }
      setStaffList(enriched);
    } else {
      setStaffList((staffRes.data || []) as unknown as StaffMember[]);
    }
    
    setShops(shopRes.data || []);
    setLoading(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', phone: '', password: '', shopId: '' });
  };

  const handleAddStaff = async () => {
    if (!formData.name || !formData.email || !formData.password || !user) {
      toast({ title: 'Error', description: 'Please fill in all required fields.', variant: 'destructive' });
      return;
    }
    if (formData.password.length < 6) {
      toast({ title: 'Error', description: 'Password must be at least 6 characters.', variant: 'destructive' });
      return;
    }
    setSaving(true);

    // Create user account via Supabase Auth signup
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: formData.email.trim(),
      password: formData.password,
      options: {
        data: { name: formData.name.trim(), role: 'staff' },
      },
    });

    if (signUpError || !signUpData.user) {
      setSaving(false);
      toast({ title: 'Error', description: signUpError?.message || 'Failed to create staff account.', variant: 'destructive' });
      return;
    }

    // Create staff record linking to the new user
    const { error: staffError } = await supabase.from('staff').insert({
      user_id: signUpData.user.id,
      owner_id: user.id,
      shop_id: formData.shopId || null,
    });

    setSaving(false);
    if (staffError) {
      toast({ title: 'Error', description: staffError.message, variant: 'destructive' });
      return;
    }

    toast({ title: 'Staff Added', description: `${formData.name} has been added. They will receive a confirmation email.` });
    setShowAddDialog(false);
    resetForm();
    fetchData();
  };

  const handleEditStaff = async () => {
    if (!selectedStaff) return;
    setSaving(true);
    const { error } = await supabase.from('staff').update({
      shop_id: formData.shopId || null,
    }).eq('id', selectedStaff.id);
    setSaving(false);
    if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
    toast({ title: 'Staff Updated' });
    setShowEditDialog(false);
    setSelectedStaff(null);
    resetForm();
    fetchData();
  };

  const openEditDialog = (staff: StaffMember) => {
    setSelectedStaff(staff);
    setFormData({
      name: staff.profile?.name || '', email: staff.profile?.email || '',
      phone: staff.profile?.phone || '', password: '', shopId: staff.shop_id || '',
    });
    setShowEditDialog(true);
  };

  const toggleStaffStatus = async (staff: StaffMember) => {
    const { error } = await supabase.from('staff').update({ is_active: !staff.is_active }).eq('id', staff.id);
    if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
    toast({ title: staff.is_active ? 'Staff Deactivated' : 'Staff Activated' });
    fetchData();
  };

  const deleteStaff = async (staff: StaffMember) => {
    const { error } = await supabase.from('staff').delete().eq('id', staff.id);
    if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
    toast({ title: 'Staff Removed', variant: 'destructive' });
    fetchData();
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur-xl">
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/owner')}><ArrowLeft className="h-5 w-5" /></Button>
            <h1 className="text-lg font-bold text-foreground">Staff Management</h1>
          </div>
          <Button size="sm" onClick={() => setShowAddDialog(true)}><Plus className="h-4 w-4 mr-1" />Add Staff</Button>
        </div>
      </header>

      <main className="px-4 py-6 space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <Card className="border-border"><CardContent className="p-3 text-center">
            <p className="text-xl font-bold text-foreground">{staffList.length}</p>
            <p className="text-xs text-muted-foreground">Total Staff</p>
          </CardContent></Card>
          <Card className="border-border"><CardContent className="p-3 text-center">
            <p className="text-xl font-bold text-green-500">{staffList.filter(s => s.is_active).length}</p>
            <p className="text-xs text-muted-foreground">Active</p>
          </CardContent></Card>
          <Card className="border-border"><CardContent className="p-3 text-center">
            <p className="text-xl font-bold text-foreground">{staffList.filter(s => !s.is_active).length}</p>
            <p className="text-xs text-muted-foreground">Inactive</p>
          </CardContent></Card>
        </div>

        {loading ? (
          <p className="text-center text-muted-foreground py-8">Loading staff...</p>
        ) : staffList.length === 0 ? (
          <Card className="border-border"><CardContent className="p-8 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No staff members yet</p>
            <Button className="mt-4" onClick={() => setShowAddDialog(true)}><Plus className="h-4 w-4 mr-1" />Add Your First Staff</Button>
          </CardContent></Card>
        ) : (
          staffList.map(staff => (
            <Card key={staff.id} className="border-border">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                      <Users className="h-6 w-6 text-green-500" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground">{staff.profile?.name || 'Unknown'}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${staff.is_active ? 'bg-green-500/10 text-green-500' : 'bg-destructive/10 text-destructive'}`}>
                          {staff.is_active ? 'active' : 'inactive'}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">{staff.shop?.name || 'No shop assigned'}</p>
                      <span className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <Mail className="h-3 w-3" />{staff.profile?.email || ''}
                      </span>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEditDialog(staff)}><Edit className="h-4 w-4 mr-2" />Edit</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toggleStaffStatus(staff)}><Power className="h-4 w-4 mr-2" />{staff.is_active ? 'Deactivate' : 'Activate'}</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive" onClick={() => deleteStaff(staff)}><Trash2 className="h-4 w-4 mr-2" />Remove</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </main>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-sm mx-4">
          <DialogHeader><DialogTitle>Add New Staff</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><label className="text-sm font-medium text-foreground">Full Name *</label>
              <Input value={formData.name} onChange={(e) => handleInputChange('name', e.target.value)} placeholder="Enter staff name" /></div>
            <div className="space-y-2"><label className="text-sm font-medium text-foreground">Email *</label>
              <Input type="email" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} placeholder="Enter email" /></div>
            <div className="space-y-2"><label className="text-sm font-medium text-foreground">Phone</label>
              <Input value={formData.phone} onChange={(e) => handleInputChange('phone', e.target.value)} placeholder="Enter phone" /></div>
            <div className="space-y-2"><label className="text-sm font-medium text-foreground">Password *</label>
              <Input type="password" value={formData.password} onChange={(e) => handleInputChange('password', e.target.value)} placeholder="Min 6 characters" /></div>
            <div className="space-y-2"><label className="text-sm font-medium text-foreground">Assign to Shop</label>
              <Select value={formData.shopId} onValueChange={(v) => handleInputChange('shopId', v)}>
                <SelectTrigger><SelectValue placeholder="Select a shop" /></SelectTrigger>
                <SelectContent>{shops.map(shop => (<SelectItem key={shop.id} value={shop.id}>{shop.name}</SelectItem>))}</SelectContent>
              </Select></div>
          </div>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => { setShowAddDialog(false); resetForm(); }}>Cancel</Button>
            <Button onClick={handleAddStaff} disabled={saving}>{saving ? 'Adding...' : 'Add Staff'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-sm mx-4">
          <DialogHeader><DialogTitle>Edit Staff</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><label className="text-sm font-medium text-foreground">Name</label>
              <Input value={formData.name} disabled className="opacity-60" /></div>
            <div className="space-y-2"><label className="text-sm font-medium text-foreground">Email</label>
              <Input value={formData.email} disabled className="opacity-60" /></div>
            <div className="space-y-2"><label className="text-sm font-medium text-foreground">Assign to Shop</label>
              <Select value={formData.shopId} onValueChange={(v) => handleInputChange('shopId', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{shops.map(shop => (<SelectItem key={shop.id} value={shop.id}>{shop.name}</SelectItem>))}</SelectContent>
              </Select></div>
          </div>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => { setShowEditDialog(false); resetForm(); }}>Cancel</Button>
            <Button onClick={handleEditStaff} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
