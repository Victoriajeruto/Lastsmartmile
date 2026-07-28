import { User } from "@/types";

const API_BASE = "";

/** Safely parse a JSON response; throw with fallback message if not JSON */
async function safeJsonParse<T>(response: Response, fallback: string): Promise<T> {
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    throw new Error(fallback);
  }
  try {
    return await response.json();
  } catch {
    throw new Error(fallback);
  }
}

/** Extract an error message from any response (JSON or plain text) */
async function extractErrorMessage(response: Response, fallback: string): Promise<string> {
  try {
    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const body = await response.json();
      return body.message || fallback;
    }
    const text = await response.text();
    // Strip HTML tags if the response is an HTML page
    const stripped = text.replace(/<[^>]*>/g, "").trim();
    return stripped.slice(0, 200) || fallback;
  } catch {
    return fallback;
  }
}

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
      throw new Error(await extractErrorMessage(response, "Login failed"));
    }

    return safeJsonParse(response, "Login failed");
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
      throw new Error(await extractErrorMessage(response, "Registration failed"));
    }

    return safeJsonParse(response, "Registration failed");
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
      throw new Error(await extractErrorMessage(response, "Failed to get user"));
    }

    return safeJsonParse(response, "Failed to get user");
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
