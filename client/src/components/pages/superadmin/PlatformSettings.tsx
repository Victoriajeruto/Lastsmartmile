import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { authApi } from "@/lib/auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Cog, DollarSign, Zap, Save } from "lucide-react";

export default function PlatformSettings() {
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ basePrice: "", pricePerKg: "", isActive: "true" });

  const { data: pricingData, isLoading } = useQuery<any[]>({
    queryKey: ["/api/service-pricing"],
    enabled: !!authApi.getToken(),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await apiRequest("PATCH", `/api/service-pricing/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/service-pricing"] });
      toast({ title: "Pricing updated successfully" });
      setEditingId(null);
    },
    onError: (err: any) => {
      toast({ title: "Update failed", description: err.message, variant: "destructive" });
    },
  });

  const startEdit = (item: any) => {
    setEditingId(item.id);
    setEditForm({
      basePrice: String(item.basePrice),
      pricePerKg: String(item.pricePerKg),
      isActive: String(item.isActive),
    });
  };

  const saveEdit = () => {
    if (!editingId) return;
    updateMutation.mutate({
      id: editingId,
      data: {
        basePrice: parseFloat(editForm.basePrice),
        pricePerKg: parseFloat(editForm.pricePerKg),
        isActive: editForm.isActive === "true",
      },
    });
  };

  const serviceTypeLabel: Record<string, string> = {
    standard: "Standard",
    express: "Express",
    premium: "Premium",
  };

  const serviceTypeColor: Record<string, string> = {
    standard: "bg-muted text-muted-foreground",
    express: "bg-primary/20 text-primary",
    premium: "bg-amber-500/20 text-amber-600",
  };

  return (
    <div className="space-y-6" data-testid="platform-settings">
      {/* Service Pricing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            Service Pricing Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          ) : !pricingData?.length ? (
            <p className="text-sm text-muted-foreground py-6 text-center">No pricing tiers found</p>
          ) : (
            <div className="space-y-4">
              {pricingData.map((item: any) => (
                <div
                  key={item.id}
                  className="border border-border rounded-xl p-5 hover:border-primary/40 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <Zap className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground">
                            {serviceTypeLabel[item.serviceType] || item.serviceType}
                          </span>
                          <Badge
                            variant="secondary"
                            className={serviceTypeColor[item.serviceType] || ""}
                          >
                            {item.serviceType}
                          </Badge>
                          {!item.isActive && (
                            <Badge variant="outline" className="text-muted-foreground">Inactive</Badge>
                          )}
                        </div>
                        {editingId !== item.id && (
                          <p className="text-sm text-muted-foreground mt-0.5">
                            Base: KES {item.basePrice} · Per kg: KES {item.pricePerKg}
                          </p>
                        )}
                      </div>
                    </div>
                    {editingId !== item.id ? (
                      <Button variant="outline" size="sm" onClick={() => startEdit(item)}>
                        Edit
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => setEditingId(null)}>
                          Cancel
                        </Button>
                        <Button size="sm" className="gap-1.5" onClick={saveEdit} disabled={updateMutation.isPending}>
                          <Save className="w-3.5 h-3.5" />
                          Save
                        </Button>
                      </div>
                    )}
                  </div>

                  {editingId === item.id && (
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-border pt-4">
                      <div>
                        <Label className="text-xs text-muted-foreground mb-1 block">Base Price (KES)</Label>
                        <Input
                          type="number"
                          value={editForm.basePrice}
                          onChange={(e) => setEditForm((f) => ({ ...f, basePrice: e.target.value }))}
                          placeholder="e.g. 200"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground mb-1 block">Price per kg (KES)</Label>
                        <Input
                          type="number"
                          value={editForm.pricePerKg}
                          onChange={(e) => setEditForm((f) => ({ ...f, pricePerKg: e.target.value }))}
                          placeholder="e.g. 50"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground mb-1 block">Status</Label>
                        <Select
                          value={editForm.isActive}
                          onValueChange={(val) => setEditForm((f) => ({ ...f, isActive: val }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="true">Active</SelectItem>
                            <SelectItem value="false">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* System info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Cog className="w-4 h-4" />
            System Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            {[
              { label: "Platform", value: "Last Mile Postal System" },
              { label: "Database", value: "PostgreSQL (Neon Serverless)" },
              { label: "Payment Provider", value: "Paystack" },
              { label: "SMS Provider", value: "Africa's Talking" },
              { label: "Environment", value: process.env.NODE_ENV || "production" },
              { label: "Version", value: "1.0.0" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between p-3 bg-muted/40 rounded-lg">
                <span className="text-muted-foreground">{item.label}</span>
                <span className="font-medium text-foreground">{item.value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
