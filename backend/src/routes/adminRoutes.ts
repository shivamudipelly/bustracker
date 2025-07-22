import { Router } from "express"
import { AdminController } from "../controllers/AdminController"
import { authMiddleware } from "../middleware/authMiddleware"

const router = Router()
const adminController = new AdminController()

// Apply admin authentication middleware to all routes
router.use(authMiddleware.requireAdmin)

router.get("/users", adminController.getAllUsers)
router.post("/users", adminController.addUser)
router.get("/users/:email", adminController.getUserByEmail)
router.put("/users/:id", adminController.updateUser)
router.delete("/users/:id", adminController.deleteUser)

export default router
