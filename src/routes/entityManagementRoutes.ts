import express from "express";
import { entityManagementController } from "../controllers/entityManagementController";
import { validate } from "../middleware/validate";
import { check } from "express-validator";
import {
  conditionalProtect,
  conditionalIsAdmin,
  simulateUser,
} from "../middleware/developmentMiddleware";

const router = express.Router();

// Create new entity definition (admin only)
router.post(
  "/",
  conditionalProtect,
  conditionalIsAdmin,
  simulateUser,
  validate([
    check("name").matches(/^[a-zA-Z][a-zA-Z0-9]*$/),
    check("fields").isArray(),
    check("fields.*.name").matches(/^[a-zA-Z][a-zA-Z0-9]*$/),
    check("fields.*.type").isIn([
      "String",
      "Number",
      "Date",
      "Boolean",
      "ObjectId",
    ]),
  ]),
  entityManagementController.createEntity
);

// Get all registered entities
router.get(
  "/",
  conditionalProtect,
  simulateUser,
  entityManagementController.getEntities
);

// Delete entity definition (admin only)
router.delete(
  "/:name",
  conditionalProtect,
  conditionalIsAdmin,
  simulateUser,
  entityManagementController.deleteEntity
);

// Update entity definition (admin only)
router.put(
  "/:name",
  conditionalProtect,
  conditionalIsAdmin,
  simulateUser,
  validate([
    check("name").matches(/^[a-zA-Z][a-zA-Z0-9]*$/),
    check("fields").isArray(),
    check("fields.*.name").matches(/^[a-zA-Z][a-zA-Z0-9]*$/),
    check("fields.*.type").isIn([
      "String",
      "Number",
      "Date",
      "Boolean",
      "ObjectId",
    ]),
  ]),
  entityManagementController.updateEntity
);

export default router;
