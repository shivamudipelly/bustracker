import crypto from "crypto";
import bcrypt from "bcryptjs";
import { UserRepository } from "../repositories/UserRepository";
import { BusRepository } from "../repositories/BusRepository";
import { IUser, CreateUserDto, UpdateUserDto, UserRole } from "../types";
import { ConflictError, NotFoundError, ValidationError } from "../utils/errors";
import { EmailService } from "./EmailService";
import logger from "../config/logger";

export class UserService {
  private userRepository: UserRepository;
  private emailService: EmailService;
  private busRepository: BusRepository;

  constructor() {
    this.userRepository = new UserRepository();
    this.emailService = new EmailService();
    this.busRepository = new BusRepository();
  }

  async createUser(userData: CreateUserDto): Promise<IUser> {
    const existingUser = await this.userRepository.findByEmail(userData.email);

    if (existingUser) {
      if (existingUser.isVerified) {
        throw new ConflictError("Email already verified. Please log in.");
      } else {
        await this.sendVerificationEmail(existingUser);
        throw new ConflictError(
          "Verification email resent. Please check your inbox.",
        );
      }
    }

    const user = await this.userRepository.create({
      ...userData,
      email: userData.email.toLowerCase(),
    });

    await this.sendVerificationEmail(user);
    logger.info(`User created: ${user.email}`);
    return user;
  }

  async getUserById(id: string): Promise<IUser | null> {
    return await this.userRepository.findById(id);
  }

  async getUserByEmail(email: string): Promise<IUser | null> {
    return await this.userRepository.findByEmail(email);
  }

  async updateUser(id: string, userData: UpdateUserDto): Promise<IUser | null> {
    const user = await this.userRepository.findById(id);
    if (!user) throw new NotFoundError("User");

    if (userData.email && userData.email !== user.email) {
      const existingUser = await this.userRepository.findByEmail(
        userData.email,
      );
      if (existingUser) throw new ConflictError("Email already exists");
    }

    if (userData.password) {
      const salt = await bcrypt.genSalt(10);
      userData.password = await bcrypt.hash(userData.password, salt);
    }

    const updatedUser = await this.userRepository.update(id, userData);
    logger.info(`User updated: ${updatedUser?.email}`);
    return updatedUser;
  }

  async deleteUser(id: string): Promise<boolean> {
    const user = await this.userRepository.findById(id);
    if (!user) throw new NotFoundError("User not found");

    if (user.role === UserRole.DRIVER) {
      const assignedBus = await this.busRepository.findByDriverId(user._id);
      if (assignedBus) {
        throw new ConflictError(
          `Cannot delete driver. Assigned to Bus #${assignedBus.busId}. Unassign first.`,
        );
      }
    }

    const deleted = await this.userRepository.delete(id);
    if (deleted) logger.info(`User deleted: ${user.email}`);
    return deleted;
  }

  // ✅ FIX: Pass pagination to Repo
  async getAllUsers(page: number = 1, limit: number = 20) {
    return await this.userRepository.findAll(page, limit);
  }

  async verifyUser(token: string): Promise<boolean> {
    const user = await this.userRepository.findByVerificationToken(token);
    if (!user)
      throw new ValidationError("Invalid or expired verification token");

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    logger.info(`User verified: ${user.email}`);
    return true;
  }

  private async sendVerificationEmail(user: any): Promise<void> {
    const token = crypto.randomBytes(32).toString("hex");
    const expirationTime = new Date(Date.now() + 60 * 60 * 1000);

    user.verificationToken = token;
    user.verificationTokenExpires = expirationTime;
    await user.save();

    await this.emailService.sendVerificationEmail(user.email, user.name, token);
  }

  async sendPasswordResetEmail(email: string): Promise<void> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) return;

    const token = crypto.randomBytes(32).toString("hex");
    const expirationTime = new Date(Date.now() + 60 * 60 * 1000);

    user.verificationToken = token;
    user.verificationTokenExpires = expirationTime;
    await user.save();

    await this.emailService.sendPasswordResetEmail(
      user.email,
      user.name,
      token,
    );
    logger.info(`Password reset email sent: ${user.email}`);
  }

  async resetPassword(token: string, newPassword: string): Promise<boolean> {
    const user = await this.userRepository.findByVerificationToken(token);
    if (!user) throw new ValidationError("Invalid or expired reset token");

    user.password = newPassword;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    logger.info(`Password reset: ${user.email}`);
    return true;
  }
}
