import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, pgEnum, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const userRoleEnum = pgEnum("user_role", ["resident", "courier", "admin"]);
export const boxStatusEnum = pgEnum("box_status", ["operational", "maintenance", "offline"]);
export const deliveryStatusEnum = pgEnum("delivery_status", ["pending", "assigned", "in_transit", "delivered", "failed"]);
export const paymentStatusEnum = pgEnum("payment_status", ["pending", "completed", "failed", "refunded"]);
export const paymentTypeEnum = pgEnum("payment_type", ["subscription", "delivery_fee", "top_up"]);

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  phone: text("phone").notNull(),
  role: userRoleEnum("role").notNull().default("resident"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const boxes = pgTable("boxes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  boxId: text("box_id").notNull().unique(), // Human readable ID like KB-2341
  location: text("location").notNull(),
  latitude: text("latitude"),
  longitude: text("longitude"),
  ownerId: varchar("owner_id").references(() => users.id),
  status: boxStatusEnum("status").notNull().default("operational"),
  batteryLevel: integer("battery_level").default(100),
  lastActivity: timestamp("last_activity").default(sql`CURRENT_TIMESTAMP`),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const deliveries = pgTable("deliveries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  trackingNumber: text("tracking_number").notNull().unique(),
  boxId: varchar("box_id").notNull().references(() => boxes.id),
  courierId: varchar("courier_id").references(() => users.id),
  recipientId: varchar("recipient_id").notNull().references(() => users.id),
  status: deliveryStatusEnum("status").notNull().default("pending"),
  packageType: text("package_type").notNull(),
  priority: text("priority").notNull().default("normal"),
  weight: text("weight"),
  notes: text("notes"),
  assignedAt: timestamp("assigned_at"),
  deliveredAt: timestamp("delivered_at"),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const unlockCodes = pgTable("unlock_codes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  boxId: varchar("box_id").notNull().references(() => boxes.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  otpCode: text("otp_code"),
  qrCode: text("qr_code"),
  expiresAt: timestamp("expires_at").notNull(),
  isUsed: boolean("is_used").notNull().default(false),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const payments = pgTable("payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  amount: integer("amount").notNull(),
  phone: text("phone").notNull(),
  paymentType: paymentTypeEnum("payment_type").notNull().default("subscription"),
  status: paymentStatusEnum("status").notNull().default("pending"),
  checkoutRequestId: text("checkout_request_id"),
  merchantRequestId: text("merchant_request_id"),
  mpesaReceiptNumber: text("mpesa_receipt_number"),
  transactionDate: timestamp("transaction_date"),
  accountReference: text("account_reference"),
  description: text("description"),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const tamperEvents = pgTable("tamper_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  boxId: varchar("box_id").notNull().references(() => boxes.id),
  detectedAt: timestamp("detected_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  resolved: boolean("resolved").notNull().default(false),
  resolvedAt: timestamp("resolved_at"),
  notes: text("notes"),
});

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  ownedBoxes: many(boxes),
  deliveries: many(deliveries, { relationName: "recipientDeliveries" }),
  courierDeliveries: many(deliveries, { relationName: "courierDeliveries" }),
  unlockCodes: many(unlockCodes),
  notifications: many(notifications),
  payments: many(payments),
}));

export const boxesRelations = relations(boxes, ({ one, many }) => ({
  owner: one(users, {
    fields: [boxes.ownerId],
    references: [users.id],
  }),
  deliveries: many(deliveries),
  unlockCodes: many(unlockCodes),
  tamperEvents: many(tamperEvents),
}));

export const deliveriesRelations = relations(deliveries, ({ one }) => ({
  box: one(boxes, {
    fields: [deliveries.boxId],
    references: [boxes.id],
  }),
  courier: one(users, {
    fields: [deliveries.courierId],
    references: [users.id],
    relationName: "courierDeliveries",
  }),
  recipient: one(users, {
    fields: [deliveries.recipientId],
    references: [users.id],
    relationName: "recipientDeliveries",
  }),
}));

export const unlockCodesRelations = relations(unlockCodes, ({ one }) => ({
  box: one(boxes, {
    fields: [unlockCodes.boxId],
    references: [boxes.id],
  }),
  user: one(users, {
    fields: [unlockCodes.userId],
    references: [users.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  user: one(users, {
    fields: [payments.userId],
    references: [users.id],
  }),
}));

export const tamperEventsRelations = relations(tamperEvents, ({ one }) => ({
  box: one(boxes, {
    fields: [tamperEvents.boxId],
    references: [boxes.id],
  }),
}));

// Schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBoxSchema = createInsertSchema(boxes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastActivity: true,
});

export const insertDeliverySchema = createInsertSchema(deliveries).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  assignedAt: true,
  deliveredAt: true,
});

export const insertUnlockCodeSchema = createInsertSchema(unlockCodes).omit({
  id: true,
  createdAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTamperEventSchema = createInsertSchema(tamperEvents).omit({
  id: true,
  detectedAt: true,
});

// Login schema
export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Box = typeof boxes.$inferSelect;
export type InsertBox = z.infer<typeof insertBoxSchema>;
export type Delivery = typeof deliveries.$inferSelect;
export type InsertDelivery = z.infer<typeof insertDeliverySchema>;
export type UnlockCode = typeof unlockCodes.$inferSelect;
export type InsertUnlockCode = z.infer<typeof insertUnlockCodeSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type TamperEvent = typeof tamperEvents.$inferSelect;
export type InsertTamperEvent = z.infer<typeof insertTamperEventSchema>;
export type LoginRequest = z.infer<typeof loginSchema>;
