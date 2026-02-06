import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Users, Store, Wrench, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/types/auth";

const roleInfo: Record<UserRole, { icon: React.ElementType; label: string; color: string; credentials: string }> = {
  user: { icon: Users, label: 'Customer', color: 'bg-blue-500', credentials: 'user@rental.com / user123' },
  owner: { icon: Store, label: 'Shop Owner', color: 'bg-purple-500', credentials: 'owner@rental.com / owner123' },
  staff: { icon: Wrench, label: 'Staff', color: 'bg-green-500', credentials: 'staff@rental.com / staff123' },
  admin: { icon: Shield, label: 'Admin', color: 'bg-red-500', credentials: 'admin@rental.com / admin123' },
};

export const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    const result = login(email, password);
    
    if (result.success && result.redirectPath) {
      toast.success("Login successful!");
      navigate(result.redirectPath);
    } else {
      toast.error(result.error || "Login failed");
    }
  };

  const handleQuickLogin = (role: UserRole) => {
    const credentials: Record<UserRole, { email: string; password: string }> = {
      user: { email: 'user@rental.com', password: 'user123' },
      owner: { email: 'owner@rental.com', password: 'owner123' },
      staff: { email: 'staff@rental.com', password: 'staff123' },
      admin: { email: 'admin@rental.com', password: 'admin123' },
    };

    const cred = credentials[role];
    const result = login(cred.email, cred.password);
    
    if (result.success && result.redirectPath) {
      toast.success(`Logged in as ${roleInfo[role].label}`);
      navigate(result.redirectPath);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="gradient-hero flex flex-1 flex-col justify-center px-6 py-8">
        <div className="mx-auto w-full max-w-sm animate-slide-up">
          {/* Logo */}
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary shadow-button">
              <svg
                className="h-8 w-8 text-primary-foreground"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-foreground">Welcome Back</h1>
            <p className="mt-2 text-muted-foreground">
              Sign in to your account
            </p>
          </div>

          {/* Quick Role Selection */}
          <div className="mb-6">
            <p className="text-sm font-medium text-muted-foreground mb-3 text-center">Quick Login (Demo)</p>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(roleInfo) as UserRole[]).map((role) => {
                const info = roleInfo[role];
                const Icon = info.icon;
                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => handleQuickLogin(role)}
                    className={`flex items-center gap-2 rounded-xl p-3 border-2 transition-all hover:scale-[1.02] active:scale-[0.98] ${
                      selectedRole === role 
                        ? 'border-primary bg-primary/10' 
                        : 'border-border bg-card hover:border-primary/50'
                    }`}
                  >
                    <div className={`rounded-lg p-2 ${info.color}`}>
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-foreground">{info.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className="h-px flex-1 bg-border" />
            <span className="text-sm text-muted-foreground">or login manually</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-14 rounded-2xl border-2 border-border bg-card pl-12 text-base transition-all focus:border-primary"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-14 rounded-2xl border-2 border-border bg-card pl-12 pr-12 text-base transition-all focus:border-primary"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            <Button type="submit" className="w-full" size="lg">
              Sign In
              <ArrowRight className="h-5 w-5" />
            </Button>
          </form>

          {/* Sign up link */}
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/signup" className="font-semibold text-primary hover:underline">
              Sign up
            </Link>
          </p>

          {/* Shop owner signup link */}
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Own a rental shop?{" "}
            <Link to="/shop-signup" className="font-semibold text-purple-500 hover:underline">
              Register as partner
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
