import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Key, QrCode, Info } from "lucide-react";
import { authApi } from "@/lib/auth";

interface UnlockBoxModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UnlockBoxModal({ isOpen, onClose }: UnlockBoxModalProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("otp");
  const [otpCode, setOtpCode] = useState(["", "", "", "", "", ""]);
  const [qrCode, setQrCode] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    
    const newOtp = [...otpCode];
    newOtp[index] = value;
    setOtpCode(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.querySelector(`input[data-index="${index + 1}"]`) as HTMLInputElement;
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otpCode[index] && index > 0) {
      const prevInput = document.querySelector(`input[data-index="${index - 1}"]`) as HTMLInputElement;
      prevInput?.focus();
    }
  };

  const generateUnlockCode = async (method: "otp" | "qr") => {
    setIsGenerating(true);
    try {
      const token = authApi.getToken();
      if (!token) throw new Error("Not authenticated");

      // For demo purposes, using a static box ID
      const boxId = "KB-2341";
      
      const response = await fetch(`/api/boxes/${boxId}/unlock/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ method }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      const data = await response.json();
      
      if (method === "qr" && data.unlockCode.qrCode) {
        setQrCode(data.unlockCode.qrCode);
      }

      toast({
        title: "Unlock Code Generated",
        description: `Your ${method.toUpperCase()} code has been generated successfully.`,
      });
    } catch (error: any) {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate unlock code",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const verifyUnlockCode = async () => {
    setIsVerifying(true);
    try {
      const token = authApi.getToken();
      if (!token) throw new Error("Not authenticated");

      const boxId = "KB-2341";
      const code = activeTab === "otp" ? otpCode.join("") : qrCode;
      
      const response = await fetch(`/api/boxes/${boxId}/unlock/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code, method: activeTab }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      toast({
        title: "Box Unlocked!",
        description: "Your box has been successfully unlocked.",
      });
      onClose();
    } catch (error: any) {
      toast({
        title: "Unlock Failed",
        description: error.message || "Failed to unlock box",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleClose = () => {
    setOtpCode(["", "", "", "", "", ""]);
    setQrCode("");
    setActiveTab("otp");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md" data-testid="unlock-modal">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            Unlock Your Box
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="otp" data-testid="tab-otp">OTP Code</TabsTrigger>
            <TabsTrigger value="qr" data-testid="tab-qr">QR Code</TabsTrigger>
          </TabsList>

          <TabsContent value="otp" className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Key className="text-primary text-2xl" />
              </div>
              <p className="text-sm text-muted-foreground">Enter the 6-digit code sent to your phone</p>
            </div>

            <div className="flex justify-center gap-2">
              {otpCode.map((digit, index) => (
                <Input
                  key={index}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  className="w-12 h-12 text-center text-2xl font-bold"
                  data-index={index}
                  data-testid={`otp-input-${index}`}
                />
              ))}
            </div>

            <div className="space-y-3">
              <Button
                onClick={() => verifyUnlockCode()}
                disabled={isVerifying || otpCode.join("").length !== 6}
                className="w-full"
                data-testid="button-verify-otp"
              >
                {isVerifying ? "Unlocking..." : "Unlock Box"}
              </Button>
              <Button
                variant="outline"
                onClick={() => generateUnlockCode("otp")}
                disabled={isGenerating}
                className="w-full"
                data-testid="button-resend-otp"
              >
                {isGenerating ? "Generating..." : "Resend Code"}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="qr" className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <QrCode className="text-accent text-2xl" />
              </div>
              <p className="text-sm text-muted-foreground">Show this QR code to the box scanner</p>
            </div>

            {qrCode ? (
              <>
                <div className="bg-card border-2 border-border rounded-lg p-6">
                  <div className="qr-code-placeholder w-full aspect-square bg-foreground/5 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <QrCode className="w-16 h-16 text-muted-foreground mb-3 mx-auto" />
                      <p className="text-sm font-mono text-muted-foreground">{qrCode}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Info className="text-accent mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <p className="font-medium text-foreground mb-1">How to use:</p>
                      <ol className="text-muted-foreground space-y-1 list-decimal list-inside">
                        <li>Position QR code in front of scanner</li>
                        <li>Wait for green light confirmation</li>
                        <li>Box will unlock automatically</li>
                      </ol>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-center text-muted-foreground">
                  Code expires in <span className="font-mono font-medium">4:32</span>
                </p>
              </>
            ) : (
              <div className="text-center space-y-4">
                <p className="text-muted-foreground">Click the button below to generate a QR code</p>
                <Button
                  onClick={() => generateUnlockCode("qr")}
                  disabled={isGenerating}
                  className="w-full"
                  data-testid="button-generate-qr"
                >
                  {isGenerating ? "Generating..." : "Generate QR Code"}
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
