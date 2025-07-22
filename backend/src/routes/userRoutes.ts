import { Router } from "express"
import { UserController } from "../controllers/UserController"
import { authMiddleware } from "../middleware/authMiddleware"

const router = Router()
const userController = new UserController()

// Public routes
router.post("/register", userController.register)
router.get("/verify-email", userController.verifyEmail)
router.post("/login", userController.login)
router.post("/forgot-password", userController.forgotPassword)
router.post("/reset-password", userController.resetPassword)


// Protected routes
router.get("/profile", authMiddleware.authenticate, userController.getProfile)
router.get("/getCurrentUser", authMiddleware.authenticate, userController.getCurrentUser)
router.put("/profile", authMiddleware.authenticate, userController.updateProfile)
router.post("/change-password", authMiddleware.authenticate, userController.profilePassword)
router.post("/logout", authMiddleware.authenticate, userController.logout)

export default router
