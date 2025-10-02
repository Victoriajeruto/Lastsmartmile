import { storage } from "./storage";
import { hashPassword } from "./auth";

export async function seedTestData() {
  try {
    console.log("Seeding test data...");
    
    const testPassword = await hashPassword("Test123!");
    
    const adminExists = await storage.getUserByUsername("test_admin");
    if (!adminExists) {
      const admin = await storage.createUser({
        username: "test_admin",
        email: "admin@test.com",
        password: testPassword,
        firstName: "Test",
        lastName: "Admin",
        role: "admin",
        phone: "+254700000001"
      });
      console.log("✓ Created test admin:", admin.username);
    }
    
    const residentExists = await storage.getUserByUsername("test_resident");
    let residentId;
    if (!residentExists) {
      const resident = await storage.createUser({
        username: "test_resident",
        email: "resident@test.com",
        password: testPassword,
        firstName: "Test",
        lastName: "Resident",
        role: "resident",
        phone: "+254700000002"
      });
      residentId = resident.id;
      console.log("✓ Created test resident:", resident.username);
    } else {
      residentId = residentExists.id;
    }
    
    const courierExists = await storage.getUserByUsername("test_courier");
    if (!courierExists) {
      const courier = await storage.createUser({
        username: "test_courier",
        email: "courier@test.com",
        password: testPassword,
        firstName: "Test",
        lastName: "Courier",
        role: "courier",
        phone: "+254700000003"
      });
      console.log("✓ Created test courier:", courier.username);
    }
    
    const testBoxes = [
      { boxId: "KB-WE01", location: "Westlands Hub, Nairobi", latitude: "-1.2640", longitude: "36.8063", batteryLevel: 100 },
      { boxId: "KB-CBD01", location: "CBD Central Post, Nairobi", latitude: "-1.2864", longitude: "36.8172", batteryLevel: 85 },
      { boxId: "KB-KIL01", location: "Kilimani Mall, Nairobi", latitude: "-1.2921", longitude: "36.7872", batteryLevel: 92 },
      { boxId: "KB-KAR01", location: "Karen Shopping Centre", latitude: "-1.3197", longitude: "36.7079", batteryLevel: 78 },
      { boxId: "KB-UP01", location: "Upper Hill Plaza, Nairobi", latitude: "-1.2941", longitude: "36.8261", batteryLevel: 95 }
    ];

    const createdBoxes = [];
    for (const boxData of testBoxes) {
      const boxExists = await storage.getBoxByBoxId(boxData.boxId);
      if (!boxExists) {
        const box = await storage.createBox({
          boxId: boxData.boxId,
          location: boxData.location,
          latitude: boxData.latitude,
          longitude: boxData.longitude,
          ownerId: residentId,
          status: "operational",
          batteryLevel: boxData.batteryLevel
        });
        console.log("✓ Created test box:", boxData.boxId);
        createdBoxes.push(box);
      } else {
        createdBoxes.push(boxExists);
      }
    }

    const courierUser = await storage.getUserByUsername("test_courier");
    if (courierUser && createdBoxes.length >= 3) {
      const testDeliveries = [
        { 
          trackingNumber: "TRK-001", 
          boxId: createdBoxes[0].id, 
          priority: "urgent",
          packageType: "small_parcel" 
        },
        { 
          trackingNumber: "TRK-002", 
          boxId: createdBoxes[1].id, 
          priority: "normal",
          packageType: "medium_package" 
        },
        { 
          trackingNumber: "TRK-003", 
          boxId: createdBoxes[2].id, 
          priority: "express",
          packageType: "document" 
        },
      ];

      for (const deliveryData of testDeliveries) {
        const deliveryExists = await storage.getDeliveryByTrackingNumber(deliveryData.trackingNumber);
        if (!deliveryExists) {
          await storage.createDelivery({
            trackingNumber: deliveryData.trackingNumber,
            boxId: deliveryData.boxId,
            courierId: courierUser.id,
            recipientId: residentId,
            packageType: deliveryData.packageType,
            priority: deliveryData.priority,
            weight: "1.5",
            notes: "Test delivery",
            status: "assigned",
            assignedAt: new Date() as any
          });
          console.log("✓ Created test delivery:", deliveryData.trackingNumber);
        }
      }
    }
    
    console.log("Test data seeding completed!");
    console.log("Test credentials - Username: test_admin/test_resident/test_courier, Password: Test123!");
  } catch (error) {
    console.error("Error seeding test data:", error);
  }
}
