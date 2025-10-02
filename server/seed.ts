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
    
    const boxExists = await storage.getBoxByBoxId("KB-TEST1");
    if (!boxExists) {
      const box = await storage.createBox({
        boxId: "KB-TEST1",
        location: "Westlands Hub, Nairobi",
        ownerId: residentId,
        status: "operational",
        batteryLevel: 100
      });
      console.log("✓ Created test box:", box.boxId);
    }
    
    console.log("Test data seeding completed!");
    console.log("Test credentials - Username: test_admin/test_resident/test_courier, Password: Test123!");
  } catch (error) {
    console.error("Error seeding test data:", error);
  }
}
