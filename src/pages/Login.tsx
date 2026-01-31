import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Chrome } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    toast.success("Login successful!");
    navigate("/");
  };

  const handleGoogleLogin = () => {
    toast.success("Google login successful!");
    navigate("/");
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Hero section */}
      <div className="gradient-hero flex flex-1 flex-col justify-center px-6 py-12">
        <div className="mx-auto w-full max-w-sm animate-slide-up">
          {/* Logo */}
          <div className="mb-8 text-center">
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
              Sign in to rent your next ride
            </p>
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

            <div className="flex justify-end">
              <Link
                to="/forgot-password"
                className="text-sm font-medium text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <Button type="submit" className="w-full" size="lg">
              Sign In
              <ArrowRight className="h-5 w-5" />
            </Button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-border" />
            <span className="text-sm text-muted-foreground">or continue with</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          {/* Social login */}
          <Button
            type="button"
            variant="glass"
            className="w-full"
            size="lg"
            onClick={handleGoogleLogin}
          >
            <Chrome className="h-5 w-5" />
            Continue with Google
          </Button>

          {/* Sign up link */}
          <p className="mt-8 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/signup" className="font-semibold text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
