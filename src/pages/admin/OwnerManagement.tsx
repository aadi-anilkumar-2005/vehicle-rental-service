import { useState } from 'react';
import { ArrowLeft, Search, Store, MoreVertical, CheckCircle, XCircle, Eye, Ban, Unlock } from 'lucide-react';
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
} from '@/components/ui/dialog';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { mockShopOwners, ShopOwner } from '@/data/adminMockData';

export const OwnerManagement = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [owners, setOwners] = useState<ShopOwner[]>(mockShopOwners);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOwner, setSelectedOwner] = useState<ShopOwner | null>(null);
  const [showOwnerDetails, setShowOwnerDetails] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  const filteredOwners = owners.filter(owner => {
    const matchesSearch = owner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      owner.email.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeTab === 'all') return matchesSearch;
    return matchesSearch && owner.status === activeTab;
  });

  const approveOwner = (ownerId: string) => {
    setOwners(prev =>
      prev.map(owner =>
        owner.id === ownerId ? { ...owner, status: 'approved' } : owner
      )
    );
    const owner = owners.find(o => o.id === ownerId);
    toast({
      title: "Owner Approved",
      description: `${owner?.name} has been approved successfully.`,
    });
  };

  const rejectOwner = (ownerId: string) => {
    setOwners(prev => prev.filter(owner => owner.id !== ownerId));
    toast({
      title: "Owner Rejected",
      description: "The owner application has been rejected.",
      variant: "destructive",
    });
  };

  const toggleBlockStatus = (ownerId: string) => {
    setOwners(prev =>
      prev.map(owner =>
        owner.id === ownerId
          ? { ...owner, status: owner.status === 'blocked' ? 'approved' : 'blocked' }
          : owner
      )
    );
    const owner = owners.find(o => o.id === ownerId);
    toast({
      title: owner?.status === 'blocked' ? "Owner Unblocked" : "Owner Blocked",
      description: `${owner?.name} has been ${owner?.status === 'blocked' ? 'unblocked' : 'blocked'}.`,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-500/10 text-green-500';
      case 'pending': return 'bg-orange-500/10 text-orange-500';
      case 'blocked': return 'bg-destructive/10 text-destructive';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur-xl">
        <div className="flex items-center gap-3 px-4 py-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-bold text-foreground">Owner Management</h1>
        </div>
      </header>

      <main className="px-4 py-6 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search owners..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="blocked">Blocked</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4 space-y-3">
            {filteredOwners.length === 0 ? (
              <Card className="border-border">
                <CardContent className="p-8 text-center">
                  <Store className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No owners found</p>
                </CardContent>
              </Card>
            ) : (
              filteredOwners.map(owner => (
                <Card key={owner.id} className="border-border">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                          <Store className="h-5 w-5 text-purple-500" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{owner.name}</p>
                          <p className="text-xs text-muted-foreground">{owner.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(owner.status)}`}>
                          {owner.status}
                        </span>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => {
                              setSelectedOwner(owner);
                              setShowOwnerDetails(true);
                            }}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            {owner.status === 'pending' && (
                              <>
                                <DropdownMenuItem onClick={() => approveOwner(owner.id)}>
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Approve
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => rejectOwner(owner.id)}>
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Reject
                                </DropdownMenuItem>
                              </>
                            )}
                            {owner.status === 'approved' && (
                              <DropdownMenuItem onClick={() => toggleBlockStatus(owner.id)}>
                                <Ban className="h-4 w-4 mr-2" />
                                Block
                              </DropdownMenuItem>
                            )}
                            {owner.status === 'blocked' && (
                              <DropdownMenuItem onClick={() => toggleBlockStatus(owner.id)}>
                                <Unlock className="h-4 w-4 mr-2" />
                                Unblock
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    {owner.status === 'pending' && (
                      <div className="flex gap-2 mt-3">
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() => approveOwner(owner.id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="flex-1"
                          onClick={() => rejectOwner(owner.id)}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Owner Details Dialog */}
      <Dialog open={showOwnerDetails} onOpenChange={setShowOwnerDetails}>
        <DialogContent className="max-w-sm mx-4">
          <DialogHeader>
            <DialogTitle>Owner Details</DialogTitle>
          </DialogHeader>
          {selectedOwner && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-16 w-16 rounded-full bg-purple-500/10 flex items-center justify-center">
                  <Store className="h-8 w-8 text-purple-500" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{selectedOwner.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedOwner.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-secondary">
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="font-medium text-foreground">{selectedOwner.phone}</p>
                </div>
                <div className="p-3 rounded-lg bg-secondary">
                  <p className="text-xs text-muted-foreground">Status</p>
                  <p className={`font-medium ${
                    selectedOwner.status === 'approved' ? 'text-green-500' :
                    selectedOwner.status === 'pending' ? 'text-orange-500' :
                    'text-destructive'
                  }`}>
                    {selectedOwner.status}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-secondary">
                  <p className="text-xs text-muted-foreground">Shops</p>
                  <p className="font-medium text-foreground">{selectedOwner.shopCount}</p>
                </div>
                <div className="p-3 rounded-lg bg-secondary">
                  <p className="text-xs text-muted-foreground">Revenue</p>
                  <p className="font-medium text-foreground">${selectedOwner.totalRevenue.toLocaleString()}</p>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-secondary">
                <p className="text-xs text-muted-foreground">Applied Date</p>
                <p className="font-medium text-foreground">{selectedOwner.appliedDate}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
