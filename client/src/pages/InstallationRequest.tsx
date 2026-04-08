import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Package, MapPin, Calendar, CheckCircle2 } from "lucide-react";
import LocationPicker from "@/components/LocationPicker";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import LandingLayout from "@/components/LandingLayout";

export default function InstallationRequest() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    county: "",
    estateName: "",
    apartmentName: "",
    latitude: "",
    longitude: "",
    establishmentStatus: "new" as "new" | "existing",
    establishmentType: "standalone" as "standalone" | "apartments" | "common_area" | "business_establishment",
    preferredDate: "",
    notes: "",
  });

  const installationMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return await apiRequest("POST", "/api/installation-requests", data);
    },
    onSuccess: () => {
      toast({
        title: "Request Submitted!",
        description: "We'll contact you within 24 hours to schedule your installation.",
      });
      setLocation("/");
    },
    onError: (error: Error) => {
      toast({
        title: "Submission Failed",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    installationMutation.mutate(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleLocationChange = (lat: string, lng: string) => {
    setFormData((prev) => ({
      ...prev,
      latitude: lat,
      longitude: lng,
    }));
  };

  return (
    <LandingLayout>
    <div className="bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <div className="bg-primary text-primary-foreground py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-2xl mb-4">
              <Package className="text-4xl" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Request Smart Box Installation</h1>
            <p className="text-lg opacity-90">
              Get your own secure smart lockbox delivered and installed at your location
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="bg-card rounded-2xl shadow-lg p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div>
                <h2 className="text-2xl font-bold mb-4">Personal Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
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
                    <Label htmlFor="lastName">Last Name *</Label>
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
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
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
                    <Label htmlFor="phone">Phone Number *</Label>
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
                </div>
              </div>

              {/* Installation Location */}
              <div>
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <MapPin className="w-6 h-6" />
                  Installation Location
                </h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="county">County *</Label>
                      <Input
                        id="county"
                        name="county"
                        type="text"
                        placeholder="e.g., Nairobi"
                        value={formData.county}
                        onChange={handleChange}
                        required
                        data-testid="input-county"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="estateName">Estate Name *</Label>
                      <Input
                        id="estateName"
                        name="estateName"
                        type="text"
                        placeholder="e.g., Westlands Estate"
                        value={formData.estateName}
                        onChange={handleChange}
                        required
                        data-testid="input-estateName"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="apartmentName">Apartment/Building Name (Optional)</Label>
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="establishmentStatus">Establishment Status *</Label>
                      <Select
                        value={formData.establishmentStatus}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, establishmentStatus: value as "new" | "existing" }))}
                      >
                        <SelectTrigger data-testid="select-establishmentStatus">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">New Establishment</SelectItem>
                          <SelectItem value="existing">Existing Establishment</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="establishmentType">Establishment Type *</Label>
                      <Select
                        value={formData.establishmentType}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, establishmentType: value as "standalone" | "apartments" | "common_area" | "business_establishment" }))}
                      >
                        <SelectTrigger data-testid="select-establishmentType">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="standalone">Stand Alone / Gated Community</SelectItem>
                          <SelectItem value="apartments">Apartments</SelectItem>
                          <SelectItem value="common_area">Common Area</SelectItem>
                          <SelectItem value="business_establishment">Business Establishment</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <LocationPicker
                    latitude={formData.latitude}
                    longitude={formData.longitude}
                    onLocationChange={handleLocationChange}
                  />
                </div>
              </div>

              {/* Additional Details */}
              <div>
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Calendar className="w-6 h-6" />
                  Installation Preferences
                </h2>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="preferredDate">Preferred Installation Date (Optional)</Label>
                    <Input
                      id="preferredDate"
                      name="preferredDate"
                      type="date"
                      value={formData.preferredDate}
                      onChange={handleChange}
                      min={new Date().toISOString().split('T')[0]}
                      data-testid="input-preferredDate"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="notes">Additional Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      name="notes"
                      placeholder="Any special instructions or requirements..."
                      value={formData.notes}
                      onChange={handleChange}
                      rows={4}
                      data-testid="input-notes"
                    />
                  </div>
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-muted/50 rounded-lg p-6">
                <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  What Happens Next?
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• We'll review your request within 24 hours</li>
                  <li>• Our team will contact you to confirm installation details</li>
                  <li>• Hardware fee payment will be processed before installation</li>
                  <li>• Professional installation at your chosen location</li>
                  <li>• Account setup and training on how to use your Last Link Box</li>
                </ul>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-12 text-base font-medium"
                disabled={installationMutation.isPending}
                data-testid="button-submit-request"
              >
                {installationMutation.isPending ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                    Submitting Request...
                  </div>
                ) : (
                  "Submit Installation Request"
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
    </LandingLayout>
  );
}
