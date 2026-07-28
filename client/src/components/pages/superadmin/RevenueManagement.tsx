import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { authApi } from "@/lib/auth";
import { DollarSign, TrendingUp, Search, CheckCircle2, XCircle, Clock, RefreshCw } from "lucide-react";

export default function RevenueManagement() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data, isLoading } = useQuery<{ payments: any[] }>({
    queryKey: ["/api/payments/all"],
    enabled: !!authApi.getToken(),
  });

  const payments = data?.payments || [];

  const completed = payments.filter((p) => p.status === "completed");
  const totalRevenue = completed.reduce((s: number, p: any) => s + (p.amount || 0), 0) / 100;
  const pendingRevenue = payments.filter((p) => p.status === "pending").reduce((s: number, p: any) => s + (p.amount || 0), 0) / 100;
  const failedTotal = payments.filter((p) => p.status === "failed").reduce((s: number, p: any) => s + (p.amount || 0), 0) / 100;

  const revenueByPlan: Record<string, number> = {};
  for (const p of completed) {
    const plan = p.subscriptionPlan || "other";
    revenueByPlan[plan] = (revenueByPlan[plan] || 0) + (p.amount || 0) / 100;
  }

  const filtered = payments.filter((p) => {
    const matchesSearch =
      !search ||
      p.userName?.toLowerCase().includes(search.toLowerCase()) ||
      p.userEmail?.toLowerCase().includes(search.toLowerCase()) ||
      p.reference?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusIcon = (status: string) => {
    if (status === "completed") return <CheckCircle2 className="w-4 h-4 text-success" />;
    if (status === "failed") return <XCircle className="w-4 h-4 text-destructive" />;
    if (status === "refunded") return <RefreshCw className="w-4 h-4 text-warning" />;
    return <Clock className="w-4 h-4 text-muted-foreground" />;
  };

  return (
    <div className="space-y-6" data-testid="revenue-management">
      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Card className="bg-gradient-to-br from-emerald-600 to-emerald-500 text-white border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm opacity-90">Total Revenue</span>
              <DollarSign className="w-5 h-5 opacity-80" />
            </div>
            <p className="text-3xl font-bold">KES {totalRevenue.toLocaleString()}</p>
            <p className="text-xs opacity-75 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> {completed.length} successful transactions
            </p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-500 to-amber-400 text-white border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm opacity-90">Pending</span>
              <Clock className="w-5 h-5 opacity-80" />
            </div>
            <p className="text-3xl font-bold">KES {pendingRevenue.toLocaleString()}</p>
            <p className="text-xs opacity-75 mt-1">
              {payments.filter((p) => p.status === "pending").length} awaiting completion
            </p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-destructive to-destructive/80 text-white border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm opacity-90">Failed / Lost</span>
              <XCircle className="w-5 h-5 opacity-80" />
            </div>
            <p className="text-3xl font-bold">KES {failedTotal.toLocaleString()}</p>
            <p className="text-xs opacity-75 mt-1">
              {payments.filter((p) => p.status === "failed").length} failed transactions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue by plan */}
      {Object.keys(revenueByPlan).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Revenue by Subscription Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {Object.entries(revenueByPlan).map(([plan, amount]) => (
                <div key={plan} className="text-center p-4 bg-muted/40 rounded-xl">
                  <p className="text-xl font-bold text-foreground">KES {amount.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground mt-1 capitalize">{plan.replace(/_/g, " ")}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transactions table */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-5">
            <h3 className="text-base font-semibold text-foreground flex-1">All Transactions</h3>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by user or reference…"
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No transactions match your filters</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    {["", "User", "Reference", "Type", "Plan", "Amount (KES)", "Channel", "Date", "Status"].map((h) => (
                      <th key={h} className="text-left py-2 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p: any) => (
                    <tr key={p.id} className="border-b border-border hover:bg-muted/40 transition-colors">
                      <td className="py-3 px-3">{statusIcon(p.status)}</td>
                      <td className="py-3 px-3">
                        <div className="text-sm font-medium text-foreground">{p.userName}</div>
                        <div className="text-xs text-muted-foreground">{p.userEmail}</div>
                      </td>
                      <td className="py-3 px-3 font-mono text-xs text-muted-foreground">{p.reference?.substring(0, 16)}…</td>
                      <td className="py-3 px-3 text-sm text-muted-foreground capitalize">{p.paymentType?.replace(/_/g, " ")}</td>
                      <td className="py-3 px-3 text-sm text-muted-foreground capitalize">{p.subscriptionPlan?.replace(/_/g, " ") || "—"}</td>
                      <td className="py-3 px-3 text-sm font-semibold text-foreground">{((p.amount || 0) / 100).toLocaleString()}</td>
                      <td className="py-3 px-3 text-sm text-muted-foreground capitalize">{p.channel || "—"}</td>
                      <td className="py-3 px-3 text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(p.createdAt).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                      <td className="py-3 px-3">
                        <Badge
                          variant={p.status === "completed" ? "default" : p.status === "failed" ? "destructive" : "secondary"}
                          className={p.status === "completed" ? "bg-success/20 text-success border-success/30" : ""}
                        >
                          {p.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-muted-foreground mt-3">
                Showing {filtered.length} of {payments.length} transactions
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
