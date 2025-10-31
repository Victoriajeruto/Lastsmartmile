import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { authApi } from "@/lib/auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Package, MapPin, Battery, Search, Plus, Wifi } from "lucide-react";

export default function BoxManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    boxId: "",
    location: "",
    latitude: "",
    longitude: "",
    batteryLevel: "100",
  });
  const { toast } = useToast();

  const { data: boxesData, isLoading } = useQuery({
    queryKey: ["/api/boxes"],
    enabled: !!authApi.getToken(),
  });

  const registerMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const batteryLevel = data.batteryLevel.trim() === "" ? 100 : parseInt(data.batteryLevel);
      const response = await apiRequest("POST", "/api/boxes/register", {
        boxId: data.boxId.trim(),
        location: data.location.trim(),
        latitude: data.latitude.trim() || null,
        longitude: data.longitude.trim() || null,
        batteryLevel: isNaN(batteryLevel) ? 100 : batteryLevel,
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/boxes"] });
      toast({
        title: "Success",
        description: "Smart box registered successfully",
      });
      setRegisterModalOpen(false);
      setFormData({
        boxId: "",
        location: "",
        latitude: "",
        longitude: "",
        batteryLevel: "100",
      });
    },
    onError: (error: any) => {
      let errorMessage = "Failed to register box";
      
      if (error.message) {
        if (error.message.includes("already exists")) {
          errorMessage = "A box with this ID already exists. Please use a different Box ID.";
        } else if (error.message.includes("validation") || error.message.includes("invalid")) {
          errorMessage = "Please check your input. Make sure all required fields are filled correctly.";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Registration Failed",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate(formData);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "operational":
        return <Badge className="bg-success/10 text-success">Operational</Badge>;
      case "maintenance":
        return <Badge className="bg-warning/10 text-warning">Maintenance</Badge>;
      case "offline":
        return <Badge variant="destructive">Offline</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getBatteryColor = (level: number | null) => {
    if (!level) return "text-muted-foreground";
    if (level < 20) return "text-destructive";
    if (level < 50) return "text-warning";
    return "text-success";
  };

  const boxes = (boxesData as any)?.boxes || [];
  const filteredBoxes = boxes.filter((box: any) =>
    box.boxId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    box.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="box-management-page">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          Smart Box Management ({filteredBoxes.length})
        </h2>
        <Button onClick={() => setRegisterModalOpen(true)} data-testid="button-register-box">
          <Plus className="w-4 h-4 mr-2" />
          Register New Box
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search by box ID or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            data-testid="input-search-boxes"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBoxes.map((box: any) => (
          <Card key={box.id} data-testid={`box-card-${box.id}`}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  {box.boxId}
                </span>
                {getStatusBadge(box.status)}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <span className="text-muted-foreground flex-1">
                    {box.location || "Location not set"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Battery className={`w-4 h-4 ${getBatteryColor(box.batteryLevel)}`} />
                    <span className={getBatteryColor(box.batteryLevel)}>
                      {box.batteryLevel ? `${box.batteryLevel}%` : "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Wifi className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {box.status === "offline" ? "Offline" : "Online"}
                    </span>
                  </div>
                </div>
                {box.ownerId && (
                  <div className="text-sm text-muted-foreground pt-2 border-t">
                    Assigned to: {box.ownerId}
                  </div>
                )}
              </div>
              <div className="flex gap-2 pt-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex-1"
                  data-testid={`button-edit-${box.id}`}
                >
                  Edit
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  className="flex-1"
                  data-testid={`button-details-${box.id}`}
                >
                  Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {!filteredBoxes.length && (
        <Card>
          <CardContent className="text-center py-12">
            <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-foreground mb-2">
              No boxes found
            </p>
            <p className="text-muted-foreground">
              {searchTerm ? "Try adjusting your search" : "Register a new smart box to get started"}
            </p>
          </CardContent>
        </Card>
      )}

      <Dialog open={registerModalOpen} onOpenChange={setRegisterModalOpen}>
        <DialogContent data-testid="dialog-register-box">
          <DialogHeader>
            <DialogTitle>Register New Smart Box</DialogTitle>
            <DialogDescription>
              Enter the details for the new smart box to register it in the system.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="boxId">Box ID *</Label>
              <Input
                id="boxId"
                placeholder="e.g., KB-2341"
                value={formData.boxId}
                onChange={(e) => setFormData({ ...formData, boxId: e.target.value })}
                required
                data-testid="input-box-id"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                placeholder="e.g., Nairobi, Westlands Estate"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
                data-testid="input-location"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="latitude">Latitude</Label>
                <Input
                  id="latitude"
                  placeholder="e.g., -1.286389"
                  value={formData.latitude}
                  onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                  data-testid="input-latitude"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="longitude">Longitude</Label>
                <Input
                  id="longitude"
                  placeholder="e.g., 36.817223"
                  value={formData.longitude}
                  onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                  data-testid="input-longitude"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="batteryLevel">Battery Level (%)</Label>
              <Input
                id="batteryLevel"
                type="number"
                min="0"
                max="100"
                value={formData.batteryLevel}
                onChange={(e) => setFormData({ ...formData, batteryLevel: e.target.value })}
                data-testid="input-battery-level"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setRegisterModalOpen(false)}
                className="flex-1"
                data-testid="button-cancel"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={registerMutation.isPending}
                data-testid="button-submit"
              >
                {registerMutation.isPending ? "Registering..." : "Register Box"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
