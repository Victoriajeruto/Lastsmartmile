export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: "resident" | "courier" | "admin";
  hasCompletedPayment?: boolean;
  county?: string;
  estateName?: string;
  apartmentName?: string;
}

export interface Box {
  id: string;
  boxId: string;
  location: string;
  ownerId?: string;
  status: "operational" | "maintenance" | "offline";
  batteryLevel?: number;
  lastActivity?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Delivery {
  id: string;
  trackingNumber: string;
  boxId: string;
  courierId?: string;
  recipientId: string;
  status: "pending" | "assigned" | "in_transit" | "delivered" | "failed";
  packageType: string;
  priority: string;
  weight?: string;
  notes?: string;
  assignedAt?: string;
  deliveredAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export interface UnlockCode {
  id: string;
  boxId: string;
  userId: string;
  otpCode?: string;
  qrCode?: string;
  expiresAt: string;
  isUsed: boolean;
  createdAt: string;
}
