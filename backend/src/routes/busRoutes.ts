import { Router } from "express";
import { BusController } from "../controllers/BusController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();
const busController = new BusController();

// Public routes
router.get("/", busController.getAllBuses);
router.get("/:busId", busController.getBusById);

// Admin only routes
router.post("/", authMiddleware.requireAdmin, busController.createBus);
router.put("/:busId", authMiddleware.requireAdmin, busController.updateBus);
router.delete("/:busId", authMiddleware.requireAdmin, busController.deleteBus);

export default router;
