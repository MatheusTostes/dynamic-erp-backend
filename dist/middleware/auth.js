"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAdmin = exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
const protect = async (req, res, next) => {
    try {
        let token;
        if (req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer")) {
            token = req.headers.authorization.split(" ")[1];
        }
        if (!token) {
            res.status(401).json({
                success: false,
                message: "Not authorized to access this route",
            });
            return;
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        req.user = await User_1.User.findById(decoded.id).select("-password");
        next();
    }
    catch (error) {
        res.status(401).json({
            success: false,
            message: "Not authorized to access this route",
        });
        return;
    }
};
exports.protect = protect;
// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === "admin") {
        next();
        return;
    }
    res.status(403).json({
        success: false,
        message: "Access denied: Admin rights required",
    });
    return;
};
exports.isAdmin = isAdmin;
