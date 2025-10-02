import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { authApi } from "@/lib/auth";
import { MapPin, Battery, Package, Navigation } from "lucide-react";

export default function BoxLocations() {
  const { data: boxes, isLoading } = useQuery({
    queryKey: ["/api/boxes"],
    enabled: !!authApi.getToken(),
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "operational":
        return <Badge className="bg-success/10 text-success">Operational</Badge>;
      case "maintenance":
        return <Badge className="bg-warning/10 text-warning">Maintenance</Badge>;
      case "offline":
        return <Badge variant="destructive">Offline</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getBatteryColor = (level: number | null) => {
    if (!level) return "text-muted-foreground";
    if (level < 20) return "text-destructive";
    if (level < 50) return "text-warning";
    return "text-success";
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="box-locations-page">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          Smart Box Locations ({boxes?.boxes?.length || 0})
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {boxes?.boxes?.map((box: any) => (
          <Card key={box.id} data-testid={`box-card-${box.id}`}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  {box.boxId}
                </span>
                {getStatusBadge(box.status)}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground truncate">
                    {box.location || "Location not set"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Battery className={`w-4 h-4 ${getBatteryColor(box.batteryLevel)}`} />
                  <span className={getBatteryColor(box.batteryLevel)}>
                    {box.batteryLevel ? `${box.batteryLevel}%` : "N/A"}
                  </span>
                </div>
                {box.ownerId && (
                  <div className="text-sm text-muted-foreground">
                    Owner: {box.ownerId}
                  </div>
                )}
              </div>
              <div className="pt-2 border-t">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(box.location || "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline flex items-center gap-1"
                  data-testid={`link-navigate-${box.id}`}
                >
                  <Navigation className="w-3 h-3" />
                  Navigate to location
                </a>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {!boxes?.boxes?.length && (
        <Card>
          <CardContent className="text-center py-12">
            <MapPin className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-foreground mb-2">No Boxes Found</p>
            <p className="text-muted-foreground">No smart boxes are currently registered</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
