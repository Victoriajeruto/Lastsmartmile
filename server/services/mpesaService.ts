import axios from "axios";

interface MPesaStkPushRequest {
  phone: string;
  amount: number;
  accountReference: string;
  transactionDesc: string;
}

interface MPesaStkPushResponse {
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResponseCode: string;
  ResponseDescription: string;
  CustomerMessage: string;
}

class MPesaService {
  private consumerKey: string;
  private consumerSecret: string;
  private businessShortCode: string;
  private passKey: string;
  private callbackUrl: string;
  private baseUrl: string;
  private enabled: boolean;

  constructor() {
    this.consumerKey = process.env.MPESA_CONSUMER_KEY || "";
    this.consumerSecret = process.env.MPESA_CONSUMER_SECRET || "";
    this.businessShortCode = process.env.MPESA_BUSINESS_SHORT_CODE || "174379";
    this.passKey = process.env.MPESA_PASS_KEY || "";
    this.callbackUrl = process.env.MPESA_CALLBACK_URL || "https://yourdomain.com/api/payments/callback";
    
    const environment = process.env.MPESA_ENVIRONMENT || "sandbox";
    this.baseUrl = environment === "production"
      ? "https://api.safaricom.co.ke"
      : "https://sandbox.safaricom.co.ke";
    
    this.enabled = !!(this.consumerKey && this.consumerSecret && this.passKey);
    
    if (this.enabled) {
      console.log(`✅ M-Pesa Service initialized (${environment} mode)`);
    } else {
      console.log("⚠️  M-Pesa Service disabled (missing API credentials)");
    }
  }

  private async generateAccessToken(): Promise<string> {
    if (!this.enabled) {
      throw new Error("M-Pesa Service not configured");
    }

    try {
      const auth = Buffer.from(`${this.consumerKey}:${this.consumerSecret}`).toString("base64");
      
      const response = await axios.get(
        `${this.baseUrl}/oauth/v1/generate?grant_type=client_credentials`,
        {
          headers: {
            Authorization: `Basic ${auth}`,
          },
        }
      );
      
      return response.data.access_token;
    } catch (error: any) {
      console.error("Failed to generate M-Pesa access token:", error.response?.data || error.message);
      throw new Error("Failed to generate M-Pesa access token");
    }
  }

  private generateTimestamp(): string {
    return new Date()
      .toISOString()
      .replace(/[-:TZ.]/g, "")
      .slice(0, 14);
  }

  private generatePassword(timestamp: string): string {
    return Buffer.from(
      `${this.businessShortCode}${this.passKey}${timestamp}`
    ).toString("base64");
  }

  private normalizePhoneNumber(phone: string): string {
    let cleanPhone = phone.replace(/[\s\-()]/g, "");
    
    if (cleanPhone.startsWith("0") && cleanPhone.length === 10) {
      cleanPhone = "254" + cleanPhone.substring(1);
    } else if (cleanPhone.startsWith("+254")) {
      cleanPhone = cleanPhone.substring(1);
    } else if (cleanPhone.startsWith("254")) {
      cleanPhone = cleanPhone;
    } else if (!cleanPhone.startsWith("254")) {
      cleanPhone = "254" + cleanPhone;
    }
    
    return cleanPhone;
  }

  async initiateSTKPush(request: MPesaStkPushRequest): Promise<MPesaStkPushResponse> {
    if (!this.enabled) {
      console.log("💰 M-Pesa (Mock Mode):");
      console.log(`   Phone: ${request.phone}`);
      console.log(`   Amount: KES ${request.amount}`);
      console.log(`   Reference: ${request.accountReference}`);
      console.log(`   Description: ${request.transactionDesc}`);
      console.log("=" .repeat(50));
      
      return {
        MerchantRequestID: "mock-merchant-" + Date.now(),
        CheckoutRequestID: "mock-checkout-" + Date.now(),
        ResponseCode: "0",
        ResponseDescription: "Success (Mock Mode)",
        CustomerMessage: "Mock payment prompt sent",
      };
    }

    try {
      const token = await this.generateAccessToken();
      const timestamp = this.generateTimestamp();
      const password = this.generatePassword(timestamp);
      const phone = this.normalizePhoneNumber(request.phone);

      const payload = {
        BusinessShortCode: this.businessShortCode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: request.amount,
        PartyA: phone,
        PartyB: this.businessShortCode,
        PhoneNumber: phone,
        CallBackURL: this.callbackUrl,
        AccountReference: request.accountReference,
        TransactionDesc: request.transactionDesc,
      };

      const response = await axios.post(
        `${this.baseUrl}/mpesa/stkpush/v1/processrequest`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log(`✅ M-Pesa STK Push initiated for ${phone}: KES ${request.amount}`);
      return response.data;
    } catch (error: any) {
      console.error("❌ M-Pesa STK Push failed:", error.response?.data || error.message);
      throw new Error(error.response?.data?.errorMessage || "Failed to initiate M-Pesa payment");
    }
  }

  async queryTransactionStatus(checkoutRequestId: string): Promise<any> {
    if (!this.enabled) {
      return {
        ResponseCode: "0",
        ResponseDescription: "Mock transaction successful",
        ResultCode: "0",
        ResultDesc: "The service request is processed successfully (Mock)",
      };
    }

    try {
      const token = await this.generateAccessToken();
      const timestamp = this.generateTimestamp();
      const password = this.generatePassword(timestamp);

      const payload = {
        BusinessShortCode: this.businessShortCode,
        Password: password,
        Timestamp: timestamp,
        CheckoutRequestID: checkoutRequestId,
      };

      const response = await axios.post(
        `${this.baseUrl}/mpesa/stkpushquery/v1/query`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error("❌ M-Pesa query failed:", error.response?.data || error.message);
      throw new Error("Failed to query M-Pesa transaction");
    }
  }
}

export const mpesaService = new MPesaService();
export type { MPesaStkPushRequest, MPesaStkPushResponse };
