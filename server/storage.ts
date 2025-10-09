import { 
  users, boxes, deliveries, unlockCodes, notifications, payments, tamperEvents,
  installationRequests, servicePricing,
  type User, type InsertUser, type Box, type InsertBox, 
  type Delivery, type InsertDelivery, type UnlockCode, type InsertUnlockCode,
  type Notification, type InsertNotification, type Payment, type InsertPayment,
  type TamperEvent, type InsertTamperEvent, type InstallationRequest, type InsertInstallationRequest,
  type ServicePricing, type InsertServicePricing
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
  updateBox(id: string, updates: Partial<Omit<Box, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Box | undefined>;

  // Delivery methods
  getDelivery(id: string): Promise<Delivery | undefined>;
  getDeliveryByTrackingNumber(trackingNumber: string): Promise<Delivery | undefined>;
  getDeliveriesByRecipientId(recipientId: string): Promise<Delivery[]>;
  getDeliveriesByCourierId(courierId: string): Promise<Delivery[]>;
  getPendingDeliveries(): Promise<Delivery[]>;
  getDeliveriesByBoxId(boxId: string): Promise<Delivery[]>;
  getAllDeliveries(): Promise<Delivery[]>;
  createDelivery(delivery: InsertDelivery & { assignedAt?: Date | null }): Promise<Delivery>;
  updateDelivery(id: string, updates: Partial<Omit<Delivery, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Delivery | undefined>;

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
  getSubscriptions(): Promise<any[]>;
  
  // Payment methods
  getPayment(id: string): Promise<Payment | undefined>;
  getPaymentByReference(reference: string): Promise<Payment | undefined>;
  getPaymentsByUserId(userId: string): Promise<Payment[]>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  updatePayment(id: string, updates: Partial<InsertPayment>): Promise<Payment | undefined>;
  
  // Tamper event methods
  getTamperEvent(id: string): Promise<TamperEvent | undefined>;
  getTamperEventsByBoxId(boxId: string): Promise<TamperEvent[]>;
  getAllTamperEvents(): Promise<TamperEvent[]>;
  getUnresolvedTamperEvents(): Promise<TamperEvent[]>;
  createTamperEvent(tamperEvent: InsertTamperEvent): Promise<TamperEvent>;
  resolveTamperEvent(id: string, notes?: string): Promise<TamperEvent | undefined>;
  
  // Installation request methods
  getInstallationRequest(id: string): Promise<InstallationRequest | undefined>;
  getAllInstallationRequests(): Promise<InstallationRequest[]>;
  getPendingInstallationRequests(): Promise<InstallationRequest[]>;
  getInstallationRequestsByUserId(userId: string): Promise<InstallationRequest[]>;
  createInstallationRequest(request: InsertInstallationRequest): Promise<InstallationRequest>;
  updateInstallationRequest(id: string, updates: Partial<InsertInstallationRequest>): Promise<InstallationRequest | undefined>;
  
  // Service pricing methods
  getServicePricing(id: string): Promise<ServicePricing | undefined>;
  getServicePricingByType(serviceType: string): Promise<ServicePricing | undefined>;
  getAllServicePricing(): Promise<ServicePricing[]>;
  getActiveServicePricing(): Promise<ServicePricing[]>;
  createServicePricing(pricing: InsertServicePricing): Promise<ServicePricing>;
  updateServicePricing(id: string, updates: Partial<InsertServicePricing>): Promise<ServicePricing | undefined>;
  
  // Box methods - update to get only active boxes
  getActiveBoxes(): Promise<Box[]>;
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

  async updateBox(id: string, updates: Partial<Omit<Box, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Box | undefined> {
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
  
  async getPendingDeliveries(): Promise<Delivery[]> {
    return await db.select().from(deliveries)
      .where(eq(deliveries.status, "pending"))
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

  async createDelivery(insertDelivery: InsertDelivery & { assignedAt?: Date | null }): Promise<Delivery> {
    const [delivery] = await db
      .insert(deliveries)
      .values(insertDelivery)
      .returning();
    return delivery;
  }

  async updateDelivery(id: string, updates: Partial<Omit<Delivery, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Delivery | undefined> {
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

  async getSubscriptions(): Promise<any[]> {
    // Get all residents with their box count using a single efficient query
    const residentsWithBoxCount = await db
      .select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        phone: users.phone,
        subscriptionPlan: users.subscriptionPlan,
        subscriptionExpiresAt: users.subscriptionExpiresAt,
        hasCompletedPayment: users.hasCompletedPayment,
        createdAt: users.createdAt,
        boxCount: sql<number>`COUNT(DISTINCT ${boxes.id})::int`,
      })
      .from(users)
      .leftJoin(boxes, eq(boxes.ownerId, users.id))
      .where(eq(users.role, "resident"))
      .groupBy(users.id);
    
    // Get latest payment for each resident in a single query
    const latestPayments = await db
      .select({
        userId: payments.userId,
        amount: payments.amount,
        transactionDate: payments.transactionDate,
      })
      .from(payments)
      .where(and(
        eq(payments.paymentType, "subscription"),
        eq(payments.status, "completed")
      ))
      .orderBy(desc(payments.createdAt));
    
    // Create a map of latest payment per user
    const paymentMap = new Map();
    latestPayments.forEach(payment => {
      if (!paymentMap.has(payment.userId)) {
        paymentMap.set(payment.userId, payment);
      }
    });
    
    // Combine the data
    return residentsWithBoxCount.map(user => {
      const latestPayment = paymentMap.get(user.id);
      return {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        boxCount: user.boxCount,
        subscriptionPlan: user.subscriptionPlan,
        subscriptionExpiresAt: user.subscriptionExpiresAt,
        hasCompletedPayment: user.hasCompletedPayment,
        amount: latestPayment?.amount || 0,
        lastPaymentDate: latestPayment?.transactionDate || null,
        createdAt: user.createdAt,
      };
    });
  }
  
  // Payment methods
  async getPayment(id: string): Promise<Payment | undefined> {
    const [payment] = await db.select().from(payments).where(eq(payments.id, id));
    return payment || undefined;
  }
  
  async getPaymentByReference(reference: string): Promise<Payment | undefined> {
    const [payment] = await db.select().from(payments)
      .where(eq(payments.reference, reference));
    return payment || undefined;
  }
  
  async getPaymentsByUserId(userId: string): Promise<Payment[]> {
    return await db.select().from(payments)
      .where(eq(payments.userId, userId))
      .orderBy(desc(payments.createdAt));
  }
  
  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    const [payment] = await db
      .insert(payments)
      .values(insertPayment)
      .returning();
    return payment;
  }
  
  async updatePayment(id: string, updates: Partial<InsertPayment>): Promise<Payment | undefined> {
    const [payment] = await db
      .update(payments)
      .set(updates)
      .where(eq(payments.id, id))
      .returning();
    return payment || undefined;
  }
  
  // Tamper event methods
  async getTamperEvent(id: string): Promise<TamperEvent | undefined> {
    const [event] = await db.select().from(tamperEvents).where(eq(tamperEvents.id, id));
    return event || undefined;
  }
  
  async getTamperEventsByBoxId(boxId: string): Promise<TamperEvent[]> {
    return await db.select().from(tamperEvents)
      .where(eq(tamperEvents.boxId, boxId))
      .orderBy(desc(tamperEvents.detectedAt));
  }
  
  async getAllTamperEvents(): Promise<TamperEvent[]> {
    return await db.select().from(tamperEvents)
      .orderBy(desc(tamperEvents.detectedAt));
  }
  
  async getUnresolvedTamperEvents(): Promise<TamperEvent[]> {
    return await db.select().from(tamperEvents)
      .where(eq(tamperEvents.resolved, false))
      .orderBy(desc(tamperEvents.detectedAt));
  }
  
  async createTamperEvent(insertTamperEvent: InsertTamperEvent): Promise<TamperEvent> {
    const [event] = await db
      .insert(tamperEvents)
      .values(insertTamperEvent)
      .returning();
    return event;
  }
  
  async resolveTamperEvent(id: string, notes?: string): Promise<TamperEvent | undefined> {
    const [event] = await db
      .update(tamperEvents)
      .set({ 
        resolved: true, 
        resolvedAt: new Date() as any,
        notes: notes || null 
      })
      .where(eq(tamperEvents.id, id))
      .returning();
    return event || undefined;
  }
  
  // Installation request methods
  async getInstallationRequest(id: string): Promise<InstallationRequest | undefined> {
    const [request] = await db.select().from(installationRequests).where(eq(installationRequests.id, id));
    return request || undefined;
  }
  
  async getAllInstallationRequests(): Promise<InstallationRequest[]> {
    return await db.select().from(installationRequests)
      .orderBy(desc(installationRequests.createdAt));
  }
  
  async getPendingInstallationRequests(): Promise<InstallationRequest[]> {
    return await db.select().from(installationRequests)
      .where(eq(installationRequests.status, "pending"))
      .orderBy(desc(installationRequests.createdAt));
  }
  
  async getInstallationRequestsByUserId(userId: string): Promise<InstallationRequest[]> {
    return await db.select().from(installationRequests)
      .where(eq(installationRequests.userId, userId))
      .orderBy(desc(installationRequests.createdAt));
  }
  
  async createInstallationRequest(request: InsertInstallationRequest): Promise<InstallationRequest> {
    const [installationRequest] = await db
      .insert(installationRequests)
      .values(request)
      .returning();
    return installationRequest;
  }
  
  async updateInstallationRequest(id: string, updates: Partial<InsertInstallationRequest>): Promise<InstallationRequest | undefined> {
    const [request] = await db
      .update(installationRequests)
      .set({ ...updates, updatedAt: sql`CURRENT_TIMESTAMP` })
      .where(eq(installationRequests.id, id))
      .returning();
    return request || undefined;
  }
  
  // Service pricing methods
  async getServicePricing(id: string): Promise<ServicePricing | undefined> {
    const [pricing] = await db.select().from(servicePricing).where(eq(servicePricing.id, id));
    return pricing || undefined;
  }
  
  async getServicePricingByType(serviceType: string): Promise<ServicePricing | undefined> {
    const [pricing] = await db.select().from(servicePricing)
      .where(eq(servicePricing.serviceType, serviceType as any));
    return pricing || undefined;
  }
  
  async getAllServicePricing(): Promise<ServicePricing[]> {
    return await db.select().from(servicePricing)
      .orderBy(servicePricing.serviceType);
  }
  
  async getActiveServicePricing(): Promise<ServicePricing[]> {
    return await db.select().from(servicePricing)
      .where(eq(servicePricing.isActive, true))
      .orderBy(servicePricing.serviceType);
  }
  
  async createServicePricing(pricing: InsertServicePricing): Promise<ServicePricing> {
    const [servicePricingItem] = await db
      .insert(servicePricing)
      .values(pricing)
      .returning();
    return servicePricingItem;
  }
  
  async updateServicePricing(id: string, updates: Partial<InsertServicePricing>): Promise<ServicePricing | undefined> {
    const [pricing] = await db
      .update(servicePricing)
      .set({ ...updates, updatedAt: sql`CURRENT_TIMESTAMP` })
      .where(eq(servicePricing.id, id))
      .returning();
    return pricing || undefined;
  }
  
  // Box methods - get only active boxes
  async getActiveBoxes(): Promise<Box[]> {
    return await db.select().from(boxes)
      .where(and(eq(boxes.isActive, true), eq(boxes.status, "operational")))
      .orderBy(desc(boxes.createdAt));
  }
}

export const storage = new DatabaseStorage();
