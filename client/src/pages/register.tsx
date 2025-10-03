import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Package, Lock, Truck, Bell, Shield, Zap, CheckCircle2 } from "lucide-react";
import LocationPicker from "@/components/LocationPicker";
import { AnimatedCounter } from "@/components/AnimatedCounter";

export default function Register() {
  const [, setLocation] = useLocation();
  const { register, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    phone: "",
    role: "resident" as "resident" | "courier" | "admin",
    county: "",
    constituency: "",
    latitude: "",
    longitude: "",
    apartmentName: "",
    boxCode: "",
  });

  if (isAuthenticated) {
    setLocation("/");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      const { confirmPassword, ...submitData } = formData;
      await register(submitData);
      toast({
        title: "Account Created!",
        description: "Your account has been created successfully.",
      });
      setLocation("/");
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message || "Please check your information and try again.",
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

  const handleRoleChange = (value: "resident" | "courier" | "admin") => {
    setFormData((prev) => ({ ...prev, role: value }));
  };

  const handleLocationChange = (lat: string, lng: string) => {
    setFormData((prev) => ({
      ...prev,
      latitude: lat,
      longitude: lng,
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
    <div className="min-h-screen flex">
      {/* Left Side - Information Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary/95 to-primary/90 text-primary-foreground p-12 flex-col justify-between relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10">
          {/* Logo and Brand */}
          <div className="flex items-center gap-3 mb-12">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <Package className="text-3xl" />
            </div>
            <div>
              <h1 className="font-bold text-2xl">Smart P.O Box</h1>
              <p className="text-sm opacity-90">Last Mile Postal System</p>
            </div>
          </div>

          {/* Main Heading */}
          <div className="mb-12">
            <h2 className="text-4xl font-bold leading-tight mb-4">
              Revolutionizing Last-Mile Delivery
            </h2>
            <p className="text-lg opacity-90 leading-relaxed">
              Secure, automated parcel delivery with smart lockboxes. Experience the future of package management with real-time tracking, instant notifications, and unmatched security.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="flex items-start gap-4 p-4 rounded-xl bg-white/10 backdrop-blur-sm hover:bg-white/15 transition-all duration-300"
                >
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon className="text-xl" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">{feature.title}</h3>
                    <p className="text-sm opacity-80">{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Stats with Animated Counters */}
        <div className="relative z-10 grid grid-cols-3 gap-8 pt-8 border-t border-white/20">
          <div>
            <div className="text-3xl font-bold mb-1">
              <AnimatedCounter end={99.9} decimals={1} suffix="%" />
            </div>
            <div className="text-sm opacity-80">Uptime</div>
          </div>
          <div>
            <div className="text-3xl font-bold mb-1">
              <AnimatedCounter end={24} suffix="/7" />
            </div>
            <div className="text-sm opacity-80">Support</div>
          </div>
          <div>
            <div className="text-3xl font-bold mb-1">
              <AnimatedCounter end={100} suffix="%" />
            </div>
            <div className="text-sm opacity-80">Secure</div>
          </div>
        </div>
      </div>

      {/* Right Side - Register Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background overflow-y-auto">
        <div className="w-full max-w-md py-8">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
              <Package className="text-primary-foreground text-2xl" />
            </div>
            <div>
              <h1 className="font-bold text-xl text-foreground">Smart P.O Box</h1>
              <p className="text-xs text-muted-foreground">Last Mile Postal System</p>
            </div>
          </div>

          {/* Form Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-2" data-testid="register-title">
              Create Account
            </h2>
            <p className="text-muted-foreground" data-testid="register-description">
              Join the Smart P.O Box system today
            </p>
          </div>

          {/* Register Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  type="text"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  data-testid="input-firstName"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  type="text"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  data-testid="input-lastName"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                type="text"
                placeholder="johndoe"
                value={formData.username}
                onChange={handleChange}
                required
                data-testid="input-username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                data-testid="input-email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="+254 700 000 000"
                value={formData.phone}
                onChange={handleChange}
                required
                data-testid="input-phone"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Account Type</Label>
              <Select value={formData.role} onValueChange={handleRoleChange}>
                <SelectTrigger data-testid="select-role">
                  <SelectValue placeholder="Select account type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="resident">Resident</SelectItem>
                  <SelectItem value="courier">Courier</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.role === "resident" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="boxCode">Smart Box Code</Label>
                  <Input
                    id="boxCode"
                    name="boxCode"
                    type="text"
                    placeholder="e.g., KB-2341"
                    value={formData.boxCode}
                    onChange={handleChange}
                    required
                    data-testid="input-boxCode"
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter the unique code on your smart box
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="county">County</Label>
                  <Input
                    id="county"
                    name="county"
                    type="text"
                    placeholder="e.g., Nairobi"
                    value={formData.county}
                    onChange={handleChange}
                    data-testid="input-county"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="constituency">Constituency</Label>
                  <Input
                    id="constituency"
                    name="constituency"
                    type="text"
                    placeholder="e.g., Westlands"
                    value={formData.constituency}
                    onChange={handleChange}
                    data-testid="input-constituency"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apartmentName">Apartment Name</Label>
                  <Input
                    id="apartmentName"
                    name="apartmentName"
                    type="text"
                    placeholder="e.g., Riverside Apartments"
                    value={formData.apartmentName}
                    onChange={handleChange}
                    data-testid="input-apartmentName"
                  />
                </div>
                <LocationPicker
                  latitude={formData.latitude}
                  longitude={formData.longitude}
                  onLocationChange={handleLocationChange}
                />
              </>
            )}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
                data-testid="input-password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                data-testid="input-confirmPassword"
              />
            </div>
            <Button
              type="submit"
              className="w-full h-12 text-base font-medium"
              disabled={isLoading}
              data-testid="button-register"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                  Creating Account...
                </div>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          {/* Sign In Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login">
                <Button
                  variant="link"
                  className="p-0 h-auto font-semibold text-primary"
                  data-testid="link-login"
                >
                  Sign in
                </Button>
              </Link>
            </p>
          </div>

          {/* Trust Indicators */}
          <div className="mt-8 pt-8 border-t border-border">
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

          {/* Mobile Stats - Only visible on mobile */}
          <div className="lg:hidden mt-8 pt-8 border-t border-border">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary mb-1">
                  <AnimatedCounter end={99.9} decimals={1} suffix="%" />
                </div>
                <div className="text-xs text-muted-foreground">Uptime</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary mb-1">
                  <AnimatedCounter end={24} suffix="/7" />
                </div>
                <div className="text-xs text-muted-foreground">Support</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary mb-1">
                  <AnimatedCounter end={100} suffix="%" />
                </div>
                <div className="text-xs text-muted-foreground">Secure</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
