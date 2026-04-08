import type { Express } from "express";
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
import { paystackService } from "./services/paystackService";
// import { websocketService } from "./services/websocketService";
import { optimizeRoute, calculateTotalDistance, estimateDeliveryTime } from "./services/routeOptimizationService";
import { 
  insertUserSchema, 
  loginSchema, 
  insertBoxSchema,
  insertDeliverySchema,
  insertInstallationRequestSchema,
  type User 
} from "@shared/schema";
import { randomUUID } from "crypto";

export async function registerRoutes(app: Express){
  // Authentication routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if username already exists (username must be unique)
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      // Note: Email can be shared across multiple accounts (removed duplicate email check)

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
      
      // Find user by username only (email is no longer unique, so we can't use it for login)
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
      id: req.user.id,
      username: req.user.username,
      email: req.user.email,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      role: req.user.role,
      hasCompletedPayment: req.user.hasCompletedPayment || false,
      county: req.user.county,
      estateName: req.user.estateName,
      apartmentName: req.user.apartmentName,
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
        lastActivity: new Date(),
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

  // Delivery management routes (admin only - couriers use self-assignment endpoint)
  app.post("/api/deliveries/assign", requireAuth, requireRole(["admin"]), async (req: AuthenticatedRequest, res) => {
    try {
      // Make trackingNumber optional for assignment
      const deliverySchema = insertDeliverySchema.extend({
        trackingNumber: insertDeliverySchema.shape.trackingNumber.optional(),
      });
      
      const deliveryData = deliverySchema.parse(req.body);
      
      // Verify box exists
      const box = await storage.getBox(deliveryData.boxId);
      if (!box) {
        return res.status(404).json({ message: "Box not found" });
      }
      
      // Verify box is active (not deactivated/inactive)
      if (!box.isActive) {
        return res.status(400).json({ message: "This box is currently inactive and cannot be used for deliveries" });
      }

      // Verify recipient exists
      const recipient = await storage.getUser(deliveryData.recipientId);
      if (!recipient) {
        return res.status(404).json({ message: "Recipient not found" });
      }

      // Generate tracking number if not provided
      const trackingNumber = deliveryData.trackingNumber || 
        `TRK-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

      // Determine status and courier based on assignment
      let status: "pending" | "assigned" = "pending";
      let courierId = deliveryData.courierId;
      let assignedAt: Date | undefined = undefined;
      
      // If courierId is provided, it's being assigned
      if (deliveryData.courierId) {
        status = "assigned";
        assignedAt = new Date();
      } 
      // If no courierId but user is a courier (self-assigning)
      else if (req.user!.role === "courier") {
        status = "assigned";
        courierId = req.user!.id;
        assignedAt = new Date();
      }

      const delivery = await storage.createDelivery({
        ...deliveryData,
        trackingNumber,
        courierId,
        status,
        assignedAt,
      });

      // Send notification to recipient
      await NotificationService.notifyDeliveryAssigned(
        recipient.id, 
        delivery.trackingNumber, 
        box.boxId
      );
      
      //websocketService.sendToUser(recipient.id, {
        //type: "delivery_assigned",
        //data: delivery
      //});
      
      //websocketService.sendToUser(req.user!.id, {
        //type: "delivery_created",
        //data: delivery
      //});

      res.status(201).json({
        message: "Delivery assigned successfully",
        delivery
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to assign delivery" });
    }
  });

  // Courier self-assignment endpoint
  app.patch("/api/deliveries/:id/assign-to-me", requireAuth, requireRole(["courier"]), async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      
      const delivery = await storage.getDelivery(id);
      if (!delivery) {
        return res.status(404).json({ message: "Delivery not found" });
      }

      // Only allow assignment of pending deliveries
      if (delivery.status !== "pending") {
        return res.status(400).json({ message: "Delivery is not available for assignment" });
      }

      // Update delivery to assign to courier
      const updatedDelivery = await storage.updateDelivery(id, {
        courierId: req.user!.id,
        status: "assigned",
        assignedAt: new Date(),
      });

      // Send notification to recipient
      await NotificationService.notifyDeliveryAssigned(
        delivery.recipientId,
        delivery.trackingNumber,
        delivery.boxId
      );

      //websocketService.sendToUser(delivery.recipientId, {
        //type: "delivery_assigned",
        //data: updatedDelivery
      //});

      res.json({
        message: "Delivery assigned successfully",
        delivery: updatedDelivery
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
      
      //websocketService.sendToUser(delivery.recipientId, {
        //type: "delivery_status_updated",
        //data: updatedDelivery
      //});
      
      if (delivery.courierId) {
        //websocketService.sendToUser(delivery.courierId, {
          //type: "delivery_status_updated",
          //data: updatedDelivery
        //});
      }
      
      //websocketService.broadcastToRole("admin", {
        //type: "delivery_status_updated",
        //data: updatedDelivery
      //});

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
        // Couriers see deliveries assigned to them AND pending (unassigned) deliveries
        const assignedDeliveries = await storage.getDeliveriesByCourierId(req.user!.id);
        const pendingDeliveries = await storage.getPendingDeliveries();
        
        // Combine and deduplicate
        const deliveryMap = new Map();
        [...assignedDeliveries, ...pendingDeliveries].forEach(d => deliveryMap.set(d.id, d));
        deliveries = Array.from(deliveryMap.values());
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

  app.get("/api/deliveries/route/optimized", requireAuth, requireRole(["courier"]), async (req: AuthenticatedRequest, res) => {
    try {
      const deliveries = await storage.getDeliveriesByCourierId(req.user!.id);
      const activeDeliveries = deliveries.filter((d: any) => 
        d.status === "assigned" || d.status === "in_transit"
      );

      if (activeDeliveries.length === 0) {
        return res.json({ 
          route: [], 
          totalDistance: 0, 
          estimatedTime: 0,
          message: "No active deliveries to optimize" 
        });
      }

      const deliveryLocations = await Promise.all(
        activeDeliveries.map(async (delivery: any) => {
          const box = await storage.getBox(delivery.boxId);
          if (!box || !box.latitude || !box.longitude) {
            return null;
          }
          return {
            id: box.id,
            boxId: box.boxId,
            location: box.location,
            latitude: box.latitude,
            longitude: box.longitude,
            deliveryId: delivery.id,
            trackingNumber: delivery.trackingNumber,
            priority: delivery.priority,
            packageType: delivery.packageType
          };
        })
      );

      const validLocations = deliveryLocations.filter((loc): loc is NonNullable<typeof loc> => loc !== null);

      if (validLocations.length === 0) {
        return res.json({ 
          route: [], 
          totalDistance: 0, 
          estimatedTime: 0,
          message: "No deliveries with valid coordinates" 
        });
      }

      const optimizedRoute = optimizeRoute(validLocations);
      const totalDistance = calculateTotalDistance(optimizedRoute);
      const estimatedTime = estimateDeliveryTime(optimizedRoute);

      res.json({
        route: optimizedRoute,
        totalDistance: Math.round(totalDistance * 10) / 10,
        estimatedTime,
        totalStops: optimizedRoute.length
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to optimize route" });
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
      
      const updatedStatus = status !== undefined ? status : box.status;

      // Handle low battery alert
      if (batteryLevel !== undefined && batteryLevel !== null && batteryLevel < 20 && box.ownerId) {
        await NotificationService.notifyLowBattery(box.ownerId, boxId, batteryLevel);
        
        //websocketService.sendToUser(box.ownerId, {
          //type: "battery_alert",
          //data: {
            //boxId,
            //batteryLevel,
            //status: updatedStatus,
            //message: `Low battery alert: ${batteryLevel}%`
          //}
        //});
        
        //websocketService.broadcastToRole("admin", {
          //type: "battery_alert",
          //data: {
            //boxId,
            //ownerId: box.ownerId,
            //batteryLevel,
            //status: updatedStatus
          //}
        //});
      }

      // Handle tamper alert
      if (tamperAlert && box.ownerId) {
        const tamperEvent = await storage.createTamperEvent({
          boxId: box.id,
          resolved: false
        });
        
        await NotificationService.notifyTamperDetected(box.ownerId, boxId);
        
        //websocketService.sendToUser(box.ownerId, {
          //type: "tamper_alert",
          //data: {
            //boxId,
            //eventId: tamperEvent.id,
            //timestamp: new Date(),
            //message: "Tampering detected on your box"
          //}
        //});
        
        //websocketService.broadcastToRole("admin", {
          //type: "tamper_alert",
          //data: {
            //boxId,
            //ownerId: box.ownerId,
            //eventId: tamperEvent.id,
            //timestamp: new Date(),
            //status: updatedStatus
          //}
        //});
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

  // User management routes
  app.get("/api/users", requireAuth, requireRole(["admin"]), async (req: AuthenticatedRequest, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json({ users });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to get users" });
    }
  });

  // Subscription management routes
  app.get("/api/subscriptions", requireAuth, requireRole(["admin"]), async (req: AuthenticatedRequest, res) => {
    try {
      const subscriptions = await storage.getSubscriptions();
      res.json({ subscriptions });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to get subscriptions" });
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
  
  app.get("/api/analytics/boxes/tamper", requireAuth, requireRole(["admin"]), async (req: AuthenticatedRequest, res) => {
    try {
      const allEvents = await storage.getAllTamperEvents();
      const unresolvedEvents = await storage.getUnresolvedTamperEvents();
      
      const tamperStats = {
        total: allEvents.length,
        unresolved: unresolvedEvents.length,
        resolved: allEvents.filter(e => e.resolved).length,
        last24Hours: allEvents.filter(e => {
          const hoursDiff = (Date.now() - new Date(e.detectedAt).getTime()) / (1000 * 60 * 60);
          return hoursDiff <= 24;
        }).length,
        last7Days: allEvents.filter(e => {
          const daysDiff = (Date.now() - new Date(e.detectedAt).getTime()) / (1000 * 60 * 60 * 24);
          return daysDiff <= 7;
        }).length,
        unresolvedEvents: await Promise.all(
          unresolvedEvents.map(async (event) => {
            const box = await storage.getBox(event.boxId);
            return {
              id: event.id,
              boxId: box?.boxId,
              location: box?.location,
              detectedAt: event.detectedAt,
              ownerID: box?.ownerId
            };
          })
        )
      };
      
      res.json(tamperStats);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to get tamper statistics" });
    }
  });
  
  app.get("/api/analytics/boxes/battery", requireAuth, requireRole(["admin"]), async (req: AuthenticatedRequest, res) => {
    try {
      const boxes = await storage.getAllBoxes();
      const boxesWithBattery = boxes.filter(b => b.batteryLevel !== null && b.batteryLevel !== undefined);
      const boxesWithoutBattery = boxes.filter(b => b.batteryLevel === null || b.batteryLevel === undefined);
      
      const batteryStats = {
        total: boxes.length,
        monitored: boxesWithBattery.length,
        unknown: boxesWithoutBattery.length,
        critical: boxesWithBattery.filter(b => b.batteryLevel! < 10).length,
        low: boxesWithBattery.filter(b => b.batteryLevel! >= 10 && b.batteryLevel! < 20).length,
        medium: boxesWithBattery.filter(b => b.batteryLevel! >= 20 && b.batteryLevel! < 50).length,
        good: boxesWithBattery.filter(b => b.batteryLevel! >= 50).length,
        averageBatteryLevel: boxesWithBattery.length > 0 
          ? boxesWithBattery.reduce((sum, b) => sum + b.batteryLevel!, 0) / boxesWithBattery.length 
          : 0,
        lowBatteryBoxes: boxesWithBattery
          .filter(b => b.batteryLevel! < 20)
          .map(b => ({
            boxId: b.boxId,
            location: b.location,
            batteryLevel: b.batteryLevel,
            status: b.status,
            lastActivity: b.lastActivity
          }))
          .sort((a, b) => (a.batteryLevel || 0) - (b.batteryLevel || 0))
      };
      
      res.json(batteryStats);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to get battery statistics" });
    }
  });

  // Payment routes
  app.post("/api/payments/initiate", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const { amount, paymentType, description, subscriptionPlan } = req.body;
      
      if (!amount || amount < 1) {
        return res.status(400).json({ message: "Invalid amount" });
      }
      
      const user = req.user!;
      const reference = paystackService.generateReference("LMPS");
      const callbackUrl = process.env.PAYSTACK_CALLBACK_URL || `${req.protocol}://${req.get('host')}/api/payments/verify`;
      
      const payment = await storage.createPayment({
        userId: user.id,
        amount: amount * 100, // Convert to kobo/cents
        email: user.email,
        paymentType: paymentType || "subscription",
        subscriptionPlan: subscriptionPlan || "monthly",
        status: "pending",
        reference,
        description: description || `Payment for Last Mile Postal System - ${paymentType || "subscription"}`,
      });
      
      try {
        const paystackResponse = await paystackService.initializeTransaction({
          email: user.email,
          amount: amount * 100, // Paystack expects amount in kobo/cents
          reference,
          callback_url: callbackUrl,
          metadata: {
            userId: user.id,
            paymentId: payment.id,
            paymentType,
          },
          channels: ['card', 'mobile_money'], // Support both Visa and M-Pesa
        });
        
        await storage.updatePayment(payment.id, {
          authorizationUrl: paystackResponse.data.authorization_url,
          accessCode: paystackResponse.data.access_code,
        });
        
        res.json({
          message: "Payment initialized. Please complete payment on the provided URL.",
          payment: {
            id: payment.id,
            amount: amount,
            reference,
            authorizationUrl: paystackResponse.data.authorization_url,
          }
        });
      } catch (paystackError: any) {
        await storage.updatePayment(payment.id, { status: "failed" });
        
        await NotificationService.createNotification({
          userId: user.id,
          title: "Payment Initiation Failed",
          message: "We couldn't process your payment request. Please try again.",
          type: "payment_failed"
        });
        
        throw paystackError;
      }
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to initiate payment" });
    }
  });
  
  // Paystack webhook endpoint for payment notifications
  app.post("/api/payments/webhook", async (req, res) => {
    try {
      console.log("💳 Paystack Webhook Received:", JSON.stringify(req.body, null, 2));
      
      // Verify webhook signature for security
      const signature = req.headers['x-paystack-signature'] as string;
      const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
      
      if (paystackSecret) {
        // If secret is configured, signature verification is required
        if (!signature) {
          console.error('❌ Missing Paystack webhook signature');
          return res.status(401).json({ message: 'Missing signature' });
        }
        
        const crypto = await import('crypto');
        // Use raw body (original bytes) for signature verification
        const rawBody = req.rawBody as Buffer;
        const hash = crypto.createHmac('sha512', paystackSecret)
          .update(rawBody)
          .digest('hex');
        
        if (hash !== signature) {
          console.error('❌ Invalid Paystack webhook signature');
          return res.status(401).json({ message: 'Invalid signature' });
        }
        console.log('✅ Paystack webhook signature verified');
      }
      
      const event = req.body;
      
      if (event.event === "charge.success") {
        const { reference, amount, channel, paid_at } = event.data;
        
        const payment = await storage.getPaymentByReference(reference);
        
        if (!payment) {
          console.log(`⚠️  Payment not found for reference: ${reference}`);
          return res.status(404).json({ message: "Payment not found" });
        }
        
        await storage.updatePayment(payment.id, {
          status: "completed",
          channel,
          transactionDate: new Date(paid_at),
        });
        
        // Calculate subscription expiry date based on plan
        const subscriptionPlan = payment.subscriptionPlan || "monthly";
        const now = new Date();
        const expiryDate = new Date(now);
        
        switch (subscriptionPlan) {
          case "monthly":
            expiryDate.setMonth(expiryDate.getMonth() + 1);
            break;
          case "quarterly":
            expiryDate.setMonth(expiryDate.getMonth() + 3);
            break;
          case "bi_annually":
            expiryDate.setMonth(expiryDate.getMonth() + 6);
            break;
          case "annually":
            expiryDate.setFullYear(expiryDate.getFullYear() + 1);
            break;
        }
        
        // Update user's payment status and subscription details
        await storage.updateUser(payment.userId, {
          hasCompletedPayment: true,
          subscriptionPlan,
          subscriptionExpiresAt: expiryDate as any,
        });
        
        await NotificationService.createNotification({
          userId: payment.userId,
          title: "Payment Successful",
          message: `Your payment of KES ${amount / 100} has been received. Your dashboard is now activated!`,
          type: "payment_success"
        });
        
        console.log(`✅ Payment completed - Reference: ${reference}, Amount: KES ${amount / 100}, Channel: ${channel}, Plan: ${subscriptionPlan}`);
      } else if (event.event === "charge.failed") {
        const { reference } = event.data;
        
        const payment = await storage.getPaymentByReference(reference);
        
        if (payment) {
          await storage.updatePayment(payment.id, {
            status: "failed",
          });
          
          await NotificationService.createNotification({
            userId: payment.userId,
            title: "Payment Failed",
            message: "Your payment failed. Please try again.",
            type: "payment_failed"
          });
          
          console.log(`❌ Payment failed - Reference: ${reference}`);
        }
      }
      
      res.status(200).json({ message: "Webhook processed" });
    } catch (error: any) {
      console.error("Error processing Paystack webhook:", error);
      res.status(500).json({ message: error.message || "Failed to process webhook" });
    }
  });
  
  app.get("/api/payments/history", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const payments = await storage.getPaymentsByUserId(req.user!.id);
      res.json({ payments });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch payment history" });
    }
  });
  
  // Verify payment by reference
  app.get("/api/payments/verify/:reference", async (req, res) => {
    try {
      const { reference } = req.params;
      
      const verifyResponse = await paystackService.verifyTransaction(reference);
      
      if (!verifyResponse.status) {
        return res.status(400).json({ message: "Payment verification failed" });
      }
      
      const payment = await storage.getPaymentByReference(reference);
      
      if (!payment) {
        return res.status(404).json({ message: "Payment not found" });
      }
      
      if (verifyResponse.data.status === "success") {
        await storage.updatePayment(payment.id, {
          status: "completed",
          channel: verifyResponse.data.channel,
          transactionDate: new Date(verifyResponse.data.paid_at),
        });
        
        // Update user's payment status
        await storage.updateUser(payment.userId, {
          hasCompletedPayment: true,
        });
        
        await NotificationService.createNotification({
          userId: payment.userId,
          title: "Payment Successful",
          message: `Your payment of KES ${verifyResponse.data.amount / 100} has been received. Your dashboard is now activated!`,
          type: "payment_success"
        });
        
        res.json({ 
          message: "Payment verified successfully",
          status: "success",
          amount: verifyResponse.data.amount / 100,
          channel: verifyResponse.data.channel,
        });
      } else {
        await storage.updatePayment(payment.id, { status: "failed" });
        res.json({ 
          message: "Payment verification failed",
          status: verifyResponse.data.status,
        });
      }
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to verify payment" });
    }
  });
  
  app.get("/api/payments/:id/status", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const payment = await storage.getPayment(id);
      
      if (!payment) {
        return res.status(404).json({ message: "Payment not found" });
      }
      
      if (payment.userId !== req.user!.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      if (payment.status === "pending" && payment.reference) {
        try {
          const verifyResponse = await paystackService.verifyTransaction(payment.reference);
          
          if (verifyResponse.status && verifyResponse.data.status === "success") {
            await storage.updatePayment(payment.id, { 
              status: "completed",
              channel: verifyResponse.data.channel,
              transactionDate: new Date(verifyResponse.data.paid_at),
            });
            
            // Update user's payment status
            await storage.updateUser(payment.userId, {
              hasCompletedPayment: true,
            });
          } else if (verifyResponse.data.status === "failed") {
            await storage.updatePayment(payment.id, { status: "failed" });
          }
        } catch (error) {
          console.error("Failed to query Paystack status:", error);
        }
      }
      
      const updatedPayment = await storage.getPayment(id);
      res.json({ payment: updatedPayment });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to check payment status" });
    }
  });

  // Installation Request routes
  app.post("/api/installation-requests", async (req, res) => {
    try {
      const requestData = insertInstallationRequestSchema.parse(req.body);
      const installationRequest = await storage.createInstallationRequest(requestData);
      
      // TODO: Send notification to admin about new installation request
      res.status(201).json(installationRequest);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to create installation request" });
    }
  });
  
  app.get("/api/installation-requests", requireAuth, requireRole(["admin"]), async (req: AuthenticatedRequest, res) => {
    try {
      const requests = await storage.getAllInstallationRequests();
      res.json(requests);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch installation requests" });
    }
  });
  
  app.get("/api/installation-requests/pending", requireAuth, requireRole(["admin"]), async (req: AuthenticatedRequest, res) => {
    try {
      const requests = await storage.getPendingInstallationRequests();
      res.json(requests);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch pending requests" });
    }
  });
  
  app.get("/api/installation-requests/:id", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const request = await storage.getInstallationRequest(id);
      
      if (!request) {
        return res.status(404).json({ message: "Installation request not found" });
      }
      
      // Only admin or the requester can view
      if (req.user!.role !== "admin" && request.userId !== req.user!.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      res.json(request);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch installation request" });
    }
  });
  
  app.patch("/api/installation-requests/:id", requireAuth, requireRole(["admin"]), async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const request = await storage.updateInstallationRequest(id, updates);
      
      if (!request) {
        return res.status(404).json({ message: "Installation request not found" });
      }
      
      res.json(request);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to update installation request" });
    }
  });
  
  // Service Pricing routes
  app.get("/api/service-pricing", async (req, res) => {
    try {
      const pricing = await storage.getActiveServicePricing();
      res.json(pricing);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch service pricing" });
    }
  });
  
  app.get("/api/service-pricing/all", requireAuth, requireRole(["admin"]), async (req: AuthenticatedRequest, res) => {
    try {
      const pricing = await storage.getAllServicePricing();
      res.json(pricing);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch all service pricing" });
    }
  });
  
  app.post("/api/service-pricing", requireAuth, requireRole(["admin"]), async (req: AuthenticatedRequest, res) => {
    try {
      const pricingData = req.body;
      const pricing = await storage.createServicePricing(pricingData);
      res.status(201).json(pricing);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to create service pricing" });
    }
  });
  
  app.patch("/api/service-pricing/:id", requireAuth, requireRole(["admin"]), async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const pricing = await storage.updateServicePricing(id, updates);
      
      if (!pricing) {
        return res.status(404).json({ message: "Service pricing not found" });
      }
      
      res.json(pricing);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to update service pricing" });
    }
  });
  
  // Update box allocation to use active boxes only
  app.get("/api/boxes/active", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const boxes = await storage.getActiveBoxes();
      res.json(boxes);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch active boxes" });
    }
  });

  const httpServer =;
  
  //websocketService.initialize(httpServer);
  
  return httpServer;
}