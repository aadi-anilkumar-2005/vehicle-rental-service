import { useNavigate } from "react-router-dom";
import {
  User,
  MapPin,
  CreditCard,
  Bell,
  HelpCircle,
  Shield,
  LogOut,
  ChevronRight,
  Star,
  Moon,
  Sun,
  FileText,
  Settings,
} from "lucide-react";
import { useTheme } from "next-themes";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const menuItems = [
  { icon: User, label: "Edit Profile", path: "/profile/edit" },
  { icon: FileText, label: "KYC Verification", path: "/profile/kyc" },
  { icon: MapPin, label: "Saved Locations", path: "/saved-locations" },
  { icon: CreditCard, label: "Payment Methods", path: "/payment-methods" },
  { icon: Bell, label: "Notifications", path: "/notifications" },
  { icon: Settings, label: "Settings", path: "/settings" },
  { icon: HelpCircle, label: "Help & Support", path: "/support" },
  { icon: Shield, label: "Privacy & Security", path: "/privacy" },
];

export const Profile = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
    toast.success(`Switched to ${theme === "dark" ? "light" : "dark"} mode`);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="gradient-primary px-4 pb-20 pt-12">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary-foreground">Profile</h1>
          <button
            onClick={toggleTheme}
            className="rounded-xl bg-primary-foreground/20 p-3 backdrop-blur-sm transition-colors hover:bg-primary-foreground/30"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5 text-primary-foreground" />
            ) : (
              <Moon className="h-5 w-5 text-primary-foreground" />
            )}
          </button>
        </div>
      </header>

      {/* Profile card */}
      <div className="px-4 -mt-16">
        <div className="rounded-2xl bg-card p-6 shadow-card animate-slide-up">
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl gradient-accent text-3xl font-bold text-accent-foreground">
              JD
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-foreground">John Doe</h2>
              <p className="text-muted-foreground">john.doe@example.com</p>
              <div className="mt-2 flex items-center gap-1">
                <Star className="h-4 w-4 fill-warning text-warning" />
                <span className="text-sm font-medium">4.9 Rating</span>
                <span className="text-sm text-muted-foreground">• 12 trips</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="rounded-xl bg-secondary p-4 text-center">
              <p className="text-2xl font-bold text-primary">12</p>
              <p className="text-xs text-muted-foreground">Total Rides</p>
            </div>
            <div className="rounded-xl bg-secondary p-4 text-center">
              <p className="text-2xl font-bold text-primary">$456</p>
              <p className="text-xs text-muted-foreground">Total Spent</p>
            </div>
            <div className="rounded-xl bg-secondary p-4 text-center">
              <p className="text-2xl font-bold text-primary">3</p>
              <p className="text-xs text-muted-foreground">Saved Places</p>
            </div>
          </div>
        </div>
      </div>

      {/* Menu */}
      <div className="px-4 py-6">
        <div className="rounded-2xl bg-card shadow-card overflow-hidden">
          {menuItems.map((item, index) => (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className="flex w-full items-center gap-4 border-b border-border p-4 transition-colors hover:bg-secondary/50 last:border-0"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="rounded-xl bg-secondary p-3">
                <item.icon className="h-5 w-5 text-primary" />
              </div>
              <span className="flex-1 text-left font-medium text-foreground">
                {item.label}
              </span>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </button>
          ))}
        </div>
      </div>

      {/* Logout */}
      <div className="px-4">
        <Button
          variant="outline"
          className="w-full border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
          size="lg"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5" />
          Logout
        </Button>
      </div>

      {/* Version */}
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Version 1.0.0
      </p>

      <BottomNav />
    </div>
  );
};
