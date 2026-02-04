import { useState } from 'react';
import { ArrowLeft, Search, User, MoreVertical, CheckCircle, XCircle, Eye, History } from 'lucide-react';
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
} from '@/components/ui/dialog';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { mockAdminUsers, AdminUser } from '@/data/adminMockData';

export const UserManagement = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [users, setUsers] = useState<AdminUser[]>(mockAdminUsers);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleUserStatus = (userId: string) => {
    setUsers(prev =>
      prev.map(user =>
        user.id === userId
          ? { ...user, status: user.status === 'active' ? 'inactive' : 'active' }
          : user
      )
    );
    const user = users.find(u => u.id === userId);
    toast({
      title: user?.status === 'active' ? "User Deactivated" : "User Activated",
      description: `${user?.name} has been ${user?.status === 'active' ? 'deactivated' : 'activated'}.`,
    });
  };

  const viewUserDetails = (user: AdminUser) => {
    setSelectedUser(user);
    setShowUserDetails(true);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur-xl">
        <div className="flex items-center gap-3 px-4 py-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-bold text-foreground">User Management</h1>
        </div>
      </header>

      <main className="px-4 py-6 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="border-border">
            <CardContent className="p-3 text-center">
              <p className="text-xl font-bold text-foreground">{users.length}</p>
              <p className="text-xs text-muted-foreground">Total Users</p>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="p-3 text-center">
              <p className="text-xl font-bold text-green-500">
                {users.filter(u => u.status === 'active').length}
              </p>
              <p className="text-xs text-muted-foreground">Active</p>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="p-3 text-center">
              <p className="text-xl font-bold text-destructive">
                {users.filter(u => u.status === 'inactive').length}
              </p>
              <p className="text-xs text-muted-foreground">Inactive</p>
            </CardContent>
          </Card>
        </div>

        {/* User List */}
        <div className="space-y-3">
          {filteredUsers.map(user => (
            <Card key={user.id} className="border-border">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      user.status === 'active'
                        ? 'bg-green-500/10 text-green-500'
                        : 'bg-destructive/10 text-destructive'
                    }`}>
                      {user.status}
                    </span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => viewUserDetails(user)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => viewUserDetails(user)}>
                          <History className="h-4 w-4 mr-2" />
                          Booking History
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toggleUserStatus(user.id)}>
                          {user.status === 'active' ? (
                            <>
                              <XCircle className="h-4 w-4 mr-2" />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Activate
                            </>
                          )}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      {/* User Details Dialog */}
      <Dialog open={showUserDetails} onOpenChange={setShowUserDetails}>
        <DialogContent className="max-w-sm mx-4">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{selectedUser.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-secondary">
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="font-medium text-foreground">{selectedUser.phone}</p>
                </div>
                <div className="p-3 rounded-lg bg-secondary">
                  <p className="text-xs text-muted-foreground">Status</p>
                  <p className={`font-medium ${
                    selectedUser.status === 'active' ? 'text-green-500' : 'text-destructive'
                  }`}>
                    {selectedUser.status}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-secondary">
                  <p className="text-xs text-muted-foreground">Registered</p>
                  <p className="font-medium text-foreground">{selectedUser.registeredDate}</p>
                </div>
                <div className="p-3 rounded-lg bg-secondary">
                  <p className="text-xs text-muted-foreground">Total Bookings</p>
                  <p className="font-medium text-foreground">{selectedUser.bookingCount}</p>
                </div>
              </div>
              <Button
                className="w-full"
                variant={selectedUser.status === 'active' ? 'destructive' : 'default'}
                onClick={() => {
                  toggleUserStatus(selectedUser.id);
                  setShowUserDetails(false);
                }}
              >
                {selectedUser.status === 'active' ? 'Deactivate User' : 'Activate User'}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
