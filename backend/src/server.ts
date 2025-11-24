import { App } from "./app";
import { logger } from "./config/logger";

const app = new App();

// Start the server
app.start().catch((error) => {
  logger.error("❌ Uncaught Error during startup:", error);
  process.exit(1);
});

// Graceful Shutdown Logic
const shutdown = async (signal: string) => {
  logger.info(`${signal} received. Starting graceful shutdown...`);
  await app.stop();
  process.exit(0);
};

// Handle kill commands (Ctrl+C, Docker stop, etc.)
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

// Handle uncaught software errors
process.on("uncaughtException", (error) => {
  logger.error("❌ Uncaught Exception:", error);
  shutdown("uncaughtException");
});

process.on("unhandledRejection", (reason) => {
  logger.error("❌ Unhandled Rejection:", reason);
  shutdown("unhandledRejection");
});
