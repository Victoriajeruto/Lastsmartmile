import { storage } from "../storage";
import { smsService } from "./smsService";
import { websocketService } from "./websocketService";
import { type InsertNotification } from "../../shared/schema.js";

export class NotificationService {
  static async createNotification(notification: InsertNotification): Promise<void> {
    try {
      const createdNotification = await storage.createNotification(notification);
      
      websocketService.sendToUser(notification.userId, {
        type: "notification",
        data: createdNotification
      });
      
      console.log(`📱 NOTIFICATION - User: ${notification.userId}`);
      console.log(`   Title: ${notification.title}`);
      console.log(`   Message: ${notification.message}`);
      console.log(`   Type: ${notification.type}`);
      console.log(`   Time: ${new Date().toISOString()}`);
      console.log("=" .repeat(50));
    } catch (error) {
      console.error("Failed to create notification:", error);
    }
  }

  static async notifyDeliveryAssigned(recipientId: string, trackingNumber: string, boxId: string): Promise<void> {
    await this.createNotification({
      userId: recipientId,
      title: "Package Assigned to Your Box",
      message: `Your package (${trackingNumber}) has been assigned to box ${boxId}. You will be notified when it's delivered.`,
      type: "delivery_assigned"
    });
    
    const user = await storage.getUser(recipientId);
    if (user?.phone) {
      await smsService.sendDeliveryAssignedNotification(user.phone, trackingNumber, boxId);
    }
  }

  static async notifyDeliveryDelivered(recipientId: string, trackingNumber: string, boxId: string): Promise<void> {
    await this.createNotification({
      userId: recipientId,
      title: "Package Delivered",
      message: `Your package (${trackingNumber}) has been delivered to box ${boxId}. Use the app to unlock your box.`,
      type: "delivery_delivered"
    });
    
    const user = await storage.getUser(recipientId);
    if (user?.phone) {
      await smsService.sendDeliveryDeliveredNotification(user.phone, trackingNumber, boxId);
    }
  }

  static async notifyBoxUnlocked(userId: string, boxId: string): Promise<void> {
    await this.createNotification({
      userId,
      title: "Box Unlocked",
      message: `Your box ${boxId} has been successfully unlocked. Please remember to close it securely after retrieving your items.`,
      type: "box_unlocked"
    });
  }

  static async notifyLowBattery(userId: string, boxId: string, batteryLevel: number): Promise<void> {
    await this.createNotification({
      userId,
      title: "Low Battery Alert",
      message: `Your box ${boxId} has low battery (${batteryLevel}%). Maintenance will be scheduled soon.`,
      type: "low_battery"
    });
    
    const user = await storage.getUser(userId);
    if (user?.phone) {
      await smsService.sendLowBatteryAlert(user.phone, boxId, batteryLevel);
    }
  }
  
  static async notifyTamperDetected(userId: string, boxId: string): Promise<void> {
    await this.createNotification({
      userId,
      title: "Security Alert - Tamper Detected",
      message: `Tampering detected on your Last Link Box ${boxId}. Please check your box immediately and contact support if needed.`,
      type: "security_alert"
    });
    
    const user = await storage.getUser(userId);
    if (user?.phone) {
      await smsService.sendTamperAlert(user.phone, boxId);
    }
  }
  
  static async sendUnlockCodeSMS(userId: string, code: string, boxId: string): Promise<void> {
    const user = await storage.getUser(userId);
    if (user?.phone) {
      await smsService.sendUnlockCodeNotification(user.phone, code, boxId);
    }
  }
}
