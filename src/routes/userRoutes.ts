import express from "express";
import { userController } from "../controllers/userController";
import { validate } from "../middleware/validate";
import { check } from "express-validator";

const router = express.Router();

router.post(
  "/register",
  validate([
    check("username").isLength({ min: 3 }).trim(),
    check("email").isEmail().normalizeEmail(),
    check("password").isLength({ min: 6 }),
  ]),
  userController.register
);

router.post(
  "/login",
  validate([
    check("email").isEmail().normalizeEmail(),
    check("password").exists(),
  ]),
  userController.login
);

export default router;
