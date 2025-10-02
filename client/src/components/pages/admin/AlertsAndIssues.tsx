import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { authApi } from "@/lib/auth";
import { AlertTriangle, Battery, Lock, MapPin } from "lucide-react";

export default function AlertsAndIssues() {
  const { data: boxes, isLoading } = useQuery({
    queryKey: ["/api/boxes"],
    enabled: !!authApi.getToken(),
  });

  const getIssues = () => {
    if (!boxes?.boxes) return [];
    
    const issues = [];
    
    // Check for low battery
    for (const box of boxes.boxes) {
      if (box.batteryLevel && box.batteryLevel < 20) {
        issues.push({
          type: "battery",
          severity: box.batteryLevel < 10 ? "critical" : "warning",
          title: "Low Battery Alert",
          description: `Box ${box.boxId} has ${box.batteryLevel}% battery remaining`,
          location: box.location,
          boxId: box.boxId,
        });
      }
      
      // Check for offline boxes
      if (box.status === "offline") {
        issues.push({
          type: "offline",
          severity: "critical",
          title: "Box Offline",
          description: `Box ${box.boxId} is currently offline`,
          location: box.location,
          boxId: box.boxId,
        });
      }
      
      // Check for maintenance needed
      if (box.status === "maintenance") {
        issues.push({
          type: "maintenance",
          severity: "warning",
          title: "Maintenance Required",
          description: `Box ${box.boxId} requires maintenance`,
          location: box.location,
          boxId: box.boxId,
        });
      }
    }
    
    return issues;
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "critical":
        return <Badge variant="destructive">Critical</Badge>;
      case "warning":
        return <Badge className="bg-warning/10 text-warning">Warning</Badge>;
      default:
        return <Badge variant="outline">Info</Badge>;
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "battery":
        return <Battery className="w-5 h-5" />;
      case "offline":
        return <AlertTriangle className="w-5 h-5" />;
      case "maintenance":
        return <Lock className="w-5 h-5" />;
      default:
        return <AlertTriangle className="w-5 h-5" />;
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
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const issues = getIssues();

  return (
    <div className="space-y-6" data-testid="alerts-issues-page">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            System Alerts & Issues
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {issues.map((issue, index) => (
              <div
                key={index}
                className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                data-testid={`issue-${index}`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${
                    issue.severity === "critical" ? "bg-destructive/10 text-destructive" : "bg-warning/10 text-warning"
                  }`}>
                    {getIcon(issue.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-foreground">{issue.title}</h3>
                      {getSeverityBadge(issue.severity)}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {issue.description}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      <span>{issue.location || "Location not specified"}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {!issues.length && (
              <div className="text-center py-12">
                <AlertTriangle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium text-foreground mb-2">All Systems Operational</p>
                <p className="text-muted-foreground">No alerts or issues detected</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
