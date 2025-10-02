import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { authApi } from "@/lib/auth";
import { History, Package, MapPin, Clock, CheckCircle, XCircle, Truck } from "lucide-react";

export default function ResidentDeliveryHistory() {
  const { data: deliveries, isLoading } = useQuery({
    queryKey: ["/api/deliveries"],
    enabled: !!authApi.getToken(),
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "delivered":
        return (
          <Badge className="bg-success/10 text-success">
            <CheckCircle className="w-3 h-3 mr-1" />
            Delivered
          </Badge>
        );
      case "in_transit":
        return (
          <Badge className="bg-warning/10 text-warning">
            <Truck className="w-3 h-3 mr-1" />
            In Transit
          </Badge>
        );
      case "assigned":
        return (
          <Badge className="bg-accent/10 text-accent">
            Assigned
          </Badge>
        );
      case "failed":
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            Failed
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
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
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="delivery-history-page">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Delivery History ({deliveries?.deliveries?.length || 0})
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
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold text-foreground">
                      {delivery.trackingId}
                    </h3>
                  </div>
                  {getStatusBadge(delivery.status)}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>Box: {delivery.boxId || "Not assigned yet"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Truck className="w-4 h-4" />
                    <span>Courier: {delivery.courierId || "Unassigned"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>Created: {formatDate(delivery.createdAt)}</span>
                  </div>
                  {delivery.deliveredAt && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <CheckCircle className="w-4 h-4" />
                      <span>Delivered: {formatDate(delivery.deliveredAt)}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {!deliveries?.deliveries?.length && (
              <div className="text-center py-12">
                <History className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium text-foreground mb-2">
                  No deliveries yet
                </p>
                <p className="text-muted-foreground">
                  Your delivery history will appear here
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
