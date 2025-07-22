import { Types } from "mongoose"
import User, { IUser } from "../models/User"
import type { CreateUserDto, UpdateUserDto } from "../types"

export class UserRepository {
  async create(userData: CreateUserDto): Promise<IUser> {
    const user = new User(userData)
    return await user.save()
  }

  async findById(id: string): Promise<IUser | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null
    }
    return await User.findById(id)
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return await User.findOne({ email: email })
  }

  async findAll(): Promise<IUser[]> {
    return await User.find()
  }

  async update(id: string, userData: UpdateUserDto): Promise<IUser | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null
    }

    return await User.findByIdAndUpdate(id, { $set: userData }, { new: true, runValidators: true })
  }

  async delete(id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) {
      return false
    }

    const result = await User.findByIdAndDelete(id)
    return !!result
  }

  async findByVerificationToken(token: string): Promise<IUser | null> {
    return await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: new Date() },
    })
  }

  async countByRole(role: string): Promise<number> {
    return await User.countDocuments({ role })
  }
}
