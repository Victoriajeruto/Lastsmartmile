import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { authApi } from "@/lib/auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Bell, Package, Truck, CheckCircle, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ResidentNotifications() {
  const { toast } = useToast();
  
  const { data: notifications, isLoading } = useQuery({
    queryKey: ["/api/notifications"],
    enabled: !!authApi.getToken(),
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      return await apiRequest("PATCH", `/api/notifications/${notificationId}/read`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      toast({
        title: "Marked as read",
        description: "Notification has been marked as read",
      });
    },
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      return await apiRequest("DELETE", `/api/notifications/${notificationId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      toast({
        title: "Deleted",
        description: "Notification has been deleted",
      });
    },
  });

  const getIcon = (type: string) => {
    switch (type) {
      case "delivery_assigned":
        return <Truck className="w-5 h-5" />;
      case "delivery_delivered":
        return <CheckCircle className="w-5 h-5" />;
      case "package_ready":
        return <Package className="w-5 h-5" />;
      default:
        return <Bell className="w-5 h-5" />;
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
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="notifications-page">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          Notifications ({notifications?.notifications?.length || 0})
        </h2>
      </div>

      <div className="space-y-4">
        {notifications?.notifications?.map((notification: any) => (
          <Card
            key={notification.id}
            className={notification.read ? "bg-card" : "bg-accent/5"}
            data-testid={`notification-${notification.id}`}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-primary/10 text-primary">
                  {getIcon(notification.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="font-semibold text-foreground">
                      {notification.title}
                    </h3>
                    {!notification.read && (
                      <Badge variant="default" className="ml-2">New</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {notification.message}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {formatDate(notification.createdAt)}
                    </span>
                    <div className="flex gap-2">
                      {!notification.read && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => markAsReadMutation.mutate(notification.id)}
                          data-testid={`button-mark-read-${notification.id}`}
                        >
                          Mark as read
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteNotificationMutation.mutate(notification.id)}
                        data-testid={`button-delete-${notification.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {!notifications?.notifications?.length && (
        <Card>
          <CardContent className="text-center py-12">
            <Bell className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-foreground mb-2">
              No notifications yet
            </p>
            <p className="text-muted-foreground">
              You'll be notified about delivery updates here
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
