import crypto from "crypto";

export class QRService {
  static generateQRCode(boxId: string, userId: string): string {
    const timestamp = Date.now();
    const data = `${boxId}-${userId}-${timestamp}`;
    const hash = crypto.createHash("sha256").update(data).digest("hex").substring(0, 8);
    return `${boxId}-${hash.toUpperCase()}`;
  }

  static verifyQRCode(qrCode: string, boxId: string): boolean {
    // Extract the box ID from the QR code and verify it matches
    const parts = qrCode.split("-");
    if (parts.length < 2) return false;
    
    const extractedBoxId = parts.slice(0, -1).join("-");
    return extractedBoxId === boxId;
  }

  static getExpirationTime(minutes: number = 5): Date {
    return new Date(Date.now() + minutes * 60 * 1000);
  }
}
