import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { authApi } from "@/lib/auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Wrench, Clock, CheckCircle2, XCircle, CalendarClock, MapPin, User, Phone, Building2 } from "lucide-react";

const STATUS_OPTIONS = ["pending", "scheduled", "in_progress", "completed", "cancelled"];

export default function InstallationsManager() {
  const [statusFilter, setStatusFilter] = useState("all");
  const { toast } = useToast();

  const { data: requests, isLoading } = useQuery<any[]>({
    queryKey: ["/api/installation-requests"],
    enabled: !!authApi.getToken(),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await apiRequest("PATCH", `/api/installation-requests/${id}`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/installation-requests"] });
      toast({ title: "Status updated successfully" });
    },
    onError: (err: any) => {
      toast({ title: "Update failed", description: err.message, variant: "destructive" });
    },
  });

  const list = Array.isArray(requests) ? requests : [];
  const filtered = statusFilter === "all" ? list : list.filter((r) => r.status === statusFilter);

  const counts = STATUS_OPTIONS.reduce((acc, s) => {
    acc[s] = list.filter((r) => r.status === s).length;
    return acc;
  }, {} as Record<string, number>);

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      pending: "bg-warning/20 text-warning",
      scheduled: "bg-primary/20 text-primary",
      in_progress: "bg-blue-500/20 text-blue-600",
      completed: "bg-success/20 text-success",
      cancelled: "bg-muted text-muted-foreground",
    };
    return (
      <Badge variant="secondary" className={`capitalize ${map[status] || ""}`}>
        {status.replace(/_/g, " ")}
      </Badge>
    );
  };

  return (
    <div className="space-y-6" data-testid="installations-manager">
      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {[
          { label: "Pending", key: "pending", icon: Clock, cls: "text-warning" },
          { label: "Scheduled", key: "scheduled", icon: CalendarClock, cls: "text-primary" },
          { label: "In Progress", key: "in_progress", icon: Wrench, cls: "text-blue-600" },
          { label: "Completed", key: "completed", icon: CheckCircle2, cls: "text-success" },
          { label: "Cancelled", key: "cancelled", icon: XCircle, cls: "text-muted-foreground" },
        ].map((s) => (
          <Card key={s.key} className="cursor-pointer hover:border-primary transition-colors" onClick={() => setStatusFilter(s.key)}>
            <CardContent className="p-4 text-center">
              <s.icon className={`w-5 h-5 mx-auto mb-1 ${s.cls}`} />
              <p className="text-2xl font-bold text-foreground">{counts[s.key] || 0}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
              <Wrench className="w-4 h-4" />
              Installation Requests
            </h3>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s} className="capitalize">{s.replace(/_/g, " ")}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 w-full" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center">
              <Wrench className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No installation requests found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map((req: any) => (
                <div key={req.id} className="border border-border rounded-xl p-5 hover:bg-muted/30 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="font-semibold text-foreground">{req.fullName}</span>
                        {statusBadge(req.status)}
                        <span className="text-xs text-muted-foreground ml-auto">
                          {new Date(req.createdAt).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5" />
                          <span>{req.email}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5" />
                          <span>{req.phone}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>{req.county}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5" />
                          <span className="capitalize">{req.establishmentType?.replace(/_/g, " ")}</span>
                        </div>
                      </div>
                      {req.notes && (
                        <p className="text-sm text-muted-foreground italic line-clamp-2">{req.notes}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Select
                        value={req.status}
                        onValueChange={(val) => updateMutation.mutate({ id: req.id, status: val })}
                        disabled={updateMutation.isPending}
                      >
                        <SelectTrigger className="w-36 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUS_OPTIONS.map((s) => (
                            <SelectItem key={s} value={s} className="capitalize text-xs">{s.replace(/_/g, " ")}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
