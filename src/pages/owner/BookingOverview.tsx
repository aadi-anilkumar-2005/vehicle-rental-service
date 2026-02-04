import { ArrowLeft, Calendar, Car, DollarSign, Clock, CheckCircle, XCircle, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

interface OwnerBooking {
  id: string;
  vehicleName: string;
  customerName: string;
  customerPhone: string;
  startDate: string;
  endDate: string;
  amount: number;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  deliveryType: 'self-pickup' | 'home-delivery';
  returnType: 'return-to-shop' | 'schedule-pickup';
}

const mockBookings: OwnerBooking[] = [
  {
    id: 'ob1',
    vehicleName: 'Toyota Camry',
    customerName: 'John Davis',
    customerPhone: '+1 555-1234',
    startDate: '2024-02-15T10:00:00',
    endDate: '2024-02-16T10:00:00',
    amount: 89,
    status: 'active',
    deliveryType: 'home-delivery',
    returnType: 'schedule-pickup',
  },
  {
    id: 'ob2',
    vehicleName: 'Honda Civic',
    customerName: 'Sarah Miller',
    customerPhone: '+1 555-5678',
    startDate: '2024-02-16T09:00:00',
    endDate: '2024-02-16T18:00:00',
    amount: 75,
    status: 'pending',
    deliveryType: 'self-pickup',
    returnType: 'return-to-shop',
  },
  {
    id: 'ob3',
    vehicleName: 'BMW 3 Series',
    customerName: 'Mike Ross',
    customerPhone: '+1 555-9012',
    startDate: '2024-02-10T09:00:00',
    endDate: '2024-02-12T09:00:00',
    amount: 398,
    status: 'completed',
    deliveryType: 'home-delivery',
    returnType: 'schedule-pickup',
  },
  {
    id: 'ob4',
    vehicleName: 'Royal Enfield Classic',
    customerName: 'Emily Chen',
    customerPhone: '+1 555-3456',
    startDate: '2024-02-08T10:00:00',
    endDate: '2024-02-08T18:00:00',
    amount: 45,
    status: 'cancelled',
    deliveryType: 'self-pickup',
    returnType: 'return-to-shop',
  },
];

export const BookingOverview = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState<OwnerBooking | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const filteredBookings = mockBookings.filter(b => {
    if (activeTab === 'all') return true;
    return b.status === activeTab;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/10 text-green-500';
      case 'pending': return 'bg-orange-500/10 text-orange-500';
      case 'completed': return 'bg-primary/10 text-primary';
      case 'cancelled': return 'bg-destructive/10 text-destructive';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur-xl">
        <div className="flex items-center gap-3 px-4 py-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/owner')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-bold text-foreground">Booking Overview</h1>
        </div>
      </header>

      <main className="px-4 py-6 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-2">
          <Card className="border-border">
            <CardContent className="p-3 text-center">
              <p className="text-lg font-bold text-foreground">{mockBookings.length}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="p-3 text-center">
              <p className="text-lg font-bold text-green-500">
                {mockBookings.filter(b => b.status === 'active').length}
              </p>
              <p className="text-xs text-muted-foreground">Active</p>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="p-3 text-center">
              <p className="text-lg font-bold text-orange-500">
                {mockBookings.filter(b => b.status === 'pending').length}
              </p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="p-3 text-center">
              <p className="text-lg font-bold text-foreground">
                ${mockBookings.filter(b => b.status === 'completed').reduce((sum, b) => sum + b.amount, 0)}
              </p>
              <p className="text-xs text-muted-foreground">Revenue</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="completed">Done</TabsTrigger>
            <TabsTrigger value="cancelled">Cancel</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4 space-y-3">
            {filteredBookings.length === 0 ? (
              <Card className="border-border">
                <CardContent className="p-8 text-center">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No bookings found</p>
                </CardContent>
              </Card>
            ) : (
              filteredBookings.map(booking => (
                <Card key={booking.id} className="border-border">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Car className="h-4 w-4 text-primary" />
                          <p className="font-medium text-foreground">{booking.vehicleName}</p>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{booking.customerName}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                        <p className="text-lg font-bold text-green-500 mt-2">${booking.amount}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => {
                          setSelectedBooking(booking);
                          setShowDetails(true);
                        }}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Booking Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-sm mx-4">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary">
                <div className="flex items-center gap-2">
                  <Car className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">{selectedBooking.vehicleName}</p>
                    <p className="text-xs text-muted-foreground">Booking #{selectedBooking.id}</p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(selectedBooking.status)}`}>
                  {selectedBooking.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-secondary">
                  <p className="text-xs text-muted-foreground">Customer</p>
                  <p className="font-medium text-foreground">{selectedBooking.customerName}</p>
                  <p className="text-xs text-muted-foreground">{selectedBooking.customerPhone}</p>
                </div>
                <div className="p-3 rounded-lg bg-secondary">
                  <p className="text-xs text-muted-foreground">Amount</p>
                  <p className="text-xl font-bold text-green-500">${selectedBooking.amount}</p>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-secondary">
                <p className="text-xs text-muted-foreground mb-2">Schedule</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Start</p>
                    <p className="font-medium text-foreground">{formatDate(selectedBooking.startDate)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">End</p>
                    <p className="font-medium text-foreground">{formatDate(selectedBooking.endDate)}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-secondary">
                  <p className="text-xs text-muted-foreground">Delivery</p>
                  <p className="font-medium text-foreground capitalize">
                    {selectedBooking.deliveryType.replace('-', ' ')}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-secondary">
                  <p className="text-xs text-muted-foreground">Return</p>
                  <p className="font-medium text-foreground capitalize">
                    {selectedBooking.returnType.replace('-', ' ')}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
