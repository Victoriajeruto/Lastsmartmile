import AfricasTalking from "africastalking";

interface SMSConfig {
  apiKey: string;
  username: string;
  from?: string;
}

class SMSService {
  private client: any;
  private from: string;
  private enabled: boolean;

  constructor() {
    const apiKey = process.env.AFRICAS_TALKING_API_KEY;
    const username = process.env.AFRICAS_TALKING_USERNAME || "sandbox";
    
    this.enabled = !!(apiKey && username);
    this.from = process.env.AFRICAS_TALKING_FROM || "SMARTPOBOX";

    if (this.enabled) {
      try {
        this.client = AfricasTalking({
          apiKey,
          username
        });
        console.log("✅ Africa's Talking SMS Service initialized");
      } catch (error) {
        console.error("Failed to initialize Africa's Talking:", error);
        this.enabled = false;
      }
    } else {
      console.log("⚠️  Africa's Talking SMS disabled (missing API credentials)");
    }
  }
  
  private validatePhoneNumber(phone: string): boolean {
    const cleanPhone = phone.replace(/[\s\-()]/g, '');
    const kenyaPhoneRegex = /^\+?254[17]\d{8}$/;
    const internationalPhoneRegex = /^\+?\d{10,15}$/;
    
    return kenyaPhoneRegex.test(cleanPhone) || internationalPhoneRegex.test(cleanPhone);
  }
  
  private normalizePhoneNumber(phone: string): string {
    let cleanPhone = phone.replace(/[\s\-()]/g, '');
    
    if (cleanPhone.startsWith('0') && cleanPhone.length === 10) {
      cleanPhone = '+254' + cleanPhone.substring(1);
    } else if (cleanPhone.startsWith('254') && !cleanPhone.startsWith('+')) {
      cleanPhone = '+' + cleanPhone;
    } else if (!cleanPhone.startsWith('+')) {
      cleanPhone = '+' + cleanPhone;
    }
    
    return cleanPhone;
  }

  async sendSMS(to: string, message: string): Promise<boolean> {
    if (!to || !this.validatePhoneNumber(to)) {
      console.log(`⚠️  Invalid phone number: ${to}`);
      return false;
    }
    
    const normalizedPhone = this.normalizePhoneNumber(to);
    if (!this.enabled) {
      console.log(`📱 SMS (Console Mode) - To: ${normalizedPhone}`);
      console.log(`   Message: ${message}`);
      console.log("=" .repeat(50));
      return true;
    }

    try {
      const sms = this.client.SMS;
      const result = await sms.send({
        to: [normalizedPhone],
        message,
        from: this.from
      });

      console.log(`✅ SMS sent to ${normalizedPhone}:`, result);
      return true;
    } catch (error) {
      console.error(`❌ Failed to send SMS to ${normalizedPhone}:`, error);
      return false;
    }
  }

  async sendDeliveryAssignedNotification(phone: string, trackingNumber: string, boxId: string): Promise<boolean> {
    const message = `Your package (${trackingNumber}) has been assigned to Last Link Box ${boxId}. You will be notified when it arrives.`;
    return this.sendSMS(phone, message);
  }

  async sendDeliveryDeliveredNotification(phone: string, trackingNumber: string, boxId: string): Promise<boolean> {
    const message = `Your package (${trackingNumber}) has been delivered to box ${boxId}. Generate unlock code to collect it.`;
    return this.sendSMS(phone, message);
  }

  async sendUnlockCodeNotification(phone: string, code: string, boxId: string, expiresIn: string = "5 minutes"): Promise<boolean> {
    const message = `Your unlock code for box ${boxId} is: ${code}. Valid for ${expiresIn}. Do not share this code.`;
    return this.sendSMS(phone, message);
  }

  async sendLowBatteryAlert(phone: string, boxId: string, batteryLevel: number): Promise<boolean> {
    const message = `Alert: Your Last Link Box ${boxId} has low battery (${batteryLevel}%). Please contact support.`;
    return this.sendSMS(phone, message);
  }

  async sendTamperAlert(phone: string, boxId: string): Promise<boolean> {
    const message = `SECURITY ALERT: Tampering detected on your box ${boxId}. Please check immediately or contact support.`;
    return this.sendSMS(phone, message);
  }
}

export const smsService = new SMSService();
