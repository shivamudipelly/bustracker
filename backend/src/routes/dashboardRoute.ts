import express from "express";
import { getAllBuses, getBusByEmail, getDashboardStats } from "../controllers/dashboardController";

const router = express.Router();

// GET /api/dashboard/stats
router.get("/stats", getDashboardStats);

router.get('/all', getAllBuses);
router.get('/getBusByEmail', getBusByEmail);

export default router;
