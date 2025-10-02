import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { authApi } from "@/lib/auth";
import { Clock, CheckCircle, XCircle, Package, MapPin } from "lucide-react";

export default function CourierDeliveryHistory() {
  const { data: deliveries, isLoading } = useQuery({
    queryKey: ["/api/deliveries"],
    enabled: !!authApi.getToken(),
  });

  const completedDeliveries = deliveries?.deliveries?.filter(
    (d: any) => d.status === "delivered" || d.status === "failed"
  ) || [];

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
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="courier-delivery-history-page">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Delivery History ({completedDeliveries.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {completedDeliveries.map((delivery: any) => (
              <div
                key={delivery.id}
                className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                data-testid={`history-delivery-${delivery.id}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-foreground">
                        {delivery.trackingId}
                      </h3>
                      {getStatusBadge(delivery.status)}
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        <span>Box: {delivery.boxId || "N/A"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>Recipient: {delivery.recipientId}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>Created: {formatDate(delivery.createdAt)}</span>
                      </div>
                      {delivery.deliveredAt && (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" />
                          <span>Completed: {formatDate(delivery.deliveredAt)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {!completedDeliveries.length && (
              <div className="text-center py-12">
                <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium text-foreground mb-2">
                  No Delivery History
                </p>
                <p className="text-muted-foreground">
                  Your completed deliveries will appear here
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
