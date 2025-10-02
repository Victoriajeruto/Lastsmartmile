import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { authApi } from "@/lib/auth";
import { 
  LockOpen, 
  Package, 
  Calendar, 
  MapPin, 
  Unlock, 
  QrCode, 
  History, 
  Bell,
  ArrowRight,
  Check,
  Truck,
  Clock
} from "lucide-react";

interface ResidentDashboardProps {
  onOpenUnlockModal: () => void;
}

export default function ResidentDashboard({ onOpenUnlockModal }: ResidentDashboardProps) {
  const { data: deliveries, isLoading: deliveriesLoading } = useQuery({
    queryKey: ["/api/deliveries"],
    enabled: !!authApi.getToken(),
  });

  const { data: notifications, isLoading: notificationsLoading } = useQuery({
    queryKey: ["/api/notifications"],
    enabled: !!authApi.getToken(),
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-success/10 text-success";
      case "in_transit":
        return "bg-warning/10 text-warning";
      case "processing":
        return "bg-accent/10 text-accent";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "delivered":
        return <Check className="w-3 h-3 mr-1" />;
      case "in_transit":
        return <Truck className="w-3 h-3 mr-1" />;
      case "processing":
        return <Clock className="w-3 h-3 mr-1" />;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const pendingDeliveries = deliveries?.deliveries?.filter(
    (d: any) => d.status === "pending" || d.status === "assigned" || d.status === "in_transit"
  ) || [];

  return (
    <div className="space-y-8" data-testid="resident-dashboard">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">My Box Status</span>
              <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                <LockOpen className="text-success text-lg" />
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground mb-1">Unlocked</p>
            <p className="text-xs text-muted-foreground">
              Box #<span className="font-mono">KB-2341</span>
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Pending Deliveries</span>
              <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
                <Package className="text-warning text-lg" />
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground mb-1" data-testid="pending-count">
              {pendingDeliveries.length}
            </p>
            <p className="text-xs text-success flex items-center gap-1">
              <span>Active deliveries</span>
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">This Month</span>
              <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                <Calendar className="text-accent text-lg" />
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground mb-1" data-testid="monthly-count">
              {deliveries?.deliveries?.length || 0}
            </p>
            <p className="text-xs text-muted-foreground">Total deliveries</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Box Location</span>
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <MapPin className="text-primary text-lg" />
              </div>
            </div>
            <p className="text-sm font-semibold text-foreground mb-1">Westlands Hub</p>
            <p className="text-xs text-muted-foreground">Nairobi, Kenya</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Button
                onClick={onOpenUnlockModal}
                className="w-full justify-between group"
                data-testid="button-unlock-box"
              >
                <div className="flex items-center gap-3">
                  <Unlock className="w-4 h-4" />
                  <span>Unlock My Box</span>
                </div>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <Button
                onClick={onOpenUnlockModal}
                variant="outline"
                className="w-full justify-between group bg-accent/10 hover:bg-accent/20 text-accent border-accent/20"
                data-testid="button-generate-qr"
              >
                <div className="flex items-center gap-3">
                  <QrCode className="w-4 h-4" />
                  <span>Generate QR Code</span>
                </div>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <Button
                variant="outline"
                className="w-full justify-between group"
                data-testid="button-view-deliveries"
              >
                <div className="flex items-center gap-3">
                  <History className="w-4 h-4" />
                  <span>View All Deliveries</span>
                </div>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <Button
                variant="outline"
                className="w-full justify-between group"
                data-testid="button-notification-settings"
              >
                <div className="flex items-center gap-3">
                  <Bell className="w-4 h-4" />
                  <span>Notification Settings</span>
                </div>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Notifications */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">Recent Notifications</h3>
                <Button variant="link" className="text-sm text-primary hover:underline p-0">
                  View All
                </Button>
              </div>
              <div className="space-y-4">
                {notificationsLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
                      <Skeleton className="w-10 h-10 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-full" />
                        <Skeleton className="h-3 w-1/4" />
                      </div>
                    </div>
                  ))
                ) : notifications?.notifications?.length > 0 ? (
                  notifications.notifications.slice(0, 3).map((notification: any) => (
                    <div
                      key={notification.id}
                      className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg"
                      data-testid={`notification-${notification.id}`}
                    >
                      <div className="w-10 h-10 bg-success rounded-full flex items-center justify-center flex-shrink-0">
                        <Check className="text-success-foreground w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground">{notification.title}</p>
                        <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {formatDate(notification.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No notifications yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Active Deliveries Table */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Active Deliveries</h3>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <span>Filter</span>
            </Button>
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
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Tracking ID
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Courier
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Created
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {deliveries?.deliveries?.length > 0 ? (
                    deliveries.deliveries.map((delivery: any) => (
                      <tr
                        key={delivery.id}
                        className="border-b border-border hover:bg-muted/50"
                        data-testid={`delivery-row-${delivery.id}`}
                      >
                        <td className="py-3 px-4">
                          <span className="font-mono text-sm font-medium">
                            {delivery.trackingNumber}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm">
                            {delivery.courierId ? "Assigned Courier" : "Unassigned"}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant="secondary"
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                              delivery.status
                            )}`}
                          >
                            {getStatusIcon(delivery.status)}
                            {delivery.status.charAt(0).toUpperCase() + delivery.status.slice(1)}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">
                          {formatDate(delivery.createdAt)}
                        </td>
                        <td className="py-3 px-4">
                          <Button
                            variant="link"
                            size="sm"
                            className="text-primary hover:underline p-0"
                            data-testid={`button-view-delivery-${delivery.id}`}
                          >
                            View Details
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-8 text-center">
                        <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No deliveries found</p>
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
