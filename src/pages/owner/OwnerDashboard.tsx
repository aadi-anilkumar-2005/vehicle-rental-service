import { 
  Store, 
  Car, 
  Users, 
  Calendar,
  TrendingUp,
  DollarSign,
  Plus,
  ChevronRight,
  Star,
  User
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const stats = [
  { label: "Total Revenue", value: "$12,847", change: "+18%", icon: DollarSign, color: "text-green-500" },
  { label: "Active Bookings", value: "34", change: "+5%", icon: Calendar, color: "text-primary" },
  { label: "Total Vehicles", value: "48", change: "+2", icon: Car, color: "text-purple-500" },
  { label: "Staff Members", value: "8", change: "-", icon: Users, color: "text-orange-500" },
];

const shops = [
  { id: "1", name: "SpeedWheels Downtown", vehicles: 15, bookings: 12, rating: 4.8 },
  { id: "2", name: "SpeedWheels Midtown", vehicles: 20, bookings: 18, rating: 4.6 },
  { id: "3", name: "SpeedWheels Airport", vehicles: 13, bookings: 4, rating: 4.9 },
];

const recentBookings = [
  { id: "1", vehicle: "Toyota Camry", customer: "John D.", status: "Active", amount: "$89" },
  { id: "2", vehicle: "Honda Activa", customer: "Sarah M.", status: "Pending Pickup", amount: "$30" },
  { id: "3", vehicle: "BMW 3 Series", customer: "Mike R.", status: "Completed", amount: "$199" },
];

export const OwnerDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur-xl">
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500">
              <Store className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">Owner Dashboard</h1>
              <p className="text-xs text-muted-foreground">{user?.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigate('/owner/profile')}>
              <User className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="px-4 py-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="border-border">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  {stat.change !== "-" && (
                    <span className="text-xs font-medium text-green-500 flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      {stat.change}
                    </span>
                  )}
                </div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* My Shops */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">My Rental Shops</CardTitle>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 gap-1 text-primary"
                onClick={() => navigate('/owner/shops')}
              >
                <Plus className="h-4 w-4" />
                Add
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {shops.map((shop) => (
              <div
                key={shop.id}
                className="flex items-center justify-between p-3 rounded-xl bg-secondary/50 cursor-pointer hover:bg-secondary/70 transition-colors"
                onClick={() => navigate('/owner/shops')}
              >
                <div className="flex-1">
                  <p className="font-medium text-foreground text-sm">{shop.name}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-muted-foreground">{shop.vehicles} vehicles</span>
                    <span className="text-xs text-muted-foreground">{shop.bookings} bookings</span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                      {shop.rating}
                    </span>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Bookings */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Recent Bookings</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="text-primary"
                onClick={() => navigate('/owner/bookings')}
              >
                View All
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentBookings.map((booking) => (
              <div key={booking.id} className="flex items-center justify-between p-3 rounded-xl bg-secondary/50">
                <div>
                  <p className="font-medium text-foreground text-sm">{booking.vehicle}</p>
                  <p className="text-xs text-muted-foreground">{booking.customer}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-foreground text-sm">{booking.amount}</p>
                  <p className={`text-xs ${
                    booking.status === 'Active' ? 'text-green-500' :
                    booking.status === 'Pending Pickup' ? 'text-orange-500' :
                    'text-muted-foreground'
                  }`}>{booking.status}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Button
            variant="outline"
            className="h-auto py-4 flex-col gap-2"
            onClick={() => navigate('/owner/vehicles')}
          >
            <Car className="h-5 w-5" />
            <span className="text-sm">Manage Vehicles</span>
          </Button>
          <Button
            variant="outline"
            className="h-auto py-4 flex-col gap-2"
            onClick={() => navigate('/owner/staff')}
          >
            <Users className="h-5 w-5" />
            <span className="text-sm">Manage Staff</span>
          </Button>
        </div>
      </main>
    </div>
  );
};