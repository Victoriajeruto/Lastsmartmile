import { User } from "@/types";

const API_BASE = "https://lastsmartmile-gcxl.vercel.app";

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  role?: "resident" | "courier" | "admin";
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}
export const authApi = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Login failed");
    }

    return response.json();
  },

  async register(userData: RegisterData): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE}/api/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Registration failed");
    }

    return response.json();
  },

  async getCurrentUser(): Promise<{ user: User }> {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      throw new Error("No auth token found");
    }

    const response = await fetch(`${API_BASE}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to get user");
    }

    return response.json();
  },

  setToken(token: string): void {
    localStorage.setItem("auth_token", token);
  },

  getToken(): string | null {
    return localStorage.getItem("auth_token");
  },

  removeToken(): void {
    localStorage.removeItem("auth_token");
  },

  logout(): void {
    this.removeToken();
    window.location.href = "/login";
  },
};
