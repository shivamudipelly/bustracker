// validations/userSchemas.ts
import Joi from "joi";
import { CreateUserDto, UpdateUserDto, UserRole, UserStatus, LoginDto, CreateBusDto, UpdateBusDto } from "../types";

// Create user
export const createUserSchema = Joi.object<CreateUserDto>({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  phone: Joi.string().optional(),
  role: Joi.string().valid(...Object.values(UserRole)).optional(),
  status: Joi.string().valid("active", "inactive", "suspended").optional(),
});

// Update user
export const updateUserSchema = Joi.object<UpdateUserDto>({
  name: Joi.string().min(2).max(50).optional(),
  email: Joi.string().email().optional(),
  password: Joi.string().min(6).optional(),
  phone: Joi.string().optional(),
  role: Joi.string().valid(...Object.values(UserRole)).optional(),
  status: Joi.string().valid("active", "inactive", "suspended").optional(),
});


export const loginSchema = Joi.object<LoginDto>({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  rememberMe: Joi.boolean().optional(),
})
export const createBusSchema = Joi.object<CreateBusDto>({
  busId: Joi.number().integer().positive().required(),
  destination: Joi.string().min(2).max(100).required(),
  source: Joi.string().min(2).max(100).optional().default("Anurag University"),
  driverId: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/) // ObjectId validation
    .required(),
  capacity: Joi.number().integer().min(1).max(100).optional().default(50),
  busType: Joi.string()
    .valid("standard", "deluxe", "mini", "AC")
    .optional(),
});

// Bus validation schemas
export const updateBusSchema = Joi.object<UpdateBusDto>({
  destination: Joi.string().min(2).max(100).optional(),

  source: Joi.string().min(2).max(100).optional(),

  driverId: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/) // ObjectId validation
    .optional(),

  status: Joi.string()
    .valid("active", "inactive", "maintenance")
    .optional(),

  location: Joi.object({
    latitude: Joi.number().required(),
    longitude: Joi.number().required(),
    timestamp: Joi.date().optional(),
  }).optional(),

  stops: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().required(),
        coordinates: Joi.array().items(Joi.number()).length(2).required(),
      }),
    )
    .optional(),

  capacity: Joi.number().integer().min(1).max(100).optional(),

  busType: Joi.string()
    .valid("standard", "deluxe", "mini", "AC")
    .optional(),
});


// Generic validation function
export const validate = <T>(schema: Joi.ObjectSchema<T>, data: unknown): T => {

  const { error, value } = schema.validate(data, { abortEarly: false });

  if (error) {
    const errorMessage = error.details.map(detail => detail.message).join(', ');
    throw new Error(`Validation error: ${errorMessage}`);
  }

  return value;
};
