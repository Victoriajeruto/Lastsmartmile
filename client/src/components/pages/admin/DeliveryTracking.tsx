import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { authApi } from "@/lib/auth";
import { Truck, MapPin, Clock, Package } from "lucide-react";

export default function DeliveryTracking() {
  const { data: deliveries, isLoading } = useQuery({
    queryKey: ["/api/deliveries"],
    enabled: !!authApi.getToken(),
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "delivered":
        return <Badge className="bg-success/10 text-success">Delivered</Badge>;
      case "in_transit":
        return <Badge className="bg-warning/10 text-warning">In Transit</Badge>;
      case "assigned":
        return <Badge className="bg-accent/10 text-accent">Assigned</Badge>;
      case "pending":
        return <Badge variant="outline">Pending</Badge>;
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="delivery-tracking-page">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="w-5 h-5" />
            All Deliveries
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {deliveries?.deliveries?.map((delivery: any) => (
              <div
                key={delivery.id}
                className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                data-testid={`delivery-${delivery.id}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-foreground">
                        Tracking ID: {delivery.trackingId}
                      </h3>
                      {getStatusBadge(delivery.status)}
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        <span>Box: {delivery.boxId || "Not assigned"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Truck className="w-4 h-4" />
                        <span>Courier: {delivery.courierId || "Unassigned"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>Recipient: {delivery.recipientId}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{formatDate(delivery.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {!deliveries?.deliveries?.length && (
              <div className="text-center py-12">
                <Truck className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No deliveries found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
