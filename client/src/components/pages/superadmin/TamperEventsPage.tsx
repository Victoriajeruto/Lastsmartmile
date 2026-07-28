import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { authApi } from "@/lib/auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { AlertTriangle, ShieldCheck, MapPin, Clock, CheckCircle2 } from "lucide-react";

export default function TamperEventsPage() {
  const { toast } = useToast();

  const { data: stats, isLoading } = useQuery<any>({
    queryKey: ["/api/analytics/boxes/tamper"],
    enabled: !!authApi.getToken(),
  });

  const resolveMutation = useMutation({
    mutationFn: async (eventId: string) => {
      const res = await apiRequest("PATCH", `/api/tamper-events/${eventId}/resolve`, {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/boxes/tamper"] });
      toast({ title: "Event resolved" });
    },
    onError: (err: any) => {
      toast({ title: "Failed to resolve", description: err.message, variant: "destructive" });
    },
  });

  return (
    <div className="space-y-6" data-testid="tamper-events-page">
      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Events", value: stats?.total ?? 0, cls: "text-foreground", bg: "bg-muted/60" },
          { label: "Unresolved", value: stats?.unresolved ?? 0, cls: "text-destructive", bg: "bg-destructive/10" },
          { label: "Last 24 h", value: stats?.last24Hours ?? 0, cls: "text-warning", bg: "bg-warning/10" },
          { label: "Last 7 days", value: stats?.last7Days ?? 0, cls: "text-primary", bg: "bg-primary/10" },
        ].map((s) => (
          <Card key={s.label} className="border-0 shadow-sm">
            <CardContent className={`p-5 rounded-xl ${s.bg}`}>
              {isLoading ? (
                <Skeleton className="h-8 w-16 mb-1" />
              ) : (
                <p className={`text-3xl font-bold ${s.cls}`}>{s.value}</p>
              )}
              <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Unresolved events */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-destructive" />
            Unresolved Tamper Events
          </h3>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          ) : !stats?.unresolvedEvents?.length ? (
            <div className="py-12 text-center">
              <ShieldCheck className="w-12 h-12 text-success mx-auto mb-3" />
              <p className="text-base font-semibold text-foreground">All clear</p>
              <p className="text-sm text-muted-foreground mt-1">No unresolved tamper events</p>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.unresolvedEvents.map((event: any) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between gap-4 border border-destructive/30 bg-destructive/5 rounded-xl p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 bg-destructive/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <AlertTriangle className="w-4 h-4 text-destructive" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm text-foreground">Box {event.boxId}</span>
                        <Badge variant="destructive" className="text-xs">Tamper Detected</Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        {event.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {event.location}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(event.detectedAt).toLocaleString("en-KE", { dateStyle: "medium", timeStyle: "short" })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-success text-success hover:bg-success hover:text-success-foreground gap-1.5 shrink-0"
                    onClick={() => resolveMutation.mutate(event.id)}
                    disabled={resolveMutation.isPending}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Resolve
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resolved count */}
      {(stats?.resolved ?? 0) > 0 && (
        <Card className="bg-success/5 border-success/20">
          <CardContent className="p-5 flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-success" />
            <p className="text-sm text-foreground">
              <span className="font-semibold">{stats.resolved}</span> tamper event{stats.resolved !== 1 ? "s" : ""} have been resolved across the platform.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
