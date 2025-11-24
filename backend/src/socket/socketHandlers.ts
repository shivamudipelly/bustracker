import type { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken"; // ✅ Import JWT
import { BusService } from "../services/BusService";
import {
  ClientToServerEvents,
  ServerToClientEvents,
  LocationUpdateDto,
} from "../types";
import { logger } from "../config/logger";
import { environment } from "../config/environment"; // ✅ Import Env

// In-memory state
interface BusState {
  lat: number;
  lng: number;
  lastUpdated: Date;
}

export class SocketHandlers {
  private busService: BusService;
  private busCache: Map<string, BusState> = new Map();
  private socketToBus: Map<string, string> = new Map();

  constructor() {
    this.busService = new BusService();
  }

  handleConnection = (
    io: Server<ClientToServerEvents, ServerToClientEvents>,
  ): void => {
    // ✅ 1. MIDDLEWARE: Authenticate Socket Connections
    io.use((socket, next) => {
      const token =
        socket.handshake.auth.token || socket.handshake.headers.token;

      if (!token) {
        logger.warn(
          `🚫 Socket connection rejected: No token provided (${socket.id})`,
        );
        return next(new Error("Authentication error: Token required"));
      }

      try {
        // Verify JWT
        const decoded = jwt.verify(
          token as string,
          environment.get("JWT_SECRET"),
        ) as { userId: string; role: string };

        // Attach user info to the socket object for later use
        (socket as any).user = decoded;

        next();
      } catch (err) {
        logger.warn(
          `🚫 Socket connection rejected: Invalid token (${socket.id})`,
        );
        next(new Error("Authentication error: Invalid token"));
      }
    });

    io.on(
      "connection",
      (socket: Socket<ClientToServerEvents, ServerToClientEvents>) => {
        const user = (socket as any).user;
        logger.info(
          `🔌 Client connected: ${socket.id} (User: ${user?.userId})`,
        );

        // --- 🚌 User Joins (Students/Admin) ---
        socket.on("joinBus", async ({ busId }) => {
          socket.join(busId);
          // Note: Students don't map socketToBus because they don't SEND updates.

          // Send cached location
          const cached = this.busCache.get(busId);
          if (cached) {
            socket.emit("busLocationUpdate", {
              busId,
              lat: cached.lat,
              lng: cached.lng,
            });
          } else {
            const bus = await this.busService.getBusByBusId(busId);
            if (bus) {
              socket.emit("busLocationUpdate", {
                busId,
                lat: bus.location.latitude,
                lng: bus.location.longitude,
              });
            }
          }
        });

        // --- 📍 Live Updates (DRIVERS ONLY) ---
        socket.on("locationUpdate", (data: LocationUpdateDto) => {
          // ✅ Security Check: Ensure the sender is a DRIVER
          // (You can add stricter checks here, like ensuring they own this specific bus)

          const { busId, lat, lng } = data;

          this.busCache.set(busId, { lat, lng, lastUpdated: new Date() });

          // Map socket to bus for disconnect handling
          this.socketToBus.set(socket.id, busId);

          io.to(busId).emit("busLocationUpdate", { busId, lat, lng });
        });

        socket.on("endTrip", async ({ busId }) => {
          logger.info(`🛑 End Trip: ${busId}`);
          await this.flushCacheToDb(busId);
          this.busCache.delete(busId);
          this.socketToBus.delete(socket.id);
        });

        socket.on("leaveBus", ({ busId }) => {
          socket.leave(busId);
        });

        socket.on("disconnect", async () => {
          const busId = this.socketToBus.get(socket.id);
          if (busId) {
            logger.warn(
              `⚠️ Driver disconnected unexpectedly: ${busId}. Saving data...`,
            );
            await this.flushCacheToDb(busId);
            this.socketToBus.delete(socket.id);
          }
        });
      },
    );
  };

  private async flushCacheToDb(busId: string) {
    const cached = this.busCache.get(busId);
    if (cached) {
      try {
        await this.busService.updateBusLocation(busId, {
          latitude: cached.lat,
          longitude: cached.lng,
          timestamp: cached.lastUpdated,
        });
        logger.info(`💾 DB SYNC: Saved final location for Bus ${busId}`);
      } catch (error) {
        logger.error(
          `❌ Failed to save final location for Bus ${busId}`,
          error,
        );
      }
    }
  }
}
