import express from "express";
import { entityGroupController } from "../controllers/entityGroupController";
import { validate } from "../middleware/validate";
import { check } from "express-validator";
import {
  conditionalProtect,
  conditionalIsAdmin,
  simulateUser,
} from "../middleware/developmentMiddleware";

const router = express.Router();

// Create new group (admin only)
router.post(
  "/",
  conditionalProtect,
  conditionalIsAdmin,
  simulateUser,
  validate([
    check("name").matches(/^[a-zA-Z][a-zA-Z0-9]*$/),
    check("displayName").notEmpty(),
  ]),
  entityGroupController.createGroup
);

// Get all groups
router.get(
  "/",
  conditionalProtect,
  simulateUser,
  entityGroupController.getGroups
);

export default router;
