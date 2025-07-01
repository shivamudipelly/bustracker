import { App } from "./app"
import { logger } from "./config/logger"
import { requestLogger } from "./middleware/requestLogger"

const app = new App()

// Graceful shutdown
process.on("SIGTERM", async () => {
  logger.info("SIGTERM received, shutting down gracefully")
  await app.stop()
  process.exit(0)
})

process.on("SIGINT", async () => {
  logger.info("SIGINT received, shutting down gracefully")
  await app.stop()
  process.exit(0)
})

process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection at:", promise, "reason:", reason)
  process.exit(1)
})

process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception:", error)
  process.exit(1)
})

// Use before your routes
app.app.use(requestLogger)

// Start the server
app.start().catch((error) => {
  logger.error("Failed to start application:", error)
  process.exit(1)
})
