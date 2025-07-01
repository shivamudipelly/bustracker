import mongoose, { Schema, Document, Types } from "mongoose";
import bcrypt from "bcryptjs";

// Define user roles
export enum UserRole {
  ADMIN = "admin",
  DRIVER = "driver",
  VIEWER = "viewer",
}

// Define user status
export type UserStatus = "active" | "inactive" | "suspended";

// Interface for the document (used with mongoose)
export interface IUser extends Document<Types.ObjectId> {
  name: string;
  email: string;
  phone?: string;
  password: string;
  role: UserRole;
  status: UserStatus;
  isVerified: boolean;
  verificationToken?: string;
  verificationTokenExpires?: Date;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.VIEWER,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "active",
    },
    isVerified: { type: Boolean, default: false },
    verificationToken: { type: String },
    verificationTokenExpires: { type: Date },
    lastLogin: { type: Date },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);

// Pre-save hook to hash password if changed
UserSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err as Error);
  }
});

// Compare password method
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Create model
const User = mongoose.model<IUser>("User", UserSchema);
export default User;
