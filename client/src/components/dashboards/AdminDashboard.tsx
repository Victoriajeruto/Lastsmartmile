import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { authApi } from "@/lib/auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Package, 
  Users, 
  Truck, 
  Activity,
  BarChart3,
  Search,
  Plus,
  TrendingUp,
  Wifi,
  TriangleAlert,
  Battery,
  PackagePlus
} from "lucide-react";
import InstallationRequestsManager from "@/components/InstallationRequestsManager";

export default function AdminDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [timeRange, setTimeRange] = useState("7");
  const [boxModalOpen, setBoxModalOpen] = useState(false);
  const [deliveryModalOpen, setDeliveryModalOpen] = useState(false);
  const { toast } = useToast();
  
  // Box registration form state
  const [boxForm, setBoxForm] = useState({
    boxId: "",
    location: "",
    latitude: "",
    longitude: "",
    batteryLevel: "100",
  });
  
  // Delivery assignment form state
  const [deliveryForm, setDeliveryForm] = useState({
    boxId: "",
    recipientId: "",
    courierId: "unassigned",
    packageType: "",
    priority: "normal",
    weight: "",
    notes: "",
    serviceType: "standard",
  });

  const { data: boxes, isLoading: boxesLoading } = useQuery<{ boxes: any[] }>({
    queryKey: ["/api/boxes"],
    enabled: !!authApi.getToken(),
  });

  const { data: deliveries, isLoading: deliveriesLoading } = useQuery<{ deliveries: any[] }>({
    queryKey: ["/api/deliveries"],
    enabled: !!authApi.getToken(),
  });
  
  const { data: userCountData } = useQuery<{ count: number }>({
    queryKey: ["/api/analytics/users/count"],
    enabled: !!authApi.getToken(),
  });
  
  const { data: usersData } = useQuery<{ users: any[] }>({
    queryKey: ["/api/users"],
    enabled: !!authApi.getToken(),
  });
  
  const { data: subscriptionsData, isLoading: subscriptionsLoading } = useQuery<{ subscriptions: any[] }>({
    queryKey: ["/api/subscriptions"],
    enabled: !!authApi.getToken(),
  });
  
  const { data: servicePricing } = useQuery<any[]>({
    queryKey: ["/api/service-pricing"],
  });
  
  const residents = usersData?.users?.filter((u: any) => u.role === "resident") || [];
  const couriers = usersData?.users?.filter((u: any) => u.role === "courier") || [];
  
  // Calculate delivery price based on service type and weight
  const calculateDeliveryPrice = () => {
    if (!deliveryForm.serviceType || !servicePricing) return 0;
    const selectedService = servicePricing.find((s: any) => s.serviceType === deliveryForm.serviceType);
    if (!selectedService) return 0;
    
    const weight = parseFloat(deliveryForm.weight) || 0;
    return selectedService.basePrice + (weight * selectedService.pricePerKg);
  };
  
  // Box registration mutation
  const registerBoxMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/boxes/register", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/boxes"] });
      toast({
        title: "Success",
        description: "Box registered successfully",
      });
      setBoxModalOpen(false);
      setBoxForm({
        boxId: "",
        location: "",
        latitude: "",
        longitude: "",
        batteryLevel: "100",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to register box",
        variant: "destructive",
      });
    },
  });
  
  // Delivery assignment mutation
  const assignDeliveryMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/deliveries/assign", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/deliveries"] });
      toast({
        title: "Success",
        description: "Delivery assigned successfully",
      });
      setDeliveryModalOpen(false);
      setDeliveryForm({
        boxId: "",
        recipientId: "",
        courierId: "unassigned",
        packageType: "",
        priority: "normal",
        weight: "",
        notes: "",
        serviceType: "standard",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to assign delivery",
        variant: "destructive",
      });
    },
  });
  
  const handleRegisterBox = () => {
    const data: any = {
      boxId: boxForm.boxId,
      location: boxForm.location,
      batteryLevel: parseInt(boxForm.batteryLevel) || 100,
    };
    
    if (boxForm.latitude) data.latitude = boxForm.latitude;
    if (boxForm.longitude) data.longitude = boxForm.longitude;
    
    registerBoxMutation.mutate(data);
  };
  
  const handleAssignDelivery = () => {
    const data: any = {
      boxId: deliveryForm.boxId,
      recipientId: deliveryForm.recipientId,
      packageType: deliveryForm.packageType,
      priority: deliveryForm.priority,
    };
    
    if (deliveryForm.courierId && deliveryForm.courierId !== "unassigned") {
      data.courierId = deliveryForm.courierId;
    }
    if (deliveryForm.weight) data.weight = deliveryForm.weight;
    if (deliveryForm.notes) data.notes = deliveryForm.notes;
    if (deliveryForm.serviceType) data.serviceType = deliveryForm.serviceType;
    
    assignDeliveryMutation.mutate(data);
  };

  const getBoxStatusColor = (status: string) => {
    switch (status) {
      case "operational":
        return "bg-success/10 text-success";
      case "maintenance":
        return "bg-warning/10 text-warning";
      case "offline":
        return "bg-destructive/10 text-destructive";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getBatteryColor = (level: number) => {
    if (level > 50) return "bg-success";
    if (level > 20) return "bg-warning";
    return "bg-destructive";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredBoxes = boxes?.boxes?.filter((box: any) =>
    box.boxId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    box.location.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const operationalBoxes = boxes?.boxes?.filter((box: any) => box.status === "operational").length || 0;
  const maintenanceBoxes = boxes?.boxes?.filter((box: any) => box.status === "maintenance").length || 0;
  const offlineBoxes = boxes?.boxes?.filter((box: any) => box.status === "offline").length || 0;
  const totalBoxes = boxes?.boxes?.length || 0;

  const deliveriesToday = deliveries?.deliveries?.filter((delivery: any) => {
    const today = new Date().toDateString();
    const createdDate = new Date(delivery.createdAt).toDateString();
    return createdDate === today;
  }).length || 0;

  const completedDeliveries = deliveries?.deliveries?.filter((d: any) => d.status === "delivered").length || 0;
  const inTransitDeliveries = deliveries?.deliveries?.filter((d: any) => d.status === "in_transit").length || 0;
  const failedDeliveries = deliveries?.deliveries?.filter((d: any) => d.status === "failed").length || 0;

  const lowBatteryBoxes = boxes?.boxes?.filter((box: any) => 
    box.batteryLevel && box.batteryLevel < 20
  ) || [];

  const recentOfflineBoxes = boxes?.boxes?.filter((box: any) => 
    box.status === "offline"
  ) || [];

  return (
    <div className="space-y-8" data-testid="admin-dashboard">
      {/* System Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium opacity-90">Total Boxes</span>
              <Package className="text-2xl opacity-80" />
            </div>
            <p className="text-3xl font-bold mb-1" data-testid="total-boxes-count">
              {totalBoxes}
            </p>
            <p className="text-xs opacity-75">Registered in system</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-success to-success/80 text-success-foreground shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium opacity-90">Active Users</span>
              <Users className="text-2xl opacity-80" />
            </div>
            <p className="text-3xl font-bold mb-1" data-testid="active-users-count">
              {userCountData?.count || 0}
            </p>
            <p className="text-xs opacity-75 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>Growth active</span>
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-accent to-accent/80 text-accent-foreground shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium opacity-90">Deliveries Today</span>
              <Truck className="text-2xl opacity-80" />
            </div>
            <p className="text-3xl font-bold mb-1" data-testid="deliveries-today-count">
              {deliveriesToday}
            </p>
            <p className="text-xs opacity-75">
              {inTransitDeliveries} in transit
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-warning to-warning/80 text-warning-foreground shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium opacity-90">System Health</span>
              <Activity className="text-2xl opacity-80" />
            </div>
            <p className="text-3xl font-bold mb-1" data-testid="system-health">
              {totalBoxes > 0 ? Math.round((operationalBoxes / totalBoxes) * 100) : 0}%
            </p>
            <p className="text-xs opacity-75">Operational status</p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Charts & Box Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Delivery Analytics */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">Delivery Analytics</h3>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => setDeliveryModalOpen(true)}
                    className="flex items-center gap-2"
                    data-testid="button-assign-delivery"
                  >
                    <PackagePlus className="w-4 h-4" />
                    <span>Assign Delivery</span>
                  </Button>
                  <Select value={timeRange} onValueChange={setTimeRange}>
                    <SelectTrigger className="w-32" data-testid="select-time-range">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">Last 7 days</SelectItem>
                      <SelectItem value="30">Last 30 days</SelectItem>
                      <SelectItem value="90">Last 90 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Chart placeholder */}
              <div className="h-64 bg-muted/30 rounded-lg flex items-center justify-center border border-border mb-4">
                <div className="text-center">
                  <BarChart3 className="w-16 h-16 text-muted-foreground mb-2 mx-auto" />
                  <p className="text-sm text-muted-foreground">Delivery trends over time</p>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-success/10 rounded-lg">
                  <p className="text-2xl font-bold text-success" data-testid="completed-deliveries">
                    {completedDeliveries}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Completed</p>
                </div>
                <div className="text-center p-3 bg-warning/10 rounded-lg">
                  <p className="text-2xl font-bold text-warning" data-testid="in-transit-deliveries">
                    {inTransitDeliveries}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">In Transit</p>
                </div>
                <div className="text-center p-3 bg-destructive/10 rounded-lg">
                  <p className="text-2xl font-bold text-destructive" data-testid="failed-deliveries">
                    {failedDeliveries}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Failed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Box Status Distribution */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Box Status</h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">Operational</span>
                  <span className="text-sm font-bold text-foreground" data-testid="operational-boxes-count">
                    {operationalBoxes}
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-success h-2 rounded-full" 
                    style={{ width: `${totalBoxes > 0 ? (operationalBoxes / totalBoxes) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">Maintenance</span>
                  <span className="text-sm font-bold text-foreground" data-testid="maintenance-boxes-count">
                    {maintenanceBoxes}
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-warning h-2 rounded-full" 
                    style={{ width: `${totalBoxes > 0 ? (maintenanceBoxes / totalBoxes) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">Offline</span>
                  <span className="text-sm font-bold text-foreground" data-testid="offline-boxes-count">
                    {offlineBoxes}
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-destructive h-2 rounded-full" 
                    style={{ width: `${totalBoxes > 0 ? (offlineBoxes / totalBoxes) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-border">
              <h4 className="text-sm font-semibold text-foreground mb-3">Recent Alerts</h4>
              <div className="space-y-3" data-testid="system-alerts">
                {lowBatteryBoxes.slice(0, 2).map((box: any) => (
                  <div key={box.id} className="flex items-start gap-2 text-sm">
                    <Battery className="text-destructive mt-0.5 w-4 h-4" />
                    <div>
                      <p className="text-foreground font-medium">Low Battery</p>
                      <p className="text-xs text-muted-foreground">
                        Box {box.boxId} - {box.batteryLevel}%
                      </p>
                    </div>
                  </div>
                ))}
                {recentOfflineBoxes.slice(0, 1).map((box: any) => (
                  <div key={box.id} className="flex items-start gap-2 text-sm">
                    <Wifi className="text-warning mt-0.5 w-4 h-4" />
                    <div>
                      <p className="text-foreground font-medium">Connection Issues</p>
                      <p className="text-xs text-muted-foreground">Box {box.boxId}</p>
                    </div>
                  </div>
                ))}
                {lowBatteryBoxes.length === 0 && recentOfflineBoxes.length === 0 && (
                  <p className="text-sm text-muted-foreground">No active alerts</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Box Management Table */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Box Management</h3>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  type="search"
                  placeholder="Search boxes..."
                  className="pl-10 w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  data-testid="input-search-boxes"
                />
              </div>
              <Button 
                className="flex items-center gap-2" 
                onClick={() => setBoxModalOpen(true)}
                data-testid="button-add-box"
              >
                <Plus className="w-4 h-4" />
                <span>Add Box</span>
              </Button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            {boxesLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-4 py-3">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                ))}
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Box ID</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Location</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Owner</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Battery</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Last Activity</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBoxes.length > 0 ? (
                    filteredBoxes.map((box: any) => (
                      <tr
                        key={box.id}
                        className="border-b border-border hover:bg-muted/50"
                        data-testid={`box-row-${box.id}`}
                      >
                        <td className="py-3 px-4">
                          <span className="font-mono text-sm font-medium">{box.boxId}</span>
                        </td>
                        <td className="py-3 px-4 text-sm">{box.location}</td>
                        <td className="py-3 px-4 text-sm">
                          {box.ownerId ? "Assigned" : "Unassigned"}
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant="secondary"
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getBoxStatusColor(box.status)}`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-current mr-1"></span>
                            {box.status.charAt(0).toUpperCase() + box.status.slice(1)}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          {box.batteryLevel !== null ? (
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-muted rounded-full h-1.5">
                                <div 
                                  className={`h-1.5 rounded-full ${getBatteryColor(box.batteryLevel)}`}
                                  style={{ width: `${box.batteryLevel}%` }}
                                ></div>
                              </div>
                              <span className={`text-xs ${
                                box.batteryLevel < 20 ? "text-destructive font-medium" : "text-muted-foreground"
                              }`}>
                                {box.batteryLevel}%
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">N/A</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">
                          {box.lastActivity ? formatDate(box.lastActivity) : "Never"}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="link" 
                              size="sm" 
                              className="text-primary hover:underline p-0"
                              data-testid={`button-view-box-${box.id}`}
                            >
                              View
                            </Button>
                            <Button 
                              variant="link" 
                              size="sm" 
                              className="text-muted-foreground hover:text-foreground p-0"
                              data-testid={`button-edit-box-${box.id}`}
                            >
                              Edit
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-8 text-center">
                        <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">
                          {searchTerm ? "No boxes match your search" : "No boxes found"}
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
          
          {filteredBoxes.length > 0 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Showing <span className="font-medium">1-{Math.min(filteredBoxes.length, 10)}</span> of{" "}
                <span className="font-medium">{filteredBoxes.length}</span> boxes
              </p>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="sm" disabled data-testid="button-previous-page">
                  Previous
                </Button>
                <Button size="sm" className="bg-primary text-primary-foreground">1</Button>
                <Button variant="outline" size="sm" disabled={filteredBoxes.length <= 10} data-testid="button-next-page">
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Subscription Management */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Subscription Management</h3>
            <p className="text-sm text-muted-foreground">
              Total Subscribers: {subscriptionsData?.subscriptions?.length || 0}
            </p>
          </div>
          
          <div className="overflow-x-auto">
            {subscriptionsLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-4 py-3">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-28" />
                  </div>
                ))}
              </div>
            ) : subscriptionsData?.subscriptions && subscriptionsData.subscriptions.length > 0 ? (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Resident</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Email</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Boxes</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Plan</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Amount (KES)</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Expires</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {subscriptionsData?.subscriptions?.map((sub: any) => (
                    <tr key={sub.id} className="border-b border-border hover:bg-muted/50" data-testid={`subscription-row-${sub.id}`}>
                      <td className="py-3 px-4">
                        <div className="text-sm font-medium text-foreground">
                          {sub.firstName} {sub.lastName}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm text-muted-foreground">{sub.email}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm text-foreground" data-testid={`box-count-${sub.id}`}>
                          {sub.boxCount}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className="capitalize" data-testid={`subscription-plan-${sub.id}`}>
                          {sub.subscriptionPlan || "None"}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm text-foreground" data-testid={`subscription-amount-${sub.id}`}>
                          {sub.amount > 0 ? sub.amount.toLocaleString() : "-"}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm text-muted-foreground" data-testid={`subscription-expiry-${sub.id}`}>
                          {sub.subscriptionExpiresAt ? new Date(sub.subscriptionExpiresAt).toLocaleDateString() : "Not set"}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge 
                          variant={sub.hasCompletedPayment ? "default" : "destructive"}
                          data-testid={`subscription-status-${sub.id}`}
                        >
                          {sub.hasCompletedPayment ? "Active" : "Pending"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No subscriptions to display</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Installation Requests */}
      <InstallationRequestsManager />

      {/* Recent Box Activity */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Recent Box Activity</h3>
            <Button variant="link" className="text-sm text-primary hover:underline p-0">
              View All Activity
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {boxes?.boxes?.slice(0, 3).map((box: any) => (
              <div key={box.id} className="p-4 bg-muted/30 rounded-lg border border-border" data-testid={`activity-card-${box.id}`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                    <Package className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-foreground">{box.boxId}</p>
                    <p className="text-xs text-muted-foreground">{box.location}</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Last active: {box.lastActivity ? formatDate(box.lastActivity) : "Never"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Status: {box.status} • Battery: {box.batteryLevel || 0}%
                </p>
              </div>
            )) || (
              <div className="col-span-3 text-center py-8">
                <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No box activity to display</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Box Registration Modal */}
      <Dialog open={boxModalOpen} onOpenChange={setBoxModalOpen}>
        <DialogContent className="max-w-md" data-testid="dialog-register-box">
          <DialogHeader>
            <DialogTitle>Register New Smart Box</DialogTitle>
            <DialogDescription>
              Add a new smart box to the system
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="boxId">Box ID *</Label>
              <Input
                id="boxId"
                placeholder="KB-2341"
                value={boxForm.boxId}
                onChange={(e) => setBoxForm({ ...boxForm, boxId: e.target.value })}
                data-testid="input-box-id"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                placeholder="Westlands, Nairobi"
                value={boxForm.location}
                onChange={(e) => setBoxForm({ ...boxForm, location: e.target.value })}
                data-testid="input-location"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="latitude">Latitude</Label>
                <Input
                  id="latitude"
                  placeholder="-1.2921"
                  value={boxForm.latitude}
                  onChange={(e) => setBoxForm({ ...boxForm, latitude: e.target.value })}
                  data-testid="input-latitude"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="longitude">Longitude</Label>
                <Input
                  id="longitude"
                  placeholder="36.8219"
                  value={boxForm.longitude}
                  onChange={(e) => setBoxForm({ ...boxForm, longitude: e.target.value })}
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
                value={boxForm.batteryLevel}
                onChange={(e) => setBoxForm({ ...boxForm, batteryLevel: e.target.value })}
                data-testid="input-battery-level"
              />
            </div>
            
            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setBoxModalOpen(false)}
                data-testid="button-cancel-box"
              >
                Cancel
              </Button>
              <Button
                onClick={handleRegisterBox}
                disabled={!boxForm.boxId || !boxForm.location || registerBoxMutation.isPending}
                data-testid="button-submit-box"
              >
                {registerBoxMutation.isPending ? "Registering..." : "Register Box"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Delivery Assignment Modal */}
      <Dialog open={deliveryModalOpen} onOpenChange={setDeliveryModalOpen}>
        <DialogContent className="max-w-md" data-testid="dialog-assign-delivery">
          <DialogHeader>
            <DialogTitle>Assign Delivery to Courier</DialogTitle>
            <DialogDescription>
              Create and assign a package to a courier
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="boxId">Smart Box *</Label>
              <Select
                value={deliveryForm.boxId}
                onValueChange={(value) => setDeliveryForm({ ...deliveryForm, boxId: value })}
              >
                <SelectTrigger id="boxId" data-testid="select-box">
                  <SelectValue placeholder="Select a box" />
                </SelectTrigger>
                <SelectContent>
                  {boxes?.boxes?.map((box: any) => (
                    <SelectItem key={box.id} value={box.id}>
                      {box.boxId} - {box.location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="recipientId">Recipient (Resident) *</Label>
              <Select
                value={deliveryForm.recipientId}
                onValueChange={(value) => setDeliveryForm({ ...deliveryForm, recipientId: value })}
              >
                <SelectTrigger id="recipientId" data-testid="select-recipient">
                  <SelectValue placeholder="Select recipient" />
                </SelectTrigger>
                <SelectContent>
                  {residents.map((resident: any) => (
                    <SelectItem key={resident.id} value={resident.id}>
                      {resident.firstName} {resident.lastName} - {resident.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="courierId">Assign to Courier (Optional)</Label>
              <Select
                value={deliveryForm.courierId}
                onValueChange={(value) => setDeliveryForm({ ...deliveryForm, courierId: value === "unassigned" ? "" : value })}
              >
                <SelectTrigger id="courierId" data-testid="select-courier">
                  <SelectValue placeholder="Leave unassigned or select courier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned (Pending)</SelectItem>
                  {couriers.map((courier: any) => (
                    <SelectItem key={courier.id} value={courier.id}>
                      {courier.firstName} {courier.lastName} - {courier.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="packageType">Package Type *</Label>
              <Input
                id="packageType"
                placeholder="e.g. Documents, Electronics"
                value={deliveryForm.packageType}
                onChange={(e) => setDeliveryForm({ ...deliveryForm, packageType: e.target.value })}
                data-testid="input-package-type"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="serviceType">Service Type *</Label>
              <Select
                value={deliveryForm.serviceType}
                onValueChange={(value) => setDeliveryForm({ ...deliveryForm, serviceType: value })}
              >
                <SelectTrigger id="serviceType" data-testid="select-service-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {servicePricing?.map((service: any) => (
                    <SelectItem key={service.id} value={service.serviceType}>
                      <div className="flex flex-col">
                        <div className="font-medium">{service.name}</div>
                        <div className="text-xs text-muted-foreground">
                          KES {service.basePrice} base + KES {service.pricePerKg}/kg • {service.deliveryTimeHours}h delivery
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {servicePricing && deliveryForm.serviceType && (
                <div className="text-sm text-muted-foreground">
                  {servicePricing.find((s: any) => s.serviceType === deliveryForm.serviceType)?.description}
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={deliveryForm.priority}
                  onValueChange={(value) => setDeliveryForm({ ...deliveryForm, priority: value })}
                >
                  <SelectTrigger id="priority" data-testid="select-priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="express">Express</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  placeholder="2.5"
                  value={deliveryForm.weight}
                  onChange={(e) => setDeliveryForm({ ...deliveryForm, weight: e.target.value })}
                  data-testid="input-weight"
                />
              </div>
            </div>
            
            {deliveryForm.weight && deliveryForm.serviceType && (
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Estimated Delivery Cost:</span>
                  <span className="text-2xl font-bold text-primary">KES {calculateDeliveryPrice().toFixed(2)}</span>
                </div>
                {servicePricing && (
                  <div className="text-xs text-muted-foreground mt-2">
                    {servicePricing.find((s: any) => s.serviceType === deliveryForm.serviceType)?.deliveryTimeHours}h estimated delivery time
                  </div>
                )}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Special delivery instructions..."
                value={deliveryForm.notes}
                onChange={(e) => setDeliveryForm({ ...deliveryForm, notes: e.target.value })}
                data-testid="input-notes"
              />
            </div>
            
            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setDeliveryModalOpen(false)}
                data-testid="button-cancel-delivery"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAssignDelivery}
                disabled={!deliveryForm.boxId || !deliveryForm.recipientId || !deliveryForm.packageType || assignDeliveryMutation.isPending}
                data-testid="button-submit-delivery"
              >
                {assignDeliveryMutation.isPending ? "Assigning..." : "Assign Delivery"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
