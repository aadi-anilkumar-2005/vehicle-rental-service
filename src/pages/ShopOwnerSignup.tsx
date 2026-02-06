import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, ArrowRight, User, Phone, Store, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export const ShopOwnerSignup = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    shopName: "",
    shopAddress: "",
  });

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password || !formData.shopName) {
      toast.error("Please fill in all required fields");
      return;
    }
    toast.success("Application submitted! We'll review and get back to you soon.");
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="gradient-hero flex flex-1 flex-col justify-center px-6 py-12">
        <div className="mx-auto w-full max-w-sm animate-slide-up">
          {/* Logo */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-500 shadow-button">
              <Store className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Become a Partner</h1>
            <p className="mt-2 text-muted-foreground">
              Register your rental shop with us
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="relative">
              <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Owner name *"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="h-14 rounded-2xl border-2 border-border bg-card pl-12 text-base transition-all focus:border-primary"
              />
            </div>

            <div className="relative">
              <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="email"
                placeholder="Email address *"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="h-14 rounded-2xl border-2 border-border bg-card pl-12 text-base transition-all focus:border-primary"
              />
            </div>

            <div className="relative">
              <Phone className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="tel"
                placeholder="Phone number"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="h-14 rounded-2xl border-2 border-border bg-card pl-12 text-base transition-all focus:border-primary"
              />
            </div>

            <div className="relative">
              <Store className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Shop/Business name *"
                value={formData.shopName}
                onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                className="h-14 rounded-2xl border-2 border-border bg-card pl-12 text-base transition-all focus:border-primary"
              />
            </div>

            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Shop address"
                value={formData.shopAddress}
                onChange={(e) => setFormData({ ...formData, shopAddress: e.target.value })}
                className="h-14 rounded-2xl border-2 border-border bg-card pl-12 text-base transition-all focus:border-primary"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Create password *"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
              Submit Application
              <ArrowRight className="h-5 w-5" />
            </Button>
          </form>

          {/* Info */}
          <div className="mt-6 p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
            <p className="text-sm text-foreground">
              <strong>What happens next?</strong>
            </p>
            <ul className="mt-2 text-xs text-muted-foreground space-y-1">
              <li>• Our team will review your application</li>
              <li>• You'll receive approval within 24-48 hours</li>
              <li>• Once approved, you can add vehicles and start earning</li>
            </ul>
          </div>

          {/* Login link */}
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-primary hover:underline">
              Sign in
            </Link>
          </p>

          {/* Customer signup link */}
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Want to rent a vehicle?{" "}
            <Link to="/signup" className="font-semibold text-primary hover:underline">
              Sign up as customer
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
