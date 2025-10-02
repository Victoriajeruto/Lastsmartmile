import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { authApi } from "@/lib/auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { CreditCard, CheckCircle, XCircle, Loader2, ArrowRight } from "lucide-react";

interface PaymentGateProps {
  children: React.ReactNode;
}

export default function PaymentGate({ children }: PaymentGateProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [authUrl, setAuthUrl] = useState<string | null>(null);

  // Check user's payment status
  const { data: userData, isLoading: userLoading } = useQuery({
    queryKey: ["/api/auth/me"],
    enabled: !!authApi.getToken(),
  });

  // Check payment status if there's a pending payment
  const { data: paymentData, refetch: refetchPaymentStatus } = useQuery({
    queryKey: ["/api/payments", paymentId, "status"],
    enabled: !!paymentId && !!authApi.getToken(),
    refetchInterval: 5000, // Poll every 5 seconds for payment updates
  });

  const initiatePaymentMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/payments/initiate`, {
        amount: 500, // KES 500 for subscription
        paymentType: "subscription",
        description: "Last Mile Postal System - Subscription Activation",
      });
      return response.json();
    },
    onSuccess: (data: any) => {
      setPaymentId(data.payment.id);
      setAuthUrl(data.payment.authorizationUrl);
      toast({
        title: "Payment Initialized",
        description: "Click the button below to complete your payment.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Payment Failed",
        description: error.message || "Failed to initialize payment. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Check if payment is complete and refetch user data
  useEffect(() => {
    if (paymentData?.payment?.status === "completed") {
      // Invalidate user query to update hasCompletedPayment status
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({
        title: "Payment Successful!",
        description: "Your dashboard has been activated. Welcome!",
      });
      setPaymentId(null);
      setAuthUrl(null);
    }
  }, [paymentData, toast]);

  if (userLoading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-24 mb-4" />
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // If user has completed payment, show the children (full dashboard)
  if (userData?.hasCompletedPayment) {
    return <>{children}</>;
  }

  // Show payment gate
  return (
    <div className="max-w-2xl mx-auto py-12 px-4" data-testid="payment-gate">
      <Card>
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <CreditCard className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Activate Your Dashboard</CardTitle>
          <CardDescription className="text-base mt-2">
            Complete your subscription payment to access your full dashboard and start receiving packages
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Subscription Details */}
          <div className="bg-muted/50 rounded-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Subscription Plan</span>
              <Badge variant="default">Monthly</Badge>
            </div>
            <div className="flex items-center justify-between text-2xl font-bold">
              <span>Total Amount</span>
              <span className="text-primary">KES 500</span>
            </div>
            <div className="text-sm text-muted-foreground space-y-2 pt-4 border-t">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-success" />
                <span>Secure package delivery to your smart box</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-success" />
                <span>Real-time delivery notifications (SMS & In-app)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-success" />
                <span>OTP & QR code access to your box</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-success" />
                <span>24/7 customer support</span>
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="space-y-3">
            <p className="text-sm font-medium">Accepted Payment Methods</p>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="text-sm">💳 Visa Card</Badge>
              <Badge variant="outline" className="text-sm">📱 M-Pesa</Badge>
            </div>
          </div>

          {/* Payment Status */}
          {paymentId && paymentData && (
            <div className="bg-accent/10 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {paymentData.payment.status === "pending" && (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-warning" />
                      <span className="text-sm font-medium">Payment Pending...</span>
                    </>
                  )}
                  {paymentData.payment.status === "completed" && (
                    <>
                      <CheckCircle className="w-4 h-4 text-success" />
                      <span className="text-sm font-medium text-success">Payment Successful!</span>
                    </>
                  )}
                  {paymentData.payment.status === "failed" && (
                    <>
                      <XCircle className="w-4 h-4 text-destructive" />
                      <span className="text-sm font-medium text-destructive">Payment Failed</span>
                    </>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => refetchPaymentStatus()}
                  data-testid="button-refresh-payment"
                >
                  Refresh
                </Button>
              </div>
            </div>
          )}

          {/* Payment Button */}
          {!authUrl && (
            <Button
              className="w-full"
              size="lg"
              onClick={() => initiatePaymentMutation.mutate()}
              disabled={initiatePaymentMutation.isPending}
              data-testid="button-initiate-payment"
            >
              {initiatePaymentMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Initializing Payment...
                </>
              ) : (
                <>
                  Continue to Payment
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          )}

          {/* Open Paystack Checkout */}
          {authUrl && (
            <div className="space-y-3">
              <Button
                className="w-full"
                size="lg"
                onClick={() => window.open(authUrl, "_blank")}
                data-testid="button-open-payment"
              >
                Complete Payment (Paystack)
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                A new window will open for secure payment. After completing payment, return here and click "Refresh" above.
              </p>
            </div>
          )}

          {/* Help Text */}
          <p className="text-xs text-center text-muted-foreground pt-4 border-t">
            Your payment is secure and encrypted. For support, contact us at support@lastmilepostal.co.ke
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
