import { 
  users, boxes, deliveries, unlockCodes, notifications,
  type User, type InsertUser, type Box, type InsertBox, 
  type Delivery, type InsertDelivery, type UnlockCode, type InsertUnlockCode,
  type Notification, type InsertNotification
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined>;

  // Box methods
  getBox(id: string): Promise<Box | undefined>;
  getBoxByBoxId(boxId: string): Promise<Box | undefined>;
  getBoxesByOwnerId(ownerId: string): Promise<Box[]>;
  getAllBoxes(): Promise<Box[]>;
  createBox(box: InsertBox): Promise<Box>;
  updateBox(id: string, updates: Partial<InsertBox>): Promise<Box | undefined>;

  // Delivery methods
  getDelivery(id: string): Promise<Delivery | undefined>;
  getDeliveryByTrackingNumber(trackingNumber: string): Promise<Delivery | undefined>;
  getDeliveriesByRecipientId(recipientId: string): Promise<Delivery[]>;
  getDeliveriesByCourierId(courierId: string): Promise<Delivery[]>;
  getDeliveriesByBoxId(boxId: string): Promise<Delivery[]>;
  getAllDeliveries(): Promise<Delivery[]>;
  createDelivery(delivery: InsertDelivery): Promise<Delivery>;
  updateDelivery(id: string, updates: Partial<InsertDelivery>): Promise<Delivery | undefined>;

  // Unlock code methods
  getUnlockCode(id: string): Promise<UnlockCode | undefined>;
  getActiveUnlockCodeByBoxId(boxId: string): Promise<UnlockCode | undefined>;
  createUnlockCode(unlockCode: InsertUnlockCode): Promise<UnlockCode>;
  markUnlockCodeAsUsed(id: string): Promise<UnlockCode | undefined>;

  // Notification methods
  getNotificationsByUserId(userId: string): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: string): Promise<Notification | undefined>;
  
  // Analytics methods
  getUserCount(): Promise<number>;
  getAllUsers(): Promise<User[]>;
  getCourierPerformance(courierId: string): Promise<{ totalDeliveries: number; completedDeliveries: number; rating: number }>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: sql`CURRENT_TIMESTAMP` })
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  // Box methods
  async getBox(id: string): Promise<Box | undefined> {
    const [box] = await db.select().from(boxes).where(eq(boxes.id, id));
    return box || undefined;
  }

  async getBoxByBoxId(boxId: string): Promise<Box | undefined> {
    const [box] = await db.select().from(boxes).where(eq(boxes.boxId, boxId));
    return box || undefined;
  }

  async getBoxesByOwnerId(ownerId: string): Promise<Box[]> {
    return await db.select().from(boxes).where(eq(boxes.ownerId, ownerId));
  }

  async getAllBoxes(): Promise<Box[]> {
    return await db.select().from(boxes).orderBy(desc(boxes.createdAt));
  }

  async createBox(insertBox: InsertBox): Promise<Box> {
    const [box] = await db
      .insert(boxes)
      .values(insertBox)
      .returning();
    return box;
  }

  async updateBox(id: string, updates: Partial<InsertBox>): Promise<Box | undefined> {
    const [box] = await db
      .update(boxes)
      .set({ ...updates, updatedAt: sql`CURRENT_TIMESTAMP` })
      .where(eq(boxes.id, id))
      .returning();
    return box || undefined;
  }

  // Delivery methods
  async getDelivery(id: string): Promise<Delivery | undefined> {
    const [delivery] = await db.select().from(deliveries).where(eq(deliveries.id, id));
    return delivery || undefined;
  }

  async getDeliveryByTrackingNumber(trackingNumber: string): Promise<Delivery | undefined> {
    const [delivery] = await db.select().from(deliveries).where(eq(deliveries.trackingNumber, trackingNumber));
    return delivery || undefined;
  }

  async getDeliveriesByRecipientId(recipientId: string): Promise<Delivery[]> {
    return await db.select().from(deliveries)
      .where(eq(deliveries.recipientId, recipientId))
      .orderBy(desc(deliveries.createdAt));
  }

  async getDeliveriesByCourierId(courierId: string): Promise<Delivery[]> {
    return await db.select().from(deliveries)
      .where(eq(deliveries.courierId, courierId))
      .orderBy(desc(deliveries.createdAt));
  }

  async getDeliveriesByBoxId(boxId: string): Promise<Delivery[]> {
    return await db.select().from(deliveries)
      .where(eq(deliveries.boxId, boxId))
      .orderBy(desc(deliveries.createdAt));
  }

  async getAllDeliveries(): Promise<Delivery[]> {
    return await db.select().from(deliveries).orderBy(desc(deliveries.createdAt));
  }

  async createDelivery(insertDelivery: InsertDelivery): Promise<Delivery> {
    const [delivery] = await db
      .insert(deliveries)
      .values(insertDelivery)
      .returning();
    return delivery;
  }

  async updateDelivery(id: string, updates: Partial<InsertDelivery>): Promise<Delivery | undefined> {
    const [delivery] = await db
      .update(deliveries)
      .set({ ...updates, updatedAt: sql`CURRENT_TIMESTAMP` })
      .where(eq(deliveries.id, id))
      .returning();
    return delivery || undefined;
  }

  // Unlock code methods
  async getUnlockCode(id: string): Promise<UnlockCode | undefined> {
    const [unlockCode] = await db.select().from(unlockCodes).where(eq(unlockCodes.id, id));
    return unlockCode || undefined;
  }

  async getActiveUnlockCodeByBoxId(boxId: string): Promise<UnlockCode | undefined> {
    const [unlockCode] = await db.select().from(unlockCodes)
      .where(and(
        eq(unlockCodes.boxId, boxId),
        eq(unlockCodes.isUsed, false),
        sql`${unlockCodes.expiresAt} > CURRENT_TIMESTAMP`
      ))
      .orderBy(desc(unlockCodes.createdAt));
    return unlockCode || undefined;
  }

  async createUnlockCode(insertUnlockCode: InsertUnlockCode): Promise<UnlockCode> {
    const [unlockCode] = await db
      .insert(unlockCodes)
      .values(insertUnlockCode)
      .returning();
    return unlockCode;
  }

  async markUnlockCodeAsUsed(id: string): Promise<UnlockCode | undefined> {
    const [unlockCode] = await db
      .update(unlockCodes)
      .set({ isUsed: true })
      .where(eq(unlockCodes.id, id))
      .returning();
    return unlockCode || undefined;
  }

  // Notification methods
  async getNotificationsByUserId(userId: string): Promise<Notification[]> {
    return await db.select().from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const [notification] = await db
      .insert(notifications)
      .values(insertNotification)
      .returning();
    return notification;
  }

  async markNotificationAsRead(id: string): Promise<Notification | undefined> {
    const [notification] = await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, id))
      .returning();
    return notification || undefined;
  }
  
  // Analytics methods
  async getUserCount(): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)` }).from(users);
    return Number(result[0]?.count || 0);
  }
  
  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }
  
  async getCourierPerformance(courierId: string): Promise<{ totalDeliveries: number; completedDeliveries: number; rating: number }> {
    const allDeliveries = await this.getDeliveriesByCourierId(courierId);
    const totalDeliveries = allDeliveries.length;
    const completedDeliveries = allDeliveries.filter(d => d.status === 'delivered').length;
    
    const rating = totalDeliveries > 0 
      ? Math.min(5, 3 + (completedDeliveries / totalDeliveries) * 2)
      : 0;
    
    return {
      totalDeliveries,
      completedDeliveries,
      rating: Math.round(rating * 10) / 10
    };
  }
}

export const storage = new DatabaseStorage();
