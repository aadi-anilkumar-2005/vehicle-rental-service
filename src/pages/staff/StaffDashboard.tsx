import { 
  Wrench, 
  MapPin, 
  Navigation,
  CheckCircle,
  Clock,
  Phone,
  ChevronRight,
  Truck,
  Package
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const stats = [
  { label: "Assigned Today", value: "5", icon: Package, color: "text-blue-500" },
  { label: "Completed", value: "3", icon: CheckCircle, color: "text-green-500" },
  { label: "Pending", value: "2", icon: Clock, color: "text-orange-500" },
];

const deliveryTasks = [
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

const pickupTasks = [
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

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const TaskCard = ({ task, isDelivery }: { task: typeof deliveryTasks[0], isDelivery: boolean }) => (
    <div className="p-4 rounded-xl bg-secondary/50 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          {isDelivery ? (
            <Truck className="h-4 w-4 text-blue-500" />
          ) : (
            <Package className="h-4 w-4 text-orange-500" />
          )}
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
            isDelivery ? 'bg-blue-500/10 text-blue-500' : 'bg-orange-500/10 text-orange-500'
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
        <Button size="sm" variant="outline" className="flex-1 gap-1">
          <Phone className="h-3 w-3" />
          Call
        </Button>
        <Button size="sm" variant="outline" className="flex-1 gap-1">
          <Navigation className="h-3 w-3" />
          Navigate
        </Button>
        <Button size="sm" className="flex-1">
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
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            Logout
          </Button>
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
            <CardTitle className="text-base flex items-center gap-2">
              <Truck className="h-4 w-4 text-blue-500" />
              Delivery Tasks
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {deliveryTasks.map((task) => (
              <TaskCard key={task.id} task={task} isDelivery={true} />
            ))}
          </CardContent>
        </Card>

        {/* Pickup Tasks */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Package className="h-4 w-4 text-orange-500" />
              Pickup Tasks
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pickupTasks.map((task) => (
              <TaskCard key={task.id} task={task} isDelivery={false} />
            ))}
          </CardContent>
        </Card>

        {/* Mock Map Preview */}
        <Card className="border-border overflow-hidden">
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
