import axios from "axios";

interface PaystackInitializeRequest {
  email: string;
  amount: number; // Amount in smallest currency unit (kobo for NGN, cents for KES)
  reference: string;
  callback_url?: string;
  metadata?: Record<string, any>;
  channels?: string[]; // e.g., ['card', 'mobile_money', 'bank']
}

interface PaystackInitializeResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

interface PaystackVerifyResponse {
  status: boolean;
  message: string;
  data: {
    id: number;
    domain: string;
    status: string; // 'success', 'failed', 'abandoned'
    reference: string;
    amount: number;
    message: string | null;
    gateway_response: string;
    paid_at: string;
    created_at: string;
    channel: string; // 'card', 'mobile_money', etc.
    currency: string;
    ip_address: string;
    metadata: any;
    customer: {
      id: number;
      email: string;
      customer_code: string;
    };
    authorization: {
      authorization_code: string;
      bin: string;
      last4: string;
      exp_month: string;
      exp_year: string;
      channel: string;
      card_type: string;
      bank: string;
      country_code: string;
      brand: string;
    };
  };
}

class PaystackService {
  private secretKey: string;
  private baseUrl: string;
  private enabled: boolean;

  constructor() {
    this.secretKey = process.env.PAYSTACK_SECRET_KEY || "";
    this.baseUrl = "https://api.paystack.co";
    
    this.enabled = !!this.secretKey;
    
    if (this.enabled) {
      console.log(`✅ Paystack Service initialized`);
    } else {
      console.log("⚠️  Paystack Service disabled (missing API credentials)");
    }
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
    
    return `+${cleanPhone}`;
  }

  async initializeTransaction(request: PaystackInitializeRequest): Promise<PaystackInitializeResponse> {
    if (!this.enabled) {
      console.log("💰 Paystack (Mock Mode):");
      console.log(`   Email: ${request.email}`);
      console.log(`   Amount: KES ${request.amount / 100}`);
      console.log(`   Reference: ${request.reference}`);
      console.log("=" .repeat(50));
      
      return {
        status: true,
        message: "Authorization URL created (Mock Mode)",
        data: {
          authorization_url: `https://checkout.paystack.com/mock/${request.reference}`,
          access_code: "mock-access-" + Date.now(),
          reference: request.reference,
        },
      };
    }

    try {
      const payload = {
        email: request.email,
        amount: request.amount,
        reference: request.reference,
        callback_url: request.callback_url,
        metadata: request.metadata,
        channels: request.channels || ['card', 'mobile_money'], // Support both card and M-Pesa
      };

      const response = await axios.post<PaystackInitializeResponse>(
        `${this.baseUrl}/transaction/initialize`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log(`✅ Paystack transaction initialized: ${request.reference} - KES ${request.amount / 100}`);
      return response.data;
    } catch (error: any) {
      console.error("❌ Paystack initialization failed:", error.response?.data || error.message);
      throw new Error(error.response?.data?.message || "Failed to initialize Paystack payment");
    }
  }

  async verifyTransaction(reference: string): Promise<PaystackVerifyResponse> {
    if (!this.enabled) {
      return {
        status: true,
        message: "Verification successful (Mock Mode)",
        data: {
          id: Math.floor(Math.random() * 1000000),
          domain: "test",
          status: "success",
          reference: reference,
          amount: 50000, // Mock amount
          message: null,
          gateway_response: "Successful (Mock)",
          paid_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          channel: "mobile_money",
          currency: "KES",
          ip_address: "127.0.0.1",
          metadata: {},
          customer: {
            id: 1,
            email: "mock@example.com",
            customer_code: "CUS_mock123",
          },
          authorization: {
            authorization_code: "AUTH_mock123",
            bin: "000000",
            last4: "0000",
            exp_month: "12",
            exp_year: "2030",
            channel: "mobile_money",
            card_type: "mobile_money",
            bank: "Mock Bank",
            country_code: "KE",
            brand: "mpesa",
          },
        },
      };
    }

    try {
      const response = await axios.get<PaystackVerifyResponse>(
        `${this.baseUrl}/transaction/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
          },
        }
      );

      console.log(`✅ Paystack transaction verified: ${reference} - ${response.data.data.status}`);
      return response.data;
    } catch (error: any) {
      console.error("❌ Paystack verification failed:", error.response?.data || error.message);
      throw new Error(error.response?.data?.message || "Failed to verify Paystack transaction");
    }
  }

  generateReference(prefix: string = "PAY"): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return `${prefix}_${timestamp}_${random}`;
  }
}

export const paystackService = new PaystackService();
export type { PaystackInitializeRequest, PaystackInitializeResponse, PaystackVerifyResponse };
