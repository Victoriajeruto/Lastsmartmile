import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Lock, Truck, Bell, Shield, Zap, CheckCircle2, Eye, EyeOff, Home, Star, HelpCircle, Gift, Mail, Wrench } from "lucide-react";
import companyLogo from "@assets/Last_Link_Box_1769242505355.png";

const navLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/features", label: "Features", icon: Star },
  { href: "/how-it-works", label: "How It Works", icon: HelpCircle },
  { href: "/benefits", label: "Benefits", icon: Gift },
  { href: "/contact", label: "Contact", icon: Mail },
  { href: "/installation-request", label: "Request Box", icon: Wrench },
];

export default function Login() {
  const [, setLocation] = useLocation();
  const { login, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  if (isAuthenticated) {
    setLocation("/dashboard");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(formData.username, formData.password);
      toast({
        title: "Welcome back!",
        description: "You have been successfully logged in.",
      });
      setLocation("/dashboard");
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "Please check your credentials and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const features = [
    {
      icon: Lock,
      title: "Secure Smart Lockboxes",
      description: "State-of-the-art security with OTP and QR code access"
    },
    {
      icon: Truck,
      title: "Real-Time Tracking",
      description: "Track your deliveries from dispatch to your doorstep"
    },
    {
      icon: Bell,
      title: "Instant Notifications",
      description: "Get notified via SMS and in-app alerts for every delivery"
    },
    {
      icon: Shield,
      title: "24/7 Monitoring",
      description: "Tamper detection and battery monitoring for peace of mind"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Page Navigation Bar */}
      <nav className="bg-white border-b border-gray-100 px-4 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer">
              <img src={companyLogo} alt="Last Link Box" className="w-7 h-7 object-contain" />
              <span className="font-bold text-sm text-gray-900 hidden sm:block">Last Link Box</span>
            </div>
          </Link>
          <div className="flex items-center gap-0.5">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href}>
                <button
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:text-primary hover:bg-primary/5 transition-colors"
                  data-testid={`nav-link-${label.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">{label}</span>
                </button>
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Top Section - Hero Header with Teal Background */}
      <div className="bg-primary text-primary-foreground py-10 px-6 lg:py-12 lg:px-12 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-20 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          <div className="absolute top-10 right-20 w-64 h-64 bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center">
            {/* Logo and Brand - Centered */}
            <div className="flex items-center justify-center gap-4 mb-6">
              <img 
                src={companyLogo} 
                alt="Last Link Box" 
                className="w-24 h-24 object-contain drop-shadow-xl"
                data-testid="img-company-logo"
              />
              <div className="text-left">
                <h1 className="font-bold text-3xl tracking-tight">Last Link Box</h1>
                <p className="text-sm opacity-90">Smart Postal Delivery System</p>
              </div>
            </div>

            {/* Main Heading - Centered */}
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl lg:text-4xl font-bold leading-tight mb-3">
                Revolutionizing Last-Mile Delivery
              </h2>
              <p className="text-base lg:text-lg opacity-90 max-w-2xl mx-auto">
                Secure, automated parcel delivery with smart lockboxes. Experience the future of package management.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Section - Login Form */}
      <div className="flex-1 flex items-start justify-center py-8 px-6 lg:px-8 bg-background">
        <div className="w-full max-w-md">
          {/* Form Header */}
          <div className="mb-6">
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-2" data-testid="login-title">
              Welcome Back
            </h2>
            <p className="text-sm text-muted-foreground" data-testid="login-description">
              Sign in to access your Last Link Box dashboard
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium">
                Username
              </Label>
              <Input
                id="username"
                name="username"
                type="text"
                placeholder="Enter your username"
                value={formData.username}
                onChange={handleChange}
                required
                className="h-12"
                data-testid="input-username"
              />
              <p className="text-xs text-muted-foreground">
                Use your username to log in (not email)
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <Button
                  type="button"
                  variant="link"
                  className="p-0 h-auto text-xs text-primary"
                >
                  Forgot password?
                </Button>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="h-12 pr-10"
                  data-testid="input-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  data-testid="button-toggle-password"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 text-base font-medium"
              disabled={isLoading}
              data-testid="button-login"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                  Signing in...
                </div>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link href="/register">
                <Button
                  variant="link"
                  className="p-0 h-auto font-semibold text-primary"
                  data-testid="link-register"
                >
                  Sign up for free
                </Button>
              </Link>
            </p>
          </div>

          {/* Trust Indicators */}
          <div className="mt-6 pt-4 border-t border-border">
            <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Shield className="w-4 h-4" />
                <span>Secure Login</span>
              </div>
              <div className="flex items-center gap-1">
                <Zap className="w-4 h-4" />
                <span>Fast Access</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>Verified</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section - Features with Teal Background */}
      <div className="bg-primary text-primary-foreground py-8 px-6 lg:px-12 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute bottom-5 left-20 w-48 h-48 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-5 right-20 w-48 h-48 bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Features - Mobile (Horizontal Scroll) */}
          <div className="sm:hidden flex gap-3 overflow-x-auto pb-2">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="flex items-center gap-2 p-3 rounded-lg bg-white/10 backdrop-blur-sm whitespace-nowrap"
                >
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon className="text-base" />
                  </div>
                  <span className="font-semibold text-sm">{feature.title}</span>
                </div>
              );
            })}
          </div>
          
          {/* Features Grid - Desktop */}
          <div className="hidden sm:grid grid-cols-4 gap-4 lg:gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="flex flex-col items-center gap-2 p-4 lg:p-5 rounded-lg bg-white/10 backdrop-blur-sm hover:bg-white/15 transition-all duration-300 text-center"
                  title={feature.description}
                >
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                    <Icon className="text-xl" />
                  </div>
                  <h3 className="font-semibold text-sm">{feature.title}</h3>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
