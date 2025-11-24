import express, { Application } from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";

import { environment } from "./config/environment";
import { logger } from "./config/logger";
import { databaseConnection } from "./config/database";

// Routes
import userRoutes from "./routes/userRoutes";
import adminRoutes from "./routes/adminRoutes";
import busRoutes from "./routes/busRoutes";
import dashboardRoutes from "./routes/dashboardRoutes";

// Middleware & Handlers
import { errorHandler, notFoundHandler } from "./middleware/errorMiddleware";
import { requestLogger } from "./middleware/requestLogger";
import { SocketHandlers } from "./socket/socketHandlers";
import { ClientToServerEvents, ServerToClientEvents } from "./types";

export class App {
  public app: Application;
  public server: http.Server;
  public io: Server<ClientToServerEvents, ServerToClientEvents>;
  private socketHandlers: SocketHandlers;

  constructor() {
    this.app = express();
    this.server = http.createServer(this.app);

    // Socket.IO Setup with CORS
    this.io = new Server(this.server, {
      cors: {
        origin: environment.get("FRONTEND_URL"),
        methods: ["GET", "POST"],
        credentials: true,
      },
    });

    this.socketHandlers = new SocketHandlers();

    // Initialization Order Matters!
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeSocket();
    this.initializeErrorHandling(); // Error handlers must be last
  }

  private initializeMiddlewares(): void {
    // Security Headers
    this.app.use(helmet());

    // Rate Limiting (Prevent DDoS/Spam)
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // Limit each IP to 100 requests per windowMs
      message: "Too many requests from this IP, please try again later.",
      standardHeaders: true,
      legacyHeaders: false,
    });
    this.app.use(limiter);

    // CORS
    this.app.use(
      cors({
        origin: environment.get("FRONTEND_URL"),
        credentials: true,
      }),
    );

    // Body Parsing
    this.app.use(express.json({ limit: "10mb" }));
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cookieParser());

    // Custom Request Logger
    this.app.use(requestLogger);
  }

  private initializeRoutes(): void {
    // Health Check
    this.app.get("/health", (req, res) => {
      res.status(200).json({
        status: "OK",
        env: environment.get("NODE_ENV"),
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
      });
    });

    // API Routes
    this.app.use("/api/users", userRoutes);
    this.app.use("/api/admin", adminRoutes);
    this.app.use("/api/buses", busRoutes);
    this.app.use("/api/dashboard", dashboardRoutes);
  }

  private initializeSocket(): void {
    this.socketHandlers.handleConnection(this.io);
  }

  private initializeErrorHandling(): void {
    this.app.use(notFoundHandler);
    this.app.use(errorHandler);
  }

  public async start(): Promise<void> {
    try {
      await databaseConnection.connect();

      const PORT = environment.get("PORT");
      this.server.listen(PORT, () => {
        logger.info(`🚀 Server running on http://localhost:${PORT}`);
        logger.info(`🌍 Environment: ${environment.get("NODE_ENV")}`);
      });
    } catch (error) {
      logger.error("❌ Failed to start application:", error);
      process.exit(1);
    }
  }

  public async stop(): Promise<void> {
    try {
      await databaseConnection.disconnect();
      this.server.close(() => {
        logger.info("🛑 HTTP Server closed");
      });
      this.io.close(() => {
        logger.info("🛑 Socket.IO server closed");
      });
    } catch (error) {
      logger.error("❌ Error during shutdown:", error);
    }
  }
}
