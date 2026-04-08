import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Package, MapPin, Calendar, CheckCircle2, Wrench, Zap } from "lucide-react";
import LocationPicker from "@/components/LocationPicker";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import LandingLayout from "@/components/LandingLayout";

type RequestType = "installation" | "activation";

export default function InstallationRequest() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [requestType, setRequestType] = useState<RequestType>("installation");

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

  const [activationData, setActivationData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    boxId: "",
    county: "",
    estateName: "",
    notes: "",
  });

  const installationMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return await apiRequest("POST", "/api/installation-requests", data);
    },
    onSuccess: () => {
      toast({
        title: "Installation Request Submitted!",
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

  const activationMutation = useMutation({
    mutationFn: async (data: typeof activationData) => {
      return await apiRequest("POST", "/api/installation-requests", {
        ...data,
        establishmentStatus: "existing",
        establishmentType: "standalone",
        notes: `[ACTIVATION REQUEST] Box ID: ${data.boxId}. ${data.notes}`,
      });
    },
    onSuccess: () => {
      toast({
        title: "Activation Request Submitted!",
        description: "We'll contact you within 24 hours to activate your box.",
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleActivationChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setActivationData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleLocationChange = (lat: string, lng: string) => {
    setFormData((prev) => ({ ...prev, latitude: lat, longitude: lng }));
  };

  const handleInstallationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    installationMutation.mutate(formData);
  };

  const handleActivationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activationData.boxId) {
      toast({ title: "Missing Box ID", description: "Please enter your smart box ID.", variant: "destructive" });
      return;
    }
    activationMutation.mutate(activationData);
  };

  return (
    <LandingLayout>
      <div className="bg-gradient-to-br from-background via-background to-muted/20">

        {/* Header */}
        <div className="bg-primary text-primary-foreground py-10">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-white/20 rounded-2xl mb-4">
                <Package className="w-7 h-7" />
              </div>
              <h1 className="text-3xl font-bold mb-2">Smart Box Services</h1>
              <p className="text-base opacity-90">
                Request a new installation or activate your already-installed box
              </p>
            </div>
          </div>
        </div>

        {/* Two-option selector */}
        <div className="container mx-auto px-4 -mt-5">
          <div className="max-w-3xl mx-auto">
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRequestType("installation")}
                className={`flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all duration-200 text-left ${
                  requestType === "installation"
                    ? "border-primary bg-white shadow-lg shadow-primary/10"
                    : "border-gray-200 bg-white/70 hover:border-primary/40 hover:bg-white"
                }`}
                data-testid="option-installation"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  requestType === "installation" ? "bg-primary text-white" : "bg-gray-100 text-gray-500"
                }`}>
                  <Wrench className="w-6 h-6" />
                </div>
                <div>
                  <p className={`font-semibold text-sm ${requestType === "installation" ? "text-primary" : "text-gray-700"}`}>
                    Request Installation
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">New smart box at your location</p>
                </div>
                {requestType === "installation" && (
                  <div className="absolute top-3 right-3">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                  </div>
                )}
              </button>

              <button
                type="button"
                onClick={() => setRequestType("activation")}
                className={`flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all duration-200 text-left relative ${
                  requestType === "activation"
                    ? "border-primary bg-white shadow-lg shadow-primary/10"
                    : "border-gray-200 bg-white/70 hover:border-primary/40 hover:bg-white"
                }`}
                data-testid="option-activation"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  requestType === "activation" ? "bg-primary text-white" : "bg-gray-100 text-gray-500"
                }`}>
                  <Zap className="w-6 h-6" />
                </div>
                <div>
                  <p className={`font-semibold text-sm ${requestType === "activation" ? "text-primary" : "text-gray-700"}`}>
                    Request Activation
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">Activate your already-installed box</p>
                </div>
                {requestType === "activation" && (
                  <div className="absolute top-3 right-3">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ── INSTALLATION FORM ── */}
        {requestType === "installation" && (
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-3xl mx-auto">
              <div className="bg-card rounded-2xl shadow-lg p-8">
                <form onSubmit={handleInstallationSubmit} className="space-y-6">
                  {/* Personal Information */}
                  <div>
                    <h2 className="text-xl font-bold mb-4">Personal Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name *</Label>
                        <Input id="firstName" name="firstName" placeholder="John" value={formData.firstName} onChange={handleChange} required data-testid="input-firstName" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name *</Label>
                        <Input id="lastName" name="lastName" placeholder="Doe" value={formData.lastName} onChange={handleChange} required data-testid="input-lastName" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address *</Label>
                        <Input id="email" name="email" type="email" placeholder="john@example.com" value={formData.email} onChange={handleChange} required data-testid="input-email" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number *</Label>
                        <Input id="phone" name="phone" type="tel" placeholder="+254 700 000 000" value={formData.phone} onChange={handleChange} required data-testid="input-phone" />
                      </div>
                    </div>
                  </div>

                  {/* Installation Location */}
                  <div>
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <MapPin className="w-5 h-5" /> Installation Location
                    </h2>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="county">County *</Label>
                          <Input id="county" name="county" placeholder="e.g., Nairobi" value={formData.county} onChange={handleChange} required data-testid="input-county" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="estateName">Estate Name *</Label>
                          <Input id="estateName" name="estateName" placeholder="e.g., Westlands Estate" value={formData.estateName} onChange={handleChange} required data-testid="input-estateName" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="apartmentName">Apartment/Building Name (Optional)</Label>
                        <Input id="apartmentName" name="apartmentName" placeholder="e.g., Riverside Apartments" value={formData.apartmentName} onChange={handleChange} data-testid="input-apartmentName" />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Establishment Status *</Label>
                          <Select value={formData.establishmentStatus} onValueChange={(v) => setFormData(p => ({ ...p, establishmentStatus: v as any }))}>
                            <SelectTrigger data-testid="select-establishmentStatus"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="new">New Establishment</SelectItem>
                              <SelectItem value="existing">Existing Establishment</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Establishment Type *</Label>
                          <Select value={formData.establishmentType} onValueChange={(v) => setFormData(p => ({ ...p, establishmentType: v as any }))}>
                            <SelectTrigger data-testid="select-establishmentType"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="standalone">Stand Alone / Gated Community</SelectItem>
                              <SelectItem value="apartments">Apartments</SelectItem>
                              <SelectItem value="common_area">Common Area</SelectItem>
                              <SelectItem value="business_establishment">Business Establishment</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <LocationPicker latitude={formData.latitude} longitude={formData.longitude} onLocationChange={handleLocationChange} />
                    </div>
                  </div>

                  {/* Preferences */}
                  <div>
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <Calendar className="w-5 h-5" /> Installation Preferences
                    </h2>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="preferredDate">Preferred Installation Date (Optional)</Label>
                        <Input id="preferredDate" name="preferredDate" type="date" value={formData.preferredDate} onChange={handleChange} min={new Date().toISOString().split('T')[0]} data-testid="input-preferredDate" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="notes">Additional Notes (Optional)</Label>
                        <Textarea id="notes" name="notes" placeholder="Any special instructions or requirements..." value={formData.notes} onChange={handleChange} rows={3} data-testid="input-notes" />
                      </div>
                    </div>
                  </div>

                  {/* What Happens Next */}
                  <div className="bg-muted/50 rounded-lg p-5">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-primary" /> What Happens Next?
                    </h3>
                    <ul className="space-y-1.5 text-sm text-muted-foreground">
                      <li>• We'll review your request within 24 hours</li>
                      <li>• Our team will contact you to confirm installation details</li>
                      <li>• Hardware fee payment will be processed before installation</li>
                      <li>• Professional installation at your chosen location</li>
                      <li>• Account setup and training on how to use your Last Link Box</li>
                    </ul>
                  </div>

                  <Button type="submit" className="w-full h-11 text-sm font-semibold" disabled={installationMutation.isPending} data-testid="button-submit-request">
                    {installationMutation.isPending ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                        Submitting Request...
                      </div>
                    ) : "Submit Installation Request"}
                  </Button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* ── ACTIVATION FORM ── */}
        {requestType === "activation" && (
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-3xl mx-auto">
              <div className="bg-card rounded-2xl shadow-lg p-8">
                <form onSubmit={handleActivationSubmit} className="space-y-6">
                  {/* Personal Info */}
                  <div>
                    <h2 className="text-xl font-bold mb-4">Personal Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="act-firstName">First Name *</Label>
                        <Input id="act-firstName" name="firstName" placeholder="John" value={activationData.firstName} onChange={handleActivationChange} required data-testid="input-act-firstName" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="act-lastName">Last Name *</Label>
                        <Input id="act-lastName" name="lastName" placeholder="Doe" value={activationData.lastName} onChange={handleActivationChange} required data-testid="input-act-lastName" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div className="space-y-2">
                        <Label htmlFor="act-email">Email Address *</Label>
                        <Input id="act-email" name="email" type="email" placeholder="john@example.com" value={activationData.email} onChange={handleActivationChange} required data-testid="input-act-email" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="act-phone">Phone Number *</Label>
                        <Input id="act-phone" name="phone" type="tel" placeholder="+254 700 000 000" value={activationData.phone} onChange={handleActivationChange} required data-testid="input-act-phone" />
                      </div>
                    </div>
                  </div>

                  {/* Box Details */}
                  <div>
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <Zap className="w-5 h-5" /> Box Details
                    </h2>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="boxId">Smart Box ID *</Label>
                        <Input
                          id="boxId"
                          name="boxId"
                          placeholder="e.g., KB-2341"
                          value={activationData.boxId}
                          onChange={handleActivationChange}
                          required
                          data-testid="input-boxId"
                        />
                        <p className="text-xs text-muted-foreground">
                          This is the unique ID printed on your smart box hardware
                        </p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="act-county">County *</Label>
                          <Input id="act-county" name="county" placeholder="e.g., Nairobi" value={activationData.county} onChange={handleActivationChange} required data-testid="input-act-county" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="act-estateName">Estate Name *</Label>
                          <Input id="act-estateName" name="estateName" placeholder="e.g., Westlands Estate" value={activationData.estateName} onChange={handleActivationChange} required data-testid="input-act-estateName" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="act-notes">Additional Notes (Optional)</Label>
                        <Textarea id="act-notes" name="notes" placeholder="Any details about your box or account setup..." value={activationData.notes} onChange={handleActivationChange} rows={3} data-testid="input-act-notes" />
                      </div>
                    </div>
                  </div>

                  {/* What Happens Next */}
                  <div className="bg-muted/50 rounded-lg p-5">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-primary" /> What Happens Next?
                    </h3>
                    <ul className="space-y-1.5 text-sm text-muted-foreground">
                      <li>• We'll verify your box ID within 24 hours</li>
                      <li>• Our team will contact you to confirm ownership</li>
                      <li>• Your box will be linked to your account</li>
                      <li>• You'll receive login credentials and a usage guide</li>
                      <li>• Your box will be live and ready to receive deliveries</li>
                    </ul>
                  </div>

                  <Button type="submit" className="w-full h-11 text-sm font-semibold" disabled={activationMutation.isPending} data-testid="button-submit-activation">
                    {activationMutation.isPending ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                        Submitting Request...
                      </div>
                    ) : "Submit Activation Request"}
                  </Button>
                </form>
              </div>
            </div>
          </div>
        )}

      </div>
    </LandingLayout>
  );
}
