import { io, type Socket } from "socket.io-client";
import { environment } from "@/config/environment";

interface BusLocationUpdate {
  busId: string;
  lat: number;
  lng: number;
}

class SocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  connect(): Socket {
    if (this.socket?.connected) return this.socket;

    this.socket = io(environment.get("SOCKET_URL"), {
      withCredentials: true,
      transports: ["websocket", "polling"],
    });

    this.setupEventListeners();
    return this.socket;
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on("connect", () => {
      console.log("🔌 Connected to socket server");
      this.reconnectAttempts = 0;
    });

    this.socket.on("disconnect", (reason) => {
      console.log("❌ Disconnected:", reason);
      this.handleReconnect();
    });

    this.socket.on("connect_error", (error) => {
      console.error("🔥 Connection error:", error);
      this.handleReconnect();
    });
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`🔄 Reconnecting... (${this.reconnectAttempts})`);
      setTimeout(() => {
        this.socket?.connect();
      }, this.reconnectDelay * this.reconnectAttempts);
    }
  }

  joinBusRoom(busId: string, role: "driver" | "viewer" = "viewer") {
    if (this.socket?.connected) {
      this.socket.emit("joinBus", { busId, role });
    }
  }

  leaveBusRoom(busId: string) {
    if (this.socket?.connected) {
      this.socket.emit("leaveBus", { busId });
    }
  }

  updateLocation(busId: string, lat: number, lng: number) {
    if (this.socket?.connected) {
      this.socket.emit("locationUpdate", { busId, lat, lng });
    }
  }

  onBusLocationUpdate(callback: (data: BusLocationUpdate) => void) {
    this.socket?.on("busLocationUpdate", callback);
  }

  offBusLocationUpdate(callback?: (data: BusLocationUpdate) => void) {
    if (!this.socket) return;
    if (callback) this.socket.off("busLocationUpdate", callback);
    else this.socket.off("busLocationUpdate");
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const socketService = new SocketService();
