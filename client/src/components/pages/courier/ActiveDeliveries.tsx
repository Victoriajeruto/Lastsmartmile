import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { authApi } from "@/lib/auth";
import { Truck, MapPin, Clock, Package, Navigation } from "lucide-react";

export default function ActiveDeliveries() {
  const { data: deliveries, isLoading } = useQuery({
    queryKey: ["/api/deliveries"],
    enabled: !!authApi.getToken(),
  });

  const activeDeliveries = deliveries?.deliveries?.filter(
    (d: any) => d.status === "assigned" || d.status === "in_transit"
  ) || [];

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="active-deliveries-page">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Active Deliveries ({activeDeliveries.length})</h2>
        <Button variant="outline" data-testid="button-view-route">
          <Navigation className="w-4 h-4 mr-2" />
          View Optimized Route
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeDeliveries.map((delivery: any) => (
          <Card key={delivery.id} data-testid={`delivery-card-${delivery.id}`}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                <span className="truncate">{delivery.trackingId}</span>
                <Badge className="ml-2">
                  {delivery.status === "in_transit" ? "In Transit" : "Assigned"}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Package className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Box:</span>
                  <span className="font-medium">{delivery.boxId || "Not assigned"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Recipient:</span>
                  <span className="font-medium truncate">{delivery.recipientId}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Created:</span>
                  <span className="font-medium">{formatDate(delivery.createdAt)}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  className="flex-1"
                  data-testid={`button-complete-${delivery.id}`}
                >
                  Mark Complete
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  data-testid={`button-details-${delivery.id}`}
                >
                  Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {!activeDeliveries.length && (
        <Card>
          <CardContent className="text-center py-12">
            <Truck className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-foreground mb-2">No Active Deliveries</p>
            <p className="text-muted-foreground">You have no ongoing deliveries at the moment</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
