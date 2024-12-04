import express from "express";
import { dynamicEntityController } from "../controllers/dynamicEntityController";
import { protect, isAdmin } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { check } from "express-validator";
import mongoose from "mongoose";

const router = express.Router();

// Log inicial para verificar o ambiente
console.log("Current NODE_ENV:", process.env.NODE_ENV);
console.log("Is Development?:", process.env.NODE_ENV === "development");

// Middleware condicional baseado no ambiente
const conditionalProtect = (req: any, res: any, next: any) => {
  console.log("conditionalProtect called, NODE_ENV:", process.env.NODE_ENV);
  if (process.env.NODE_ENV === "development") {
    console.log("Bypassing protection in development");
    return next();
  }
  return protect(req, res, next);
};

const conditionalIsAdmin = (req: any, res: any, next: any) => {
  console.log("conditionalIsAdmin called, NODE_ENV:", process.env.NODE_ENV);
  if (process.env.NODE_ENV === "development") {
    console.log("Bypassing admin check in development");
    return next();
  }
  return isAdmin(req, res, next);
};

// Middleware para simular um usuário em desenvolvimento
const simulateUser = (req: any, res: any, next: any) => {
  if (process.env.NODE_ENV === "development") {
    req.user = {
      _id: new mongoose.Types.ObjectId(),
      name: "Dev User",
      email: "dev@example.com",
      role: "admin",
    };
  }
  next();
};

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
  dynamicEntityController.createEntity
);

// Create record in dynamic entity
router.post(
  "/:entityName/records",
  conditionalProtect,
  dynamicEntityController.createRecord
);

// Get records from dynamic entity
router.get(
  "/:entityName/records",
  conditionalProtect,
  dynamicEntityController.getRecords
);

// Get all registered entities
router.get(
  "/",
  conditionalProtect,
  simulateUser,
  dynamicEntityController.getEntities
);

export default router;
