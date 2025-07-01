import type { Server, Socket } from "socket.io"
import { BusService } from "../services/BusService"
import type { ClientToServerEvents, ServerToClientEvents } from "../types"
import { logger } from "../config/logger"

export class SocketHandlers {
  private busService: BusService

  constructor() {
    this.busService = new BusService()
  }

  handleConnection = (io: Server<ClientToServerEvents, ServerToClientEvents>): void => {
    io.on("connection", (socket: Socket<ClientToServerEvents, ServerToClientEvents>) => {
      logger.info(`🔌 Client connected: ${socket.id}`)

      socket.on("joinBus", async ({ busId }) => {
        socket.join(busId)
        logger.info(`🚌 Client ${socket.id} joined room for Bus ${busId}`)

        try {
          const bus = await this.busService.getBusByBusId(busId)
          if (bus) {
            socket.emit("busLocationUpdate", {
              busId,
              lat: bus.location.latitude,
              lng: bus.location.longitude,
            })
          } else {
            logger.warn(`⚠️ Bus ${busId} not found in DB`)
          }
        } catch (error) {
          logger.error(`❌ Error fetching bus location for ${busId}:`, error)
        }
      })

      socket.on("leaveBus", ({ busId }) => {
        socket.leave(busId)
        logger.info(`🚪 Client ${socket.id} left room for Bus ${busId}`)
      })

      socket.on("locationUpdate", async ({ busId, lat, lng }) => {
        try {
          const updatedBus = await this.busService.updateBusLocation(busId, {
            latitude: lat,
            longitude: lng,
            timestamp: new Date(),
          })

          if (updatedBus) {
            logger.debug(`📍 Updated Bus ${busId} → ${lat}, ${lng}`)
            io.to(busId).emit("busLocationUpdate", { busId, lat, lng })
          } else {
            logger.warn(`⚠️ Bus ${busId} not found in DB`)
          }
        } catch (error) {
          logger.error(`❌ Error updating location for Bus ${busId}:`, error)
        }
      })

      socket.on("disconnect", () => {
        logger.info(`❌ Client disconnected: ${socket.id}`)
      })
    })
  }
}
