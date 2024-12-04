"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controllers/userController");
const validate_1 = require("../middleware/validate");
const express_validator_1 = require("express-validator");
const router = express_1.default.Router();
router.post("/register", (0, validate_1.validate)([
    (0, express_validator_1.check)("username").isLength({ min: 3 }).trim(),
    (0, express_validator_1.check)("email").isEmail().normalizeEmail(),
    (0, express_validator_1.check)("password").isLength({ min: 6 }),
]), userController_1.userController.register);
router.post("/login", (0, validate_1.validate)([
    (0, express_validator_1.check)("email").isEmail().normalizeEmail(),
    (0, express_validator_1.check)("password").exists(),
]), userController_1.userController.login);
exports.default = router;
