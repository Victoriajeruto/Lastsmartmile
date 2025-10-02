import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { authApi } from "@/lib/auth";
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
  Battery
} from "lucide-react";

export default function AdminDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [timeRange, setTimeRange] = useState("7");

  const { data: boxes, isLoading: boxesLoading } = useQuery({
    queryKey: ["/api/boxes"],
    enabled: !!authApi.getToken(),
  });

  const { data: deliveries, isLoading: deliveriesLoading } = useQuery({
    queryKey: ["/api/deliveries"],
    enabled: !!authApi.getToken(),
  });

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
              {/* This would come from a users count API */}
              {totalBoxes * 1.2} {/* Approximation for demo */}
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
              <Button className="flex items-center gap-2" data-testid="button-add-box">
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

      {/* User Management Preview */}
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
    </div>
  );
}
