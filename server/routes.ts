import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  hashPassword, 
  verifyPassword, 
  generateToken, 
  requireAuth, 
  requireRole, 
  type AuthenticatedRequest 
} from "./auth";
import { OTPService } from "./services/otpService";
import { QRService } from "./services/qrService";
import { NotificationService } from "./services/notificationService";
import { 
  insertUserSchema, 
  loginSchema, 
  insertBoxSchema,
  insertDeliverySchema,
  type User 
} from "@shared/schema";
import { randomUUID } from "crypto";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const existingEmail = await storage.getUserByEmail(userData.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }

      // Hash password
      const hashedPassword = await hashPassword(userData.password);
      
      // Create user
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
      });

      // Generate token
      const token = generateToken(user);

      res.status(201).json({
        message: "User created successfully",
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        }
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = loginSchema.parse(req.body);
      
      // Find user
      const user = await storage.getUserByUsername(username);
      if (!user || !user.isActive) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Verify password
      const isValidPassword = await verifyPassword(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Generate token
      const token = generateToken(user);

      res.json({
        message: "Login successful",
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        }
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Login failed" });
    }
  });

  app.get("/api/auth/me", requireAuth, (req: AuthenticatedRequest, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    res.json({
      user: {
        id: req.user.id,
        username: req.user.username,
        email: req.user.email,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        role: req.user.role,
      }
    });
  });

  // Box management routes
  app.post("/api/boxes/register", requireAuth, requireRole(["admin"]), async (req: AuthenticatedRequest, res) => {
    try {
      const boxData = insertBoxSchema.parse(req.body);
      
      // Check if box ID already exists
      const existingBox = await storage.getBoxByBoxId(boxData.boxId);
      if (existingBox) {
        return res.status(400).json({ message: "Box ID already exists" });
      }

      const box = await storage.createBox(boxData);
      
      res.status(201).json({
        message: "Box registered successfully",
        box
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Box registration failed" });
    }
  });

  app.get("/api/boxes", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      let boxes;
      
      if (req.user!.role === "admin" || req.user!.role === "courier") {
        boxes = await storage.getAllBoxes();
      } else if (req.user!.role === "resident") {
        boxes = await storage.getBoxesByOwnerId(req.user!.id);
      } else {
        return res.status(403).json({ message: "Access denied" });
      }

      res.json({ boxes });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch boxes" });
    }
  });

  app.get("/api/boxes/:id", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const box = await storage.getBox(req.params.id);
      if (!box) {
        return res.status(404).json({ message: "Box not found" });
      }

      // Check permissions
      if (req.user!.role !== "admin" && box.ownerId !== req.user!.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      res.json({ box });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch box" });
    }
  });

  // Unlock box routes
  app.post("/api/boxes/:boxId/unlock/generate", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const { boxId } = req.params;
      const { method } = req.body; // "otp" or "qr"
      
      const box = await storage.getBoxByBoxId(boxId);
      if (!box) {
        return res.status(404).json({ message: "Box not found" });
      }

      // Check if user owns the box
      if (box.ownerId !== req.user!.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      let otpCode = null;
      let qrCode = null;
      
      if (method === "otp") {
        otpCode = OTPService.generateOTP();
      } else if (method === "qr") {
        qrCode = QRService.generateQRCode(boxId, req.user!.id);
      } else {
        return res.status(400).json({ message: "Invalid unlock method" });
      }

      const unlockCode = await storage.createUnlockCode({
        boxId: box.id,
        userId: req.user!.id,
        otpCode,
        qrCode,
        expiresAt: method === "otp" ? OTPService.getExpirationTime() : QRService.getExpirationTime(),
        isUsed: false,
      });
      
      if (method === "otp" && otpCode) {
        await NotificationService.sendUnlockCodeSMS(req.user!.id, otpCode, boxId);
      }

      res.json({
        message: "Unlock code generated successfully",
        unlockCode: {
          id: unlockCode.id,
          otpCode: unlockCode.otpCode,
          qrCode: unlockCode.qrCode,
          expiresAt: unlockCode.expiresAt,
        }
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to generate unlock code" });
    }
  });

  app.post("/api/boxes/:boxId/unlock/verify", async (req, res) => {
    try {
      const { boxId } = req.params;
      const { code, method } = req.body; // code can be OTP or QR, method is "otp" or "qr"
      
      const box = await storage.getBoxByBoxId(boxId);
      if (!box) {
        return res.status(404).json({ message: "Box not found" });
      }

      const activeUnlockCode = await storage.getActiveUnlockCodeByBoxId(box.id);
      if (!activeUnlockCode) {
        return res.status(400).json({ message: "No active unlock code found" });
      }

      // Verify the code
      let isValid = false;
      if (method === "otp" && activeUnlockCode.otpCode) {
        isValid = activeUnlockCode.otpCode === code;
      } else if (method === "qr" && activeUnlockCode.qrCode) {
        isValid = activeUnlockCode.qrCode === code && QRService.verifyQRCode(code, boxId);
      }

      if (!isValid) {
        return res.status(400).json({ message: "Invalid unlock code" });
      }

      // Mark unlock code as used
      await storage.markUnlockCodeAsUsed(activeUnlockCode.id);
      
      // Update box last activity
      await storage.updateBox(box.id, { 
        lastActivity: new Date() as any,
      });

      // Send notification
      await NotificationService.notifyBoxUnlocked(activeUnlockCode.userId, boxId);

      // Console log for IoT device simulation
      console.log(`🔓 BOX UNLOCK COMMAND - Box: ${boxId}`);
      console.log(`   User: ${activeUnlockCode.userId}`);
      console.log(`   Method: ${method.toUpperCase()}`);
      console.log(`   Time: ${new Date().toISOString()}`);
      console.log("=" .repeat(50));

      res.json({
        message: "Box unlocked successfully",
        success: true
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to unlock box" });
    }
  });

  // Delivery management routes
  app.post("/api/deliveries/assign", requireAuth, requireRole(["courier", "admin"]), async (req: AuthenticatedRequest, res) => {
    try {
      const deliveryData = insertDeliverySchema.parse(req.body);
      
      // Verify box exists
      const box = await storage.getBox(deliveryData.boxId);
      if (!box) {
        return res.status(404).json({ message: "Box not found" });
      }

      // Verify recipient exists
      const recipient = await storage.getUser(deliveryData.recipientId);
      if (!recipient) {
        return res.status(404).json({ message: "Recipient not found" });
      }

      // Generate tracking number if not provided
      if (!deliveryData.trackingNumber) {
        deliveryData.trackingNumber = `TRK-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      }

      const delivery = await storage.createDelivery({
        ...deliveryData,
        courierId: req.user!.id,
        status: "assigned",
        assignedAt: new Date() as any,
      });

      // Send notification to recipient
      await NotificationService.notifyDeliveryAssigned(
        recipient.id, 
        delivery.trackingNumber, 
        box.boxId
      );

      res.status(201).json({
        message: "Delivery assigned successfully",
        delivery
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to assign delivery" });
    }
  });

  app.patch("/api/deliveries/:id/status", requireAuth, requireRole(["courier", "admin"]), async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      const delivery = await storage.getDelivery(id);
      if (!delivery) {
        return res.status(404).json({ message: "Delivery not found" });
      }

      // Check permissions
      if (req.user!.role !== "admin" && delivery.courierId !== req.user!.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      const updateData: any = { status };
      if (status === "delivered") {
        updateData.deliveredAt = new Date();
      }

      const updatedDelivery = await storage.updateDelivery(id, updateData);

      // Send notification if delivered
      if (status === "delivered" && updatedDelivery) {
        const box = await storage.getBox(delivery.boxId);
        if (box) {
          await NotificationService.notifyDeliveryDelivered(
            delivery.recipientId,
            delivery.trackingNumber,
            box.boxId
          );
        }
      }

      res.json({
        message: "Delivery status updated successfully",
        delivery: updatedDelivery
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to update delivery status" });
    }
  });

  app.get("/api/deliveries", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      let deliveries;
      
      if (req.user!.role === "admin") {
        deliveries = await storage.getAllDeliveries();
      } else if (req.user!.role === "courier") {
        deliveries = await storage.getDeliveriesByCourierId(req.user!.id);
      } else if (req.user!.role === "resident") {
        deliveries = await storage.getDeliveriesByRecipientId(req.user!.id);
      } else {
        return res.status(403).json({ message: "Access denied" });
      }

      res.json({ deliveries });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch deliveries" });
    }
  });

  // Notification routes
  app.get("/api/notifications", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const notifications = await storage.getNotificationsByUserId(req.user!.id);
      res.json({ notifications });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch notifications" });
    }
  });

  app.patch("/api/notifications/:id/read", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const notification = await storage.markNotificationAsRead(req.params.id);
      if (!notification) {
        return res.status(404).json({ message: "Notification not found" });
      }

      res.json({
        message: "Notification marked as read",
        notification
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to update notification" });
    }
  });

  // IoT device endpoints
  app.get("/api/iot/boxes/:boxId/status", async (req, res) => {
    try {
      const { boxId } = req.params;
      
      const box = await storage.getBoxByBoxId(boxId);
      if (!box) {
        return res.status(404).json({ message: "Box not found" });
      }

      // Check for active unlock codes
      const activeUnlockCode = await storage.getActiveUnlockCodeByBoxId(box.id);
      
      res.json({
        boxId: box.boxId,
        status: box.status,
        shouldUnlock: !!activeUnlockCode,
        batteryLevel: box.batteryLevel,
        lastActivity: box.lastActivity,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to get box status" });
    }
  });

  app.post("/api/iot/boxes/:boxId/status", async (req, res) => {
    try {
      const { boxId } = req.params;
      const { batteryLevel, status, tamperAlert } = req.body;
      
      const box = await storage.getBoxByBoxId(boxId);
      if (!box) {
        return res.status(404).json({ message: "Box not found" });
      }

      // Update box status
      const updateData: any = { lastActivity: new Date() };
      if (batteryLevel !== undefined) updateData.batteryLevel = batteryLevel;
      if (status !== undefined) updateData.status = status;

      await storage.updateBox(box.id, updateData);

      // Handle low battery alert
      if (batteryLevel && batteryLevel < 20 && box.ownerId) {
        await NotificationService.notifyLowBattery(box.ownerId, boxId, batteryLevel);
      }

      // Handle tamper alert
      if (tamperAlert && box.ownerId) {
        await NotificationService.createNotification({
          userId: box.ownerId,
          title: "Security Alert",
          message: `Tampering detected on box ${boxId}. Please check your box immediately.`,
          type: "security_alert"
        });
      }

      console.log(`📦 IOT UPDATE - Box: ${boxId}`);
      console.log(`   Battery: ${batteryLevel}%`);
      console.log(`   Status: ${status}`);
      console.log(`   Tamper Alert: ${tamperAlert || false}`);
      console.log(`   Time: ${new Date().toISOString()}`);
      console.log("=" .repeat(50));

      res.json({
        message: "Status updated successfully",
        success: true
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to update box status" });
    }
  });

  // Analytics routes
  app.get("/api/analytics/users/count", requireAuth, requireRole(["admin"]), async (req: AuthenticatedRequest, res) => {
    try {
      const count = await storage.getUserCount();
      res.json({ count });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to get user count" });
    }
  });
  
  app.get("/api/analytics/courier/performance", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const performance = await storage.getCourierPerformance(req.user!.id);
      res.json(performance);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to get performance metrics" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
