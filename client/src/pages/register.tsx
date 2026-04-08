import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Lock, Truck, Bell, Shield, Zap, CheckCircle2, Eye, EyeOff, Home, Star, HelpCircle, Gift, Mail, Wrench } from "lucide-react";
import companyLogo from "@assets/Last_Link_Box_1769242505355.png";
import LocationPicker from "@/components/LocationPicker";

const navLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/features", label: "Features", icon: Star },
  { href: "/how-it-works", label: "How It Works", icon: HelpCircle },
  { href: "/benefits", label: "Benefits", icon: Gift },
  { href: "/contact", label: "Contact", icon: Mail },
  { href: "/installation-request", label: "Request Box", icon: Wrench },
];

export default function Register() {
  const [, setLocation] = useLocation();
  const { register, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
    estateName: "",
    latitude: "",
    longitude: "",
    apartmentName: "",
    boxCode: "",
  });

  // Residents have 4 steps, non-residents have 3 (skip location)
  const totalSteps = formData.role === "resident" ? 4 : 3;
  const displayStep = formData.role === "resident" ? currentStep : (currentStep === 4 ? 3 : currentStep);

  if (isAuthenticated) {
    setLocation("/dashboard");
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
      setLocation("/dashboard");
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

  const handleNext = () => {
    if (currentStep === 1) {
      if (!formData.firstName || !formData.lastName || !formData.username || !formData.email || !formData.phone) {
        toast({
          title: "Missing Information",
          description: "Please fill in all required fields before proceeding.",
          variant: "destructive",
        });
        return;
      }
    }
    if (currentStep === 2 && formData.role === "resident") {
      if (!formData.boxCode) {
        toast({
          title: "Missing Information",
          description: "Please fill in all required fields before proceeding.",
          variant: "destructive",
        });
        return;
      }
    }
    
    // Skip step 3 (location) for non-residents
    if (currentStep === 2 && formData.role !== "resident") {
      setCurrentStep(4); // Skip directly to password
    } else {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
    }
  };

  const handleBack = () => {
    // Skip step 3 (location) for non-residents when going back from step 4
    if (currentStep === 4 && formData.role !== "resident") {
      setCurrentStep(2);
    } else {
      setCurrentStep((prev) => Math.max(prev - 1, 1));
    }
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

      {/* Middle Section - Register Form */}
      <div className="flex-1 flex items-start justify-center py-8 px-6 lg:px-8 bg-background">
        <div className="w-full max-w-md py-6">
          {/* Form Header */}
          <div className="mb-6">
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-2" data-testid="register-title">
              Create Account
            </h2>
            <p className="text-sm text-muted-foreground" data-testid="register-description">
              Step {displayStep} of {totalSteps} - Join the Last Link Box system today
            </p>
          </div>

          {/* Step Indicator - Dynamic based on role */}
          <div className="mb-6">
            {formData.role === "resident" ? (
              // 4-step indicator for residents
              <>
                <div className="flex items-center justify-between">
                  {[1, 2, 3, 4].map((step) => (
                    <div key={step} className="flex items-center flex-1">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center font-semibold text-sm ${
                        step <= currentStep ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                      }`}>
                        {step}
                      </div>
                      {step < 4 && (
                        <div className={`flex-1 h-1 mx-1 ${
                          step < currentStep ? 'bg-primary' : 'bg-muted'
                        }`}></div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-4 gap-1 mt-2 text-xs text-muted-foreground text-center">
                  <span>Basic Info</span>
                  <span>Account</span>
                  <span>Location</span>
                  <span>Password</span>
                </div>
              </>
            ) : (
              // 3-step indicator for non-residents
              <>
                <div className="flex items-center justify-between">
                  {[1, 2, 3].map((step) => (
                    <div key={step} className="flex items-center flex-1">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                        step <= displayStep ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                      }`}>
                        {step}
                      </div>
                      {step < 3 && (
                        <div className={`flex-1 h-1 mx-2 ${
                          step < displayStep ? 'bg-primary' : 'bg-muted'
                        }`}></div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                  <span>Basic Info</span>
                  <span>Account</span>
                  <span>Password</span>
                </div>
              </>
            )}
          </div>

          {/* Register Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
              <>
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
              </>
            )}

            {/* Step 2: Account Details */}
            {currentStep === 2 && (
              <>
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
                      <Label htmlFor="estateName">Estate Name</Label>
                      <Input
                        id="estateName"
                        name="estateName"
                        type="text"
                        placeholder="e.g., Westlands Estate"
                        value={formData.estateName}
                        onChange={handleChange}
                        data-testid="input-estateName"
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
                  </>
                )}
              </>
            )}

            {/* Step 3: Location */}
            {currentStep === 3 && formData.role === "resident" && (
              <>
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-foreground mb-2">Select Your Location</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Pin your exact location on the map for accurate delivery
                  </p>
                </div>
                <LocationPicker
                  latitude={formData.latitude}
                  longitude={formData.longitude}
                  onLocationChange={handleLocationChange}
                />
              </>
            )}

            {/* Step 4: Password */}
            {currentStep === 4 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className="pr-10"
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
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      className="pr-10"
                      data-testid="input-confirmPassword"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      data-testid="button-toggle-confirm-password"
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-3 pt-4">
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  className="flex-1 h-11 text-base font-medium"
                  data-testid="button-back"
                >
                  Back
                </Button>
              )}
              
              {currentStep < totalSteps ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  className="flex-1 h-11 text-base font-medium"
                  data-testid="button-next"
                >
                  Next
                </Button>
              ) : (
                <Button
                  type="submit"
                  className="flex-1 h-11 text-base font-medium"
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
              )}
            </div>
          </form>

          {/* Sign In Link */}
          <div className="mt-4 text-center">
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
          <div className="mt-4 pt-4 border-t border-border">
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
