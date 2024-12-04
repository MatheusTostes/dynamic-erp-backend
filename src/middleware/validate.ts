import { Request, Response, NextFunction } from "express";
import { validationResult, ValidationChain } from "express-validator";

// Middleware to validate request
export const validate = (validations: ValidationChain[]) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      next();
      return;
    }

    res.status(400).json({
      success: false,
      errors: errors.array(),
    });
    return;
  };
};

// Common validation rules
export const commonValidations = {
  // User validations
  userValidation: {
    username: {
      in: ["body"],
      isLength: {
        options: { min: 3, max: 30 },
        errorMessage: "Username must be between 3 and 30 characters",
      },
      trim: true,
    },
    email: {
      in: ["body"],
      isEmail: {
        errorMessage: "Must be a valid email address",
      },
      normalizeEmail: true,
    },
    password: {
      in: ["body"],
      isLength: {
        options: { min: 6 },
        errorMessage: "Password must be at least 6 characters long",
      },
    },
  },

  // Dynamic Entity validations
  entityValidation: {
    name: {
      in: ["body"],
      isLength: {
        options: { min: 2, max: 50 },
        errorMessage: "Entity name must be between 2 and 50 characters",
      },
      matches: {
        options: [/^[a-zA-Z][a-zA-Z0-9]*$/],
        errorMessage:
          "Entity name must start with a letter and contain only alphanumeric characters",
      },
      trim: true,
    },
    fields: {
      in: ["body"],
      isArray: {
        errorMessage: "Fields must be an array",
      },
    },
    "fields.*.name": {
      in: ["body"],
      isLength: {
        options: { min: 2, max: 50 },
        errorMessage: "Field name must be between 2 and 50 characters",
      },
      matches: {
        options: [/^[a-zA-Z][a-zA-Z0-9]*$/],
        errorMessage:
          "Field name must start with a letter and contain only alphanumeric characters",
      },
    },
    "fields.*.type": {
      in: ["body"],
      isIn: {
        options: [["String", "Number", "Date", "Boolean", "ObjectId"]],
        errorMessage: "Invalid field type",
      },
    },
  },
};
