import type { Request, Response, NextFunction } from "express"
import type Joi from "joi"
import { ValidationError } from "../utils/errors"

export const validateRequest = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const { error, value } = schema.validate(req.body, { abortEarly: false })

      if (error) {
        const errorMessage = error.details.map((detail) => detail.message).join(", ")
        throw new ValidationError(errorMessage)
      }

      req.body = value
      next()
    } catch (err) {
      next(err)
    }
  }
}
