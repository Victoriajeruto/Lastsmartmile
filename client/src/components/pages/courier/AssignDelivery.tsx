import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { authApi } from "@/lib/auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { PackageOpen, MapPin, Clock, CheckCircle, Loader2 } from "lucide-react";

export default function AssignDelivery() {
  const { toast } = useToast();
  
  const { data: deliveries, isLoading } = useQuery({
    queryKey: ["/api/deliveries"],
    enabled: !!authApi.getToken(),
  });
  
  const assignMutation = useMutation({
    mutationFn: async (deliveryId: string) => {
      const delivery = deliveries?.deliveries?.find((d: any) => d.id === deliveryId);
      const response = await apiRequest("POST", "/api/deliveries/assign", {
        ...delivery,
        courierId: authApi.getUser()?.id,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/deliveries"] });
      toast({
        title: "Success",
        description: "Delivery assigned successfully",
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
  
  const assignAllMutation = useMutation({
    mutationFn: async () => {
      const promises = pendingDeliveries.map((delivery: any) => 
        apiRequest("POST", "/api/deliveries/assign", {
          ...delivery,
          courierId: authApi.getUser()?.id,
        }).then(res => res.json())
      );
      return Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/deliveries"] });
      toast({
        title: "Success",
        description: "All deliveries assigned successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to assign deliveries",
        variant: "destructive",
      });
    },
  });

  const pendingDeliveries = deliveries?.deliveries?.filter(
    (d: any) => d.status === "pending"
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
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="assign-delivery-page">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <PackageOpen className="w-5 h-5" />
              Pending Deliveries ({pendingDeliveries.length})
            </span>
            <Button 
              onClick={() => assignAllMutation.mutate()}
              disabled={!pendingDeliveries.length || assignAllMutation.isPending}
              data-testid="button-assign-all"
            >
              {assignAllMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4 mr-2" />
              )}
              Assign All to Me
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pendingDeliveries.map((delivery: any) => (
              <div
                key={delivery.id}
                className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                data-testid={`pending-delivery-${delivery.id}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-foreground">
                        {delivery.trackingId}
                      </h3>
                      <Badge variant="outline">Pending</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
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
                  <Button 
                    size="sm"
                    onClick={() => assignMutation.mutate(delivery.id)}
                    disabled={assignMutation.isPending}
                    data-testid={`button-assign-${delivery.id}`}
                  >
                    {assignMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Assign to Me"
                    )}
                  </Button>
                </div>
              </div>
            ))}
            {!pendingDeliveries.length && (
              <div className="text-center py-12">
                <PackageOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium text-foreground mb-2">
                  All Deliveries Assigned
                </p>
                <p className="text-muted-foreground">
                  There are no pending deliveries to assign
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
