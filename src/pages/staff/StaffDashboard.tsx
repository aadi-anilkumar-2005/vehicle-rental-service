import { 
  Wrench, 
  MapPin, 
  Navigation,
  CheckCircle,
  Clock,
  Phone,
  Truck,
  Package,
  User,
  ChevronRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const stats = [
  { label: "Assigned Today", value: "5", icon: Package, color: "text-primary" },
  { label: "Completed", value: "3", icon: CheckCircle, color: "text-green-500" },
  { label: "Pending", value: "2", icon: Clock, color: "text-orange-500" },
];

const initialDeliveryTasks = [
  { 
    id: "1", 
    type: "delivery",
    vehicle: "Toyota Camry", 
    customer: "John Davis",
    phone: "+1 555-1234",
    address: "123 Main St, Downtown",
    time: "10:00 AM",
    status: "pending"
  },
  { 
    id: "2", 
    type: "delivery",
    vehicle: "Honda Activa", 
    customer: "Sarah Miller",
    phone: "+1 555-5678",
    address: "456 Oak Ave, Midtown",
    time: "11:30 AM",
    status: "in_progress"
  },
];

const initialPickupTasks = [
  { 
    id: "3", 
    type: "pickup",
    vehicle: "BMW 3 Series", 
    customer: "Mike Ross",
    phone: "+1 555-9012",
    address: "789 Luxury Lane, Uptown",
    time: "2:00 PM",
    status: "pending"
  },
];

export const StaffDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [deliveryTasks, setDeliveryTasks] = useState(initialDeliveryTasks);
  const [pickupTasks, setPickupTasks] = useState(initialPickupTasks);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleCall = (phone: string, customer: string) => {
    toast({
      title: "Calling Customer",
      description: `Dialing ${customer} at ${phone}...`,
    });
  };

  const handleNavigate = (address: string) => {
    toast({
      title: "Opening Navigation",
      description: `Navigating to ${address}`,
    });
  };

  const markAsDelivered = (taskId: string) => {
    setDeliveryTasks(prev => prev.filter(t => t.id !== taskId));
    toast({
      title: "Vehicle Delivered",
      description: "Task completed successfully!",
    });
  };

  const markAsPickedUp = (taskId: string) => {
    setPickupTasks(prev => prev.filter(t => t.id !== taskId));
    toast({
      title: "Vehicle Picked Up",
      description: "Task completed successfully!",
    });
  };

  const TaskCard = ({ task, isDelivery }: { task: typeof initialDeliveryTasks[0], isDelivery: boolean }) => (
    <div className="p-4 rounded-xl bg-secondary/50 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          {isDelivery ? (
            <Truck className="h-4 w-4 text-primary" />
          ) : (
            <Package className="h-4 w-4 text-orange-500" />
          )}
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
            isDelivery ? 'bg-primary/10 text-primary' : 'bg-orange-500/10 text-orange-500'
          }`}>
            {isDelivery ? 'Delivery' : 'Pickup'}
          </span>
        </div>
        <span className="text-xs text-muted-foreground">{task.time}</span>
      </div>
      
      <div>
        <p className="font-semibold text-foreground">{task.vehicle}</p>
        <p className="text-sm text-muted-foreground">{task.customer}</p>
      </div>
      
      <div className="flex items-start gap-2">
        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
        <p className="text-sm text-muted-foreground">{task.address}</p>
      </div>
      
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          className="flex-1 gap-1"
          onClick={() => handleCall(task.phone, task.customer)}
        >
          <Phone className="h-3 w-3" />
          Call
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="flex-1 gap-1"
          onClick={() => handleNavigate(task.address)}
        >
          <Navigation className="h-3 w-3" />
          Navigate
        </Button>
        <Button
          size="sm"
          className="flex-1"
          onClick={() => isDelivery ? markAsDelivered(task.id) : markAsPickedUp(task.id)}
        >
          {isDelivery ? 'Delivered' : 'Picked Up'}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur-xl">
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500">
              <Wrench className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">Staff Dashboard</h1>
              <p className="text-xs text-muted-foreground">{user?.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigate('/staff/profile')}>
              <User className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="px-4 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {stats.map((stat) => (
            <Card key={stat.label} className="border-border">
              <CardContent className="p-3 text-center">
                <stat.icon className={`h-5 w-5 mx-auto mb-1 ${stat.color}`} />
                <p className="text-xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Delivery Tasks */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Truck className="h-4 w-4 text-primary" />
                Delivery Tasks
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="text-primary"
                onClick={() => navigate('/staff/tasks')}
              >
                View All
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {deliveryTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No pending deliveries</p>
            ) : (
              deliveryTasks.map((task) => (
                <TaskCard key={task.id} task={task} isDelivery={true} />
              ))
            )}
          </CardContent>
        </Card>

        {/* Pickup Tasks */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Package className="h-4 w-4 text-orange-500" />
                Pickup Tasks
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="text-primary"
                onClick={() => navigate('/staff/tasks')}
              >
                View All
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {pickupTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No pending pickups</p>
            ) : (
              pickupTasks.map((task) => (
                <TaskCard key={task.id} task={task} isDelivery={false} />
              ))
            )}
          </CardContent>
        </Card>

        {/* Mock Map Preview */}
        <Card
          className="border-border overflow-hidden cursor-pointer"
          onClick={() => navigate('/staff/tasks')}
        >
          <div className="h-48 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <div className="text-center">
              <MapPin className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="text-sm font-medium text-foreground">Task Locations Map</p>
              <p className="text-xs text-muted-foreground">Tap to view full map</p>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
};