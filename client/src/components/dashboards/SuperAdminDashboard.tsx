import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { authApi } from "@/lib/auth";
import {
  Shield,
  Users,
  Package,
  Truck,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  Wrench,
} from "lucide-react";

export default function SuperAdminDashboard() {
  const { data: usersData, isLoading: usersLoading } = useQuery<{ users: any[] }>({
    queryKey: ["/api/users"],
    enabled: !!authApi.getToken(),
  });

  const { data: boxesData, isLoading: boxesLoading } = useQuery<{ boxes: any[] }>({
    queryKey: ["/api/boxes"],
    enabled: !!authApi.getToken(),
  });

  const { data: deliveriesData, isLoading: deliveriesLoading } = useQuery<{ deliveries: any[] }>({
    queryKey: ["/api/deliveries"],
    enabled: !!authApi.getToken(),
  });

  const { data: paymentsData, isLoading: paymentsLoading } = useQuery<{ payments: any[] }>({
    queryKey: ["/api/payments/all"],
    enabled: !!authApi.getToken(),
  });

  const { data: tamperData } = useQuery<any>({
    queryKey: ["/api/analytics/boxes/tamper"],
    enabled: !!authApi.getToken(),
  });

  const { data: installationsData } = useQuery<any[]>({
    queryKey: ["/api/installation-requests"],
    enabled: !!authApi.getToken(),
  });

  const users = usersData?.users || [];
  const boxes = boxesData?.boxes || [];
  const deliveries = deliveriesData?.deliveries || [];
  const payments = paymentsData?.payments || [];

  const residents = users.filter((u) => u.role === "resident");
  const couriers = users.filter((u) => u.role === "courier");
  const admins = users.filter((u) => u.role === "admin");
  const activeUsers = users.filter((u) => u.isActive);

  const totalRevenue =
    payments
      .filter((p) => p.status === "completed")
      .reduce((sum: number, p: any) => sum + (p.amount || 0), 0) / 100;

  const pendingRevenue =
    payments
      .filter((p) => p.status === "pending")
      .reduce((sum: number, p: any) => sum + (p.amount || 0), 0) / 100;

  const operationalBoxes = boxes.filter((b) => b.status === "operational").length;
  const systemHealth = boxes.length > 0 ? Math.round((operationalBoxes / boxes.length) * 100) : 100;

  const completedDeliveries = deliveries.filter((d) => d.status === "delivered").length;
  const inTransit = deliveries.filter((d) => d.status === "in_transit").length;
  const pendingDeliveries = deliveries.filter((d) => d.status === "pending").length;

  const pendingInstallations = Array.isArray(installationsData)
    ? installationsData.filter((i: any) => i.status === "pending").length
    : 0;

  const kpis = [
    {
      label: "Total Revenue",
      value: `KES ${totalRevenue.toLocaleString()}`,
      sub: `KES ${pendingRevenue.toLocaleString()} pending`,
      icon: DollarSign,
      gradient: "from-emerald-600 to-emerald-500",
    },
    {
      label: "Total Users",
      value: users.length,
      sub: `${activeUsers.length} active`,
      icon: Users,
      gradient: "from-primary to-primary/80",
    },
    {
      label: "Smart Boxes",
      value: boxes.length,
      sub: `${operationalBoxes} operational`,
      icon: Package,
      gradient: "from-violet-600 to-violet-500",
    },
    {
      label: "All Deliveries",
      value: deliveries.length,
      sub: `${inTransit} in transit`,
      icon: Truck,
      gradient: "from-amber-500 to-amber-400",
    },
  ];

  const isLoading = usersLoading || boxesLoading || deliveriesLoading || paymentsLoading;

  return (
    <div className="space-y-8" data-testid="super-admin-dashboard">
      {/* Header banner */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-800 to-slate-700 p-6 text-white flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center ring-2 ring-white/20">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Super Admin Control Panel</h2>
            <p className="text-slate-300 text-sm mt-0.5">
              Platform-wide visibility and control · Last Mile Postal System
            </p>
          </div>
        </div>
        <div className="text-right hidden md:block">
          <div className="text-3xl font-bold">{systemHealth}%</div>
          <div className="text-slate-300 text-sm">Platform Health</div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className={`bg-gradient-to-br ${kpi.gradient} text-white shadow-lg border-0`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium opacity-90">{kpi.label}</span>
                <kpi.icon className="w-5 h-5 opacity-80" />
              </div>
              {isLoading ? (
                <Skeleton className="h-8 w-24 bg-white/20 mb-1" />
              ) : (
                <p className="text-3xl font-bold mb-1">{kpi.value}</p>
              )}
              <p className="text-xs opacity-75 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                {kpi.sub}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Platform breakdown row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User breakdown */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              Users by Role
            </h3>
            <div className="space-y-4">
              {[
                { label: "Residents", count: residents.length, color: "bg-primary", pct: users.length ? residents.length / users.length : 0 },
                { label: "Couriers", count: couriers.length, color: "bg-amber-500", pct: users.length ? couriers.length / users.length : 0 },
                { label: "Admins", count: admins.length, color: "bg-violet-600", pct: users.length ? admins.length / users.length : 0 },
              ].map((row) => (
                <div key={row.label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm text-foreground">{row.label}</span>
                    <span className="text-sm font-bold text-foreground">{row.count}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className={`${row.color} h-2 rounded-full transition-all`}
                      style={{ width: `${Math.round(row.pct * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5 pt-4 border-t border-border flex justify-between text-xs text-muted-foreground">
              <span>Paid subscribers</span>
              <span className="font-semibold text-foreground">
                {residents.filter((u) => u.hasCompletedPayment).length} / {residents.length}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Delivery status */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
              <Truck className="w-4 h-4 text-amber-500" />
              Delivery Status
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Completed", count: completedDeliveries, icon: CheckCircle2, cls: "text-success bg-success/10" },
                { label: "In Transit", count: inTransit, icon: Truck, cls: "text-amber-500 bg-amber-500/10" },
                { label: "Pending", count: pendingDeliveries, icon: Clock, cls: "text-primary bg-primary/10" },
                { label: "Failed", count: deliveries.filter((d) => d.status === "failed").length, icon: XCircle, cls: "text-destructive bg-destructive/10" },
              ].map((s) => (
                <div key={s.label} className={`rounded-xl p-3 ${s.cls}`}>
                  <s.icon className="w-5 h-5 mb-1" />
                  <p className="text-xl font-bold">{s.count}</p>
                  <p className="text-xs opacity-80">{s.label}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-border flex justify-between text-xs text-muted-foreground">
              <span>Total deliveries</span>
              <span className="font-semibold text-foreground">{deliveries.length}</span>
            </div>
          </CardContent>
        </Card>

        {/* Alerts & health */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-violet-600" />
              Platform Alerts
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-destructive/10">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-destructive" />
                  <span className="text-sm text-foreground">Tamper Events</span>
                </div>
                <Badge variant="destructive">{tamperData?.unresolved || 0} open</Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-warning/10">
                <div className="flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-warning" />
                  <span className="text-sm text-foreground">Pending Installs</span>
                </div>
                <Badge variant="secondary" className="bg-warning/20 text-warning">
                  {pendingInstallations}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-muted">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">Offline Boxes</span>
                </div>
                <Badge variant="outline">
                  {boxes.filter((b) => b.status === "offline").length}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-muted">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">Pending Payments</span>
                </div>
                <Badge variant="outline">
                  {payments.filter((p) => p.status === "pending").length}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent payments table */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            Recent Transactions
          </h3>
          {paymentsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : payments.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">No transactions yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    {["User", "Type", "Plan", "Amount (KES)", "Channel", "Date", "Status"].map((h) => (
                      <th key={h} className="text-left py-2 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {payments.slice(0, 8).map((p: any) => (
                    <tr key={p.id} className="border-b border-border hover:bg-muted/40 transition-colors">
                      <td className="py-3 px-3">
                        <div className="text-sm font-medium text-foreground truncate max-w-[120px]">{p.userName}</div>
                        <div className="text-xs text-muted-foreground truncate max-w-[120px]">{p.userEmail}</div>
                      </td>
                      <td className="py-3 px-3 text-sm text-muted-foreground capitalize">{p.paymentType?.replace(/_/g, " ")}</td>
                      <td className="py-3 px-3 text-sm text-muted-foreground capitalize">{p.subscriptionPlan || "—"}</td>
                      <td className="py-3 px-3 text-sm font-semibold text-foreground">{((p.amount || 0) / 100).toLocaleString()}</td>
                      <td className="py-3 px-3 text-sm text-muted-foreground capitalize">{p.channel || "—"}</td>
                      <td className="py-3 px-3 text-xs text-muted-foreground">
                        {new Date(p.createdAt).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "2-digit" })}
                      </td>
                      <td className="py-3 px-3">
                        <Badge
                          variant={p.status === "completed" ? "default" : p.status === "failed" ? "destructive" : "secondary"}
                          className={p.status === "completed" ? "bg-success/20 text-success" : ""}
                        >
                          {p.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {payments.length > 8 && (
                <p className="text-xs text-muted-foreground mt-3 text-right">
                  Showing 8 of {payments.length} · See Revenue page for full list
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
