import { 
  LayoutDashboard, 
  Users, 
  Store, 
  Activity,
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  AlertTriangle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const stats = [
  { label: "Total Users", value: "2,847", change: "+12%", icon: Users, color: "text-blue-500" },
  { label: "Rental Shops", value: "156", change: "+8%", icon: Store, color: "text-purple-500" },
  { label: "Active Bookings", value: "423", change: "+23%", icon: Activity, color: "text-green-500" },
  { label: "Pending Approvals", value: "12", change: "-", icon: Clock, color: "text-orange-500" },
];

const pendingOwners = [
  { id: "1", name: "John's Auto Rental", email: "john@autorental.com", date: "2024-02-01" },
  { id: "2", name: "City Bikes Hub", email: "info@citybikes.com", date: "2024-02-02" },
  { id: "3", name: "Premium Rides Co", email: "contact@premiumrides.com", date: "2024-02-03" },
];

const recentActivity = [
  { type: "user", message: "New user registered: Sarah M.", time: "5 mins ago" },
  { type: "booking", message: "Booking #4521 completed", time: "12 mins ago" },
  { type: "shop", message: "SpeedWheels updated pricing", time: "1 hour ago" },
  { type: "alert", message: "High traffic detected in Downtown area", time: "2 hours ago" },
];

export const AdminDashboard = () => {
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
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">Admin Panel</h1>
              <p className="text-xs text-muted-foreground">{user?.name}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            Logout
          </Button>
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

        {/* Pending Approvals */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-500" />
              Pending Owner Approvals
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingOwners.map((owner) => (
              <div key={owner.id} className="flex items-center justify-between p-3 rounded-xl bg-secondary/50">
                <div>
                  <p className="font-medium text-foreground text-sm">{owner.name}</p>
                  <p className="text-xs text-muted-foreground">{owner.email}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-green-500 hover:bg-green-500/10">
                    <CheckCircle className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-500 hover:bg-red-500/10">
                    <XCircle className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start gap-3 pb-3 border-b border-border last:border-0 last:pb-0">
                <div className={`mt-1 h-2 w-2 rounded-full ${
                  activity.type === 'alert' ? 'bg-orange-500' : 'bg-primary'
                }`} />
                <div className="flex-1">
                  <p className="text-sm text-foreground">{activity.message}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Button variant="outline" className="h-auto py-4 flex-col gap-2">
            <Users className="h-5 w-5" />
            <span className="text-sm">Manage Users</span>
          </Button>
          <Button variant="outline" className="h-auto py-4 flex-col gap-2">
            <Store className="h-5 w-5" />
            <span className="text-sm">View Shops</span>
          </Button>
        </div>
      </main>
    </div>
  );
};
