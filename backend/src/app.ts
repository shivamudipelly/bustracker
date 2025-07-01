import express, { type Application } from "express"
import http from "http"
import { Server } from "socket.io"
import cors from "cors"
import helmet from "helmet"
import rateLimit from "express-rate-limit"
import cookieParser from "cookie-parser"

import { databaseConnection } from "./config/database"
import { environment } from "./config/environment"
import { logger } from "./config/logger"

import userRoutes from "./routes/userRoutes"
import adminRoutes from "./routes/adminRoutes"
import busRoutes from "./routes/busRoutes"
import dashboardRoutes from "./routes/dashboardRoutes"

import { errorHandler, notFoundHandler } from "./middleware/errorMiddleware"
import { SocketHandlers } from "./socket/socketHandlers"

export class App {
  public app: Application
  public server: http.Server
  public io: Server
  private socketHandlers: SocketHandlers

  constructor() {
    this.app = express()
    this.server = http.createServer(this.app)
    this.socketHandlers = new SocketHandlers()

    // Initialize Socket.IO - this fixes the "no initializer" error
    this.io = new Server(this.server, {
      cors: {
        origin: environment.get("FRONTEND_URL"),
        methods: ["GET", "POST"],
        credentials: true,
      },
    })

    this.initializeSocket()
    this.initializeMiddlewares()
    this.initializeRoutes()
    this.initializeErrorHandling()
  }

  private initializeSocket(): void {
    this.socketHandlers.handleConnection(this.io)
  }

  private initializeMiddlewares(): void {
    // Security middleware
    this.app.use(helmet())

    // Rate limiting
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      message: "Too many requests from this IP, please try again later.",
    })
    this.app.use(limiter)

    // CORS
    this.app.use(
      cors({
        origin: environment.get("FRONTEND_URL"),
        credentials: true,
      }),
    )

    // Body parsing
    this.app.use(express.json({ limit: "10mb" }))
    this.app.use(express.urlencoded({ extended: true }))
    this.app.use(cookieParser())
    

    // Request logging
    this.app.use((req, res, next) => {
      logger.info(`${req.method} ${req.path}`, {
        ip: req.ip,
        userAgent: req.get("User-Agent"),
      })
      next()
    })
  }

  private initializeRoutes(): void {
    // Health check
    this.app.get("/health", (req, res) => {
      res.status(200).json({
        status: "OK",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      })
    })

    // API routes
    this.app.use("/api/users", userRoutes)
    this.app.use("/api/admin", adminRoutes)
    this.app.use("/api/buses", busRoutes)
    this.app.use("/api/dashboard", dashboardRoutes)

    // At the end, after all routes:
    this.app.use(errorHandler)
  }

  private initializeErrorHandling(): void {
    this.app.use(notFoundHandler)
    this.app.use(errorHandler)
  }

  public async start(): Promise<void> {
    try {
      await databaseConnection.connect()

      const PORT = environment.get("PORT")
      this.server.listen(PORT, () => {
        logger.info(`🚀 Server running on http://localhost:${PORT}`)
        logger.info(`📊 Environment: ${environment.get("NODE_ENV")}`)
      })
    } catch (error) {
      logger.error("Failed to start server:", error)
      process.exit(1)
    }
  }

  public async stop(): Promise<void> {
    try {
      await databaseConnection.disconnect()
      this.server.close()
      logger.info("Server stopped gracefully")
    } catch (error) {
      logger.error("Error stopping server:", error)
    }
  }
}
