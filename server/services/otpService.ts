import crypto from "crypto";

export class OTPService {
  static generateOTP(length: number = 6): string {
    const digits = "0123456789";
    let otp = "";
    
    for (let i = 0; i < length; i++) {
      otp += digits[Math.floor(Math.random() * digits.length)];
    }
    
    return otp;
  }

  static getExpirationTime(minutes: number = 5): Date {
    return new Date(Date.now() + minutes * 60 * 1000);
  }

  static isExpired(expiresAt: Date): boolean {
    return new Date() > expiresAt;
  }
}
