import { users, type User, type InsertUser } from "@shared/schema";

export { users, User, InsertUser };

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  role: "resident" | "courier" | "admin";
  county: string | null;
  estateName: string | null;
  apartmentName: string | null;
  latitude: string | null;
  longitude: string | null;
  boxCode: string | null;
  createdAt: Date | null;
}

export interface UserCredentials {
  username: string;
  password: string;
}

export interface UserRegistration extends Omit<InsertUser, "id"> {
  confirmPassword?: string;
}

export function sanitizeUser(user: User): Omit<User, "password"> {
  const { password, ...sanitizedUser } = user;
  return sanitizedUser;
}

export function isValidRole(role: string): role is "resident" | "courier" | "admin" {
  return ["resident", "courier", "admin"].includes(role);
}

export function getFullName(user: User): string {
  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`;
  }
  return user.firstName || user.lastName || user.username;
}
