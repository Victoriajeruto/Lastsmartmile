import { WebSocketServer, WebSocket } from "ws";
import { Server } from "http";
import { verifyToken } from "../auth";

interface AuthenticatedWebSocket extends WebSocket {
  userId?: string;
  userRole?: string;
}

class WebSocketService {
  private wss: WebSocketServer | null = null;
  private clients: Map<string, Set<AuthenticatedWebSocket>> = new Map();

  initialize(server: Server) {
    this.wss = new WebSocketServer({ server, path: "/ws" });

    this.wss.on("connection", (ws: AuthenticatedWebSocket, req) => {
      const token = new URL(req.url!, `http://${req.headers.host}`).searchParams.get("token");

      if (!token) {
        ws.close(1008, "Authentication required");
        return;
      }

      try {
        const decoded = verifyToken(token);
        ws.userId = decoded.id;
        ws.userRole = decoded.role;

        if (!this.clients.has(decoded.id)) {
          this.clients.set(decoded.id, new Set());
        }
        this.clients.get(decoded.id)!.add(ws);

        console.log(`🔌 WebSocket connected: User ${decoded.id} (${decoded.role})`);

        ws.on("close", () => {
          if (ws.userId) {
            this.clients.get(ws.userId)?.delete(ws);
            if (this.clients.get(ws.userId)?.size === 0) {
              this.clients.delete(ws.userId);
            }
            console.log(`🔌 WebSocket disconnected: User ${ws.userId}`);
          }
        });

        ws.on("error", (error) => {
          console.error("WebSocket error:", error);
        });

        ws.send(JSON.stringify({
          type: "connection",
          message: "Connected to Smart P.O Box real-time notifications"
        }));
      } catch (error) {
        ws.close(1008, "Invalid token");
      }
    });

    console.log("✅ WebSocket server initialized on /ws");
  }

  sendToUser(userId: string, message: any) {
    const userClients = this.clients.get(userId);
    if (userClients) {
      const payload = JSON.stringify(message);
      userClients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(payload);
        }
      });
    }
  }

  broadcastToRole(role: string, message: any) {
    const payload = JSON.stringify(message);
    this.clients.forEach((clientSet, userId) => {
      clientSet.forEach((client) => {
        if (client.userRole === role && client.readyState === WebSocket.OPEN) {
          client.send(payload);
        }
      });
    });
  }

  broadcast(message: any) {
    const payload = JSON.stringify(message);
    this.clients.forEach((clientSet) => {
      clientSet.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(payload);
        }
      });
    });
  }

  getConnectedUsers(): number {
    return this.clients.size;
  }

  getConnectionsByRole(role: string): number {
    let count = 0;
    this.clients.forEach((clientSet) => {
      clientSet.forEach((client) => {
        if (client.userRole === role) {
          count++;
        }
      });
    });
    return count;
  }
}

export const websocketService = new WebSocketService();
