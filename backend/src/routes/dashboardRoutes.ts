import { Router } from "express";
import { BusController } from "../controllers/BusController";
// Note: No authMiddleware here? You might want to add it if dashboard data is private.

const router = Router();
const busController = new BusController();

router.get("/stats", busController.getDashboardStats);
router.get("/buses", busController.getAllBuses);
router.get("/bus-by-email", busController.getBusByDriverEmail);

export default router;
