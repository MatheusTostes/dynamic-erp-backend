"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dynamicEntityController_1 = require("../controllers/dynamicEntityController");
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const express_validator_1 = require("express-validator");
const mongoose_1 = __importDefault(require("mongoose"));
const router = express_1.default.Router();
// Log inicial para verificar o ambiente
console.log("Current NODE_ENV:", process.env.NODE_ENV);
console.log("Is Development?:", process.env.NODE_ENV === "development");
// Middleware condicional baseado no ambiente
const conditionalProtect = (req, res, next) => {
    console.log("conditionalProtect called, NODE_ENV:", process.env.NODE_ENV);
    if (process.env.NODE_ENV === "development") {
        console.log("Bypassing protection in development");
        return next();
    }
    return (0, auth_1.protect)(req, res, next);
};
const conditionalIsAdmin = (req, res, next) => {
    console.log("conditionalIsAdmin called, NODE_ENV:", process.env.NODE_ENV);
    if (process.env.NODE_ENV === "development") {
        console.log("Bypassing admin check in development");
        return next();
    }
    return (0, auth_1.isAdmin)(req, res, next);
};
// Middleware para simular um usuário em desenvolvimento
const simulateUser = (req, res, next) => {
    if (process.env.NODE_ENV === "development") {
        req.user = {
            _id: new mongoose_1.default.Types.ObjectId(),
            name: "Dev User",
            email: "dev@example.com",
            role: "admin",
        };
    }
    next();
};
// Create new entity definition (admin only)
router.post("/", conditionalProtect, conditionalIsAdmin, simulateUser, (0, validate_1.validate)([
    (0, express_validator_1.check)("name").matches(/^[a-zA-Z][a-zA-Z0-9]*$/),
    (0, express_validator_1.check)("fields").isArray(),
    (0, express_validator_1.check)("fields.*.name").matches(/^[a-zA-Z][a-zA-Z0-9]*$/),
    (0, express_validator_1.check)("fields.*.type").isIn([
        "String",
        "Number",
        "Date",
        "Boolean",
        "ObjectId",
    ]),
]), dynamicEntityController_1.dynamicEntityController.createEntity);
// Create record in dynamic entity
router.post("/:entityName/records", conditionalProtect, dynamicEntityController_1.dynamicEntityController.createRecord);
// Get records from dynamic entity
router.get("/:entityName/records", conditionalProtect, dynamicEntityController_1.dynamicEntityController.getRecords);
// Get all registered entities
router.get("/", conditionalProtect, simulateUser, dynamicEntityController_1.dynamicEntityController.getEntities);
exports.default = router;
