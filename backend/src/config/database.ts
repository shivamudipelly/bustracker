import mongoose from "mongoose";
import { environment } from "./environment";
import { logger } from "./logger";

class DatabaseConnection {
  private static instance: DatabaseConnection;
  private isConnected = false;

  private constructor() {}

  public static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  public async connect(): Promise<void> {
    if (this.isConnected) {
      logger.info("✅ Database already connected");
      return;
    }

    try {
      const mongoUri = environment.get("MONGO_URI");

      await mongoose.connect(mongoUri, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });

      this.isConnected = true;
      logger.info(`✅ MongoDB Connected to: ${mongoose.connection.name}`);

      mongoose.connection.on("error", (error) => {
        logger.error("❌ MongoDB connection error:", error);
        this.isConnected = false;
      });

      mongoose.connection.on("disconnected", () => {
        logger.warn("⚠️ MongoDB disconnected");
        this.isConnected = false;
      });
    } catch (error) {
      logger.error("❌ MongoDB Connection Failed:", error);
      process.exit(1); // Exit process with failure
    }
  }

  public async disconnect(): Promise<void> {
    if (!this.isConnected) {
      return;
    }
    try {
      await mongoose.disconnect();
      this.isConnected = false;
      logger.info("🛑 MongoDB disconnected gracefully");
    } catch (error) {
      logger.error("❌ Error disconnecting from MongoDB:", error);
    }
  }
}

export const databaseConnection = DatabaseConnection.getInstance();
