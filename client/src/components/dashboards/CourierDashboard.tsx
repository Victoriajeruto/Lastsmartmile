import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { authApi } from "@/lib/auth";
import { queryClient } from "@/lib/queryClient";
import { 
  Truck, 
  CheckCircle, 
  Clock, 
  Star,
  Package,
  Send,
  Search,
  MapPin
} from "lucide-react";

interface DeliveryFormData {
  trackingNumber: string;
  boxId: string;
  recipientId: string;
  packageType: string;
  priority: string;
  weight: string;
  notes: string;
}

export default function CourierDashboard() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [deliveryForm, setDeliveryForm] = useState<DeliveryFormData>({
    trackingNumber: "",
    boxId: "",
    recipientId: "",
    packageType: "small_parcel",
    priority: "normal",
    weight: "",
    notes: "",
  });

  const { data: deliveries, isLoading: deliveriesLoading } = useQuery({
    queryKey: ["/api/deliveries"],
    enabled: !!authApi.getToken(),
  });

  const { data: boxes, isLoading: boxesLoading } = useQuery({
    queryKey: ["/api/boxes"],
    enabled: !!authApi.getToken(),
  });
  
  const { data: performance } = useQuery({
    queryKey: ["/api/analytics/courier/performance"],
    enabled: !!authApi.getToken(),
  });

  const assignDeliveryMutation = useMutation({
    mutationFn: async (data: DeliveryFormData) => {
      const token = authApi.getToken();
      if (!token) throw new Error("Not authenticated");

      // Find the box by boxId to get the internal ID
      const box = boxes?.boxes?.find((b: any) => b.boxId === data.boxId);
      if (!box) throw new Error("Box not found");

      const response = await fetch("/api/deliveries/assign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...data,
          boxId: box.id, // Use internal box ID
          recipientId: box.ownerId, // Use box owner as recipient
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Delivery Assigned",
        description: "The delivery has been successfully assigned and the recipient has been notified.",
      });
      // Reset form
      setDeliveryForm({
        trackingNumber: "",
        boxId: "",
        recipientId: "",
        packageType: "small_parcel",
        priority: "normal",
        weight: "",
        notes: "",
      });
      // Invalidate deliveries query to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/deliveries"] });
    },
    onError: (error: any) => {
      toast({
        title: "Assignment Failed",
        description: error.message || "Failed to assign delivery",
        variant: "destructive",
      });
    },
  });

  const updateDeliveryStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const token = authApi.getToken();
      if (!token) throw new Error("Not authenticated");

      const response = await fetch(`/api/deliveries/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Status Updated",
        description: "Delivery status has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/deliveries"] });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update delivery status",
        variant: "destructive",
      });
    },
  });

  const handleFormChange = (field: keyof DeliveryFormData, value: string) => {
    setDeliveryForm(prev => ({ ...prev, [field]: value }));
  };

  const handleAssignDelivery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deliveryForm.boxId) {
      toast({
        title: "Missing Information",
        description: "Please select a box ID",
        variant: "destructive",
      });
      return;
    }
    assignDeliveryMutation.mutate(deliveryForm);
  };

  const handleStartDelivery = (deliveryId: string) => {
    updateDeliveryStatusMutation.mutate({ id: deliveryId, status: "in_transit" });
  };

  const courierDeliveries = deliveries?.deliveries?.filter((d: any) => 
    d.status === "assigned" || d.status === "in_transit"
  ) || [];

  const completedToday = deliveries?.deliveries?.filter((d: any) => {
    const today = new Date().toDateString();
    const deliveredDate = d.deliveredAt ? new Date(d.deliveredAt).toDateString() : null;
    return d.status === "delivered" && deliveredDate === today;
  }).length || 0;

  const pendingAssignments = deliveries?.deliveries?.filter((d: any) => 
    d.status === "pending"
  ) || [];

  const filteredDeliveries = courierDeliveries.filter((delivery: any) =>
    delivery.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    delivery.boxId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-success/10 text-success";
      case "in_transit":
        return "bg-warning/10 text-warning";
      case "assigned":
        return "bg-accent/10 text-accent";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-destructive/10 text-destructive";
      case "express":
        return "bg-warning/10 text-warning";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-8" data-testid="courier-dashboard">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Active Deliveries</span>
              <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
                <Truck className="text-warning text-lg" />
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground mb-1" data-testid="active-deliveries-count">
              {courierDeliveries.length}
            </p>
            <p className="text-xs text-muted-foreground">
              {courierDeliveries.filter((d: any) => d.priority === "urgent").length} urgent
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Completed Today</span>
              <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                <CheckCircle className="text-success text-lg" />
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground mb-1" data-testid="completed-today-count">
              {completedToday}
            </p>
            <p className="text-xs text-success flex items-center gap-1">
              <span>Deliveries completed</span>
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Pending Assignments</span>
              <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                <Clock className="text-accent text-lg" />
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground mb-1" data-testid="pending-assignments-count">
              {pendingAssignments.length}
            </p>
            <p className="text-xs text-muted-foreground">Awaiting pickup</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Performance</span>
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Star className="text-primary text-lg" />
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground mb-1" data-testid="performance-rating">
              {performance?.rating?.toFixed(1) || "N/A"}
            </p>
            <p className="text-xs text-muted-foreground">{performance?.completedDeliveries || 0} completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Assign Delivery & Route Map */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assign New Delivery */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Assign New Delivery</h3>
            <form onSubmit={handleAssignDelivery} className="space-y-4">
              <div>
                <Label htmlFor="trackingNumber">Tracking Number</Label>
                <Input
                  id="trackingNumber"
                  type="text"
                  placeholder="e.g., JUM-8372"
                  value={deliveryForm.trackingNumber}
                  onChange={(e) => handleFormChange("trackingNumber", e.target.value)}
                  required
                  data-testid="input-tracking-number"
                />
              </div>
              
              <div>
                <Label htmlFor="boxId">Recipient Box ID</Label>
                <Select value={deliveryForm.boxId} onValueChange={(value) => handleFormChange("boxId", value)}>
                  <SelectTrigger data-testid="select-box-id">
                    <SelectValue placeholder="Select a box" />
                  </SelectTrigger>
                  <SelectContent>
                    {boxesLoading ? (
                      <SelectItem value="loading" disabled>Loading boxes...</SelectItem>
                    ) : boxes?.boxes?.length > 0 ? (
                      boxes.boxes.map((box: any) => (
                        <SelectItem key={box.id} value={box.boxId}>
                          {box.boxId} - {box.location}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="none" disabled>No boxes available</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="packageType">Package Type</Label>
                <Select value={deliveryForm.packageType} onValueChange={(value) => handleFormChange("packageType", value)}>
                  <SelectTrigger data-testid="select-package-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small_parcel">Small Parcel</SelectItem>
                    <SelectItem value="medium_package">Medium Package</SelectItem>
                    <SelectItem value="large_box">Large Box</SelectItem>
                    <SelectItem value="document">Document</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={deliveryForm.priority} onValueChange={(value) => handleFormChange("priority", value)}>
                    <SelectTrigger data-testid="select-priority">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="express">Express</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    placeholder="0.5"
                    value={deliveryForm.weight}
                    onChange={(e) => handleFormChange("weight", e.target.value)}
                    data-testid="input-weight"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  rows={3}
                  placeholder="Add any special instructions..."
                  value={deliveryForm.notes}
                  onChange={(e) => handleFormChange("notes", e.target.value)}
                  data-testid="textarea-notes"
                />
              </div>
              
              <Button
                type="submit"
                className="w-full"
                disabled={assignDeliveryMutation.isPending || !deliveryForm.boxId}
                data-testid="button-assign-delivery"
              >
                {assignDeliveryMutation.isPending ? (
                  "Assigning..."
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Assign & Notify Recipient
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Today's Route */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Today's Route</h3>
            <div className="aspect-square bg-muted rounded-lg mb-4 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-card/90 to-transparent flex items-end p-6">
                <div>
                  <p className="text-sm font-medium text-foreground">Westlands - CBD - Kilimani Route</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {courierDeliveries.length} stops remaining • Active deliveries
                  </p>
                </div>
              </div>
              <MapPin className="w-16 h-16 text-muted-foreground" />
            </div>
            <div className="space-y-3" data-testid="route-stops">
              {courierDeliveries.slice(0, 3).map((delivery: any, index: number) => (
                <div
                  key={delivery.id}
                  className={`flex items-center gap-3 p-3 rounded-lg ${
                    index === 0 ? "bg-primary/10 border-2 border-primary" : "bg-muted/50"
                  }`}
                  data-testid={`route-stop-${delivery.id}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-semibold ${
                    index === 0 ? "bg-primary text-primary-foreground" : "bg-muted border border-border text-muted-foreground"
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${index === 0 ? "text-foreground" : "text-muted-foreground"}`}>
                      Box {delivery.trackingNumber}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {delivery.status === "in_transit" ? "In progress" : "Next stop"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Deliveries Table */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Pending Deliveries</h3>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  type="search"
                  placeholder="Search by tracking or box ID..."
                  className="pl-10 w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  data-testid="input-search-deliveries"
                />
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            {deliveriesLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-4 py-3">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                ))}
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Tracking</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Box ID</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Package Type</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Priority</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDeliveries.length > 0 ? (
                    filteredDeliveries.map((delivery: any) => (
                      <tr
                        key={delivery.id}
                        className="border-b border-border hover:bg-muted/50"
                        data-testid={`pending-delivery-${delivery.id}`}
                      >
                        <td className="py-3 px-4">
                          <span className="font-mono text-sm font-medium">{delivery.trackingNumber}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-mono text-sm">
                            {boxes?.boxes?.find((b: any) => b.id === delivery.boxId)?.boxId || "Unknown"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm capitalize">
                          {delivery.packageType.replace("_", " ")}
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant="secondary"
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(delivery.priority)}`}
                          >
                            {delivery.priority.charAt(0).toUpperCase() + delivery.priority.slice(1)}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant="secondary"
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(delivery.status)}`}
                          >
                            {delivery.status.replace("_", " ").charAt(0).toUpperCase() + delivery.status.replace("_", " ").slice(1)}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Button
                            size="sm"
                            onClick={() => handleStartDelivery(delivery.id)}
                            disabled={updateDeliveryStatusMutation.isPending || delivery.status === "in_transit"}
                            data-testid={`button-start-delivery-${delivery.id}`}
                          >
                            {delivery.status === "in_transit" ? "In Progress" : "Start Delivery"}
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-8 text-center">
                        <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">
                          {searchTerm ? "No deliveries match your search" : "No pending deliveries"}
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
