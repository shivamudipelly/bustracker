import mongoose from "mongoose"
import { logger } from "./logger"

class DatabaseConnection {
  private static instance: DatabaseConnection
  private isConnected = false

  private constructor() {}

  public static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection()
    }
    return DatabaseConnection.instance
  }

  public async connect(): Promise<void> {
    if (this.isConnected) {
      logger.info("Database already connected")
      return
    }

    try {
      const mongoUri = process.env.MONGO_URI
      if (!mongoUri) {
        throw new Error("MONGO_URI environment variable is not defined")
      }

      await mongoose.connect(mongoUri, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      })

      this.isConnected = true
      logger.info(`✅ MongoDB Connected: ${mongoose.connection.host}`)

      // Handle connection events
      mongoose.connection.on("error", (error) => {
        logger.error("MongoDB connection error:", error)
        this.isConnected = false
      })

      mongoose.connection.on("disconnected", () => {
        logger.warn("MongoDB disconnected")
        this.isConnected = false
      })
    } catch (error) {
      logger.error("❌ MongoDB Connection Error:", error)
      process.exit(1)
    }
  }

  public async disconnect(): Promise<void> {
    if (!this.isConnected) {
      return
    }

    try {
      await mongoose.disconnect()
      this.isConnected = false
      logger.info("MongoDB disconnected")
    } catch (error) {
      logger.error("Error disconnecting from MongoDB:", error)
    }
  }

  public getConnectionStatus(): boolean {
    return this.isConnected
  }
}

export const databaseConnection = DatabaseConnection.getInstance()
