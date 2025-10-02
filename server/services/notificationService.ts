import { storage } from "../storage";
import { type InsertNotification } from "@shared/schema";

export class NotificationService {
  static async createNotification(notification: InsertNotification): Promise<void> {
    try {
      await storage.createNotification(notification);
      
      // Console logging for now (will be replaced with SMS/USSD later)
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

  static async notifyDeliveryAssigned(recipientId: string, trackingNumber: string, boxLocation: string): Promise<void> {
    await this.createNotification({
      userId: recipientId,
      title: "Package Assigned to Your Box",
      message: `Your package (${trackingNumber}) has been assigned to your box at ${boxLocation}. You will be notified when it's delivered.`,
      type: "delivery_assigned"
    });
  }

  static async notifyDeliveryDelivered(recipientId: string, trackingNumber: string, boxLocation: string): Promise<void> {
    await this.createNotification({
      userId: recipientId,
      title: "Package Delivered",
      message: `Your package (${trackingNumber}) has been delivered to your box at ${boxLocation}. Use the app to unlock your box and retrieve it.`,
      type: "delivery_delivered"
    });
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
  }
}
