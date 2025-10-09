import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Package, MapPin, Calendar, Phone, Mail, User, CheckCircle, XCircle, Clock } from "lucide-react";
import { format } from "date-fns";

interface InstallationRequest {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  county: string;
  estateName: string;
  apartmentName?: string;
  latitude: string;
  longitude: string;
  preferredDate?: string;
  notes?: string;
  status: "pending" | "contacted" | "scheduled" | "completed" | "cancelled";
  createdAt: string;
}

export default function InstallationRequestsManager() {
  const [selectedRequest, setSelectedRequest] = useState<InstallationRequest | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const { toast } = useToast();

  const { data: requestsData, isLoading } = useQuery<InstallationRequest[]>({
    queryKey: ["/api/installation-requests"],
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return await apiRequest("PATCH", `/api/installation-requests/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/installation-requests"] });
      toast({
        title: "Status Updated",
        description: "Installation request status updated successfully.",
      });
      setDetailsModalOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const viewDetails = (request: InstallationRequest) => {
    setSelectedRequest(request);
    setDetailsModalOpen(true);
  };

  const updateStatus = (status: string) => {
    if (selectedRequest) {
      updateStatusMutation.mutate({ id: selectedRequest.id, status });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; icon: any }> = {
      pending: { variant: "outline", icon: Clock },
      contacted: { variant: "secondary", icon: Phone },
      scheduled: { variant: "default", icon: Calendar },
      completed: { variant: "default", icon: CheckCircle },
      cancelled: { variant: "destructive", icon: XCircle },
    };

    const config = variants[status] || variants.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1 w-fit">
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const pendingCount = requestsData?.filter(r => r.status === "pending").length || 0;
  const scheduledCount = requestsData?.filter(r => r.status === "scheduled").length || 0;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Installation Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Installation Requests
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Manage hardware installation requests from customers
            </p>
          </div>
          <div className="flex gap-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{pendingCount}</div>
              <div className="text-xs text-muted-foreground">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{scheduledCount}</div>
              <div className="text-xs text-muted-foreground">Scheduled</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!requestsData || requestsData.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No installation requests yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {requestsData.map((request) => (
                <div
                  key={request.id}
                  className="border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => viewDetails(request)}
                  data-testid={`request-card-${request.id}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold truncate">
                          {request.firstName} {request.lastName}
                        </h3>
                        {getStatusBadge(request.status)}
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span className="truncate">{request.estateName}, {request.county}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          <span>{request.phone}</span>
                        </div>
                        {request.preferredDate && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>{format(new Date(request.preferredDate), "MMM dd, yyyy")}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1 text-xs">
                          <Clock className="w-3 h-3" />
                          <span>Requested {format(new Date(request.createdAt), "MMM dd")}</span>
                        </div>
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        viewDetails(request);
                      }}
                      data-testid={`button-view-${request.id}`}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Request Details Modal */}
      <Dialog open={detailsModalOpen} onOpenChange={setDetailsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Installation Request Details</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-6">
              {/* Customer Information */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Customer Information
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Name:</span>
                    <p className="font-medium">{selectedRequest.firstName} {selectedRequest.lastName}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Email:</span>
                    <p className="font-medium flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {selectedRequest.email}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Phone:</span>
                    <p className="font-medium flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {selectedRequest.phone}
                    </p>
                  </div>
                </div>
              </div>

              {/* Location Information */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Installation Location
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">County:</span>
                    <p className="font-medium">{selectedRequest.county}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Estate Name:</span>
                    <p className="font-medium">{selectedRequest.estateName}</p>
                  </div>
                  {selectedRequest.apartmentName && (
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Apartment/Building:</span>
                      <p className="font-medium">{selectedRequest.apartmentName}</p>
                    </div>
                  )}
                  <div className="col-span-2">
                    <span className="text-muted-foreground">GPS Coordinates:</span>
                    <p className="font-medium font-mono text-xs">
                      {selectedRequest.latitude}, {selectedRequest.longitude}
                    </p>
                  </div>
                </div>
              </div>

              {/* Additional Details */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Additional Details
                </h3>
                <div className="space-y-3 text-sm">
                  {selectedRequest.preferredDate && (
                    <div>
                      <span className="text-muted-foreground">Preferred Date:</span>
                      <p className="font-medium">{format(new Date(selectedRequest.preferredDate), "MMMM dd, yyyy")}</p>
                    </div>
                  )}
                  {selectedRequest.notes && (
                    <div>
                      <span className="text-muted-foreground">Notes:</span>
                      <p className="font-medium bg-muted p-3 rounded-md mt-1">{selectedRequest.notes}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-muted-foreground">Request Date:</span>
                    <p className="font-medium">{format(new Date(selectedRequest.createdAt), "MMMM dd, yyyy 'at' hh:mm a")}</p>
                  </div>
                </div>
              </div>

              {/* Status Management */}
              <div>
                <h3 className="font-semibold mb-3">Update Status</h3>
                <div className="flex gap-2 flex-wrap">
                  <Button
                    size="sm"
                    variant={selectedRequest.status === "pending" ? "default" : "outline"}
                    onClick={() => updateStatus("pending")}
                    disabled={updateStatusMutation.isPending}
                    data-testid="button-status-pending"
                  >
                    <Clock className="w-4 h-4 mr-1" />
                    Pending
                  </Button>
                  <Button
                    size="sm"
                    variant={selectedRequest.status === "contacted" ? "default" : "outline"}
                    onClick={() => updateStatus("contacted")}
                    disabled={updateStatusMutation.isPending}
                    data-testid="button-status-contacted"
                  >
                    <Phone className="w-4 h-4 mr-1" />
                    Contacted
                  </Button>
                  <Button
                    size="sm"
                    variant={selectedRequest.status === "scheduled" ? "default" : "outline"}
                    onClick={() => updateStatus("scheduled")}
                    disabled={updateStatusMutation.isPending}
                    data-testid="button-status-scheduled"
                  >
                    <Calendar className="w-4 h-4 mr-1" />
                    Scheduled
                  </Button>
                  <Button
                    size="sm"
                    variant={selectedRequest.status === "completed" ? "default" : "outline"}
                    onClick={() => updateStatus("completed")}
                    disabled={updateStatusMutation.isPending}
                    data-testid="button-status-completed"
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Completed
                  </Button>
                  <Button
                    size="sm"
                    variant={selectedRequest.status === "cancelled" ? "destructive" : "outline"}
                    onClick={() => updateStatus("cancelled")}
                    disabled={updateStatusMutation.isPending}
                    data-testid="button-status-cancelled"
                  >
                    <XCircle className="w-4 h-4 mr-1" />
                    Cancelled
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
