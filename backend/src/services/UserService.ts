import crypto from "crypto"
import bcrypt from "bcryptjs"
import { UserRepository } from "../repositories/UserRepository"
import { IUser, type CreateUserDto, type UpdateUserDto, type IUserService } from "../types"
import { ConflictError, NotFoundError, ValidationError } from "../utils/errors"
import { EmailService } from "./EmailService"
import { logger } from "../config/logger"

export class UserService implements IUserService {
  private userRepository: UserRepository
  private emailService: EmailService

  constructor() {
    this.userRepository = new UserRepository()
    this.emailService = new EmailService()
  }

  async createUser(userData: CreateUserDto): Promise<IUser> {
    const existingUser = await this.userRepository.findByEmail(userData.email)

    if (existingUser) {
      if (existingUser.isVerified) {
        throw new ConflictError("Email already verified. Please log in.")
      } else {
        // Resend verification email
        await this.sendVerificationEmail(existingUser)
        throw new ConflictError("Verification email resent. Please check your inbox.")
      }
    }

    const user = await this.userRepository.create({
      ...userData,
      email: userData.email.toLowerCase(),
    })

    await this.sendVerificationEmail(user)
    logger.info(`User created: ${user.email}`)

    return user
  }

  async getUserById(id: string): Promise<IUser | null> {
    return await this.userRepository.findById(id)
  }

  async getUserByEmail(email: string): Promise<IUser | null> {
    return await this.userRepository.findByEmail(email)
  }

  async updateUser(id: string, userData: UpdateUserDto): Promise<IUser | null> {
    const user = await this.userRepository.findById(id)
    if (!user) {
      throw new NotFoundError("User")
    }

    // Check email uniqueness if email is being updated
    if (userData.email && userData.email !== user.email) {
      const existingUser = await this.userRepository.findByEmail(userData.email)
      if (existingUser) {
        throw new ConflictError("Email already exists")
      }
    }

    // Hash password if provided
    if (userData.password) {
      const salt = await bcrypt.genSalt(10)
      userData.password = await bcrypt.hash(userData.password, salt)
    }

    const updatedUser = await this.userRepository.update(id, userData)
    logger.info(`User updated: ${updatedUser?.email}`)

    return updatedUser
  }

  async deleteUser(id: string): Promise<boolean> {
    const user = await this.userRepository.findById(id)
    if (!user) {
      throw new NotFoundError("User")
    }

    const deleted = await this.userRepository.delete(id)
    if (deleted) {
      logger.info(`User deleted: ${user.email}`)
    }

    return deleted
  }

  async getAllUsers(): Promise<IUser[]> {
    return await this.userRepository.findAll()
  }

  async verifyUser(token: string): Promise<boolean> {
    const user = await this.userRepository.findByVerificationToken(token)

    if (!user) {
      throw new ValidationError("Invalid or expired verification token")
    }

    user.isVerified = true
    user.verificationToken = undefined
    user.verificationTokenExpires = undefined
    await user.save()

    logger.info(`User verified: ${user.email}`)
    return true
  }

  private async sendVerificationEmail(user: any): Promise<void> {
      const token = crypto.randomBytes(32).toString("hex")
      const expirationTime = new Date(Date.now() + 60 * 60 * 1000) // 1 hour
  
      user.verificationToken = token
      user.verificationTokenExpires = expirationTime
      await user.save()
  
      await this.emailService.sendVerificationEmail(user.email, user.name, token)
    }

  async sendPasswordResetEmail(email: string): Promise<void> {
    const user = await this.userRepository.findByEmail(email)
    if (!user) {
      // Don't reveal if user exists
      return
    }

    const token = crypto.randomBytes(32).toString("hex")
    const expirationTime = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    user.verificationToken = token
    user.verificationTokenExpires = expirationTime
    await user.save()

    await this.emailService.sendPasswordResetEmail(user.email, user.name, token)
    logger.info(`Password reset email sent: ${user.email}`)
  }

  async resetPassword(token: string, newPassword: string): Promise<boolean> {
    const user = await this.userRepository.findByVerificationToken(token)

    if (!user) {
      throw new ValidationError("Invalid or expired reset token")
    }

    user.password = newPassword
    user.verificationToken = undefined
    user.verificationTokenExpires = undefined
    await user.save()

    logger.info(`Password reset: ${user.email}`)
    return true
  }
}
