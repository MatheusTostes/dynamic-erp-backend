"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userController = void 0;
const User_1 = require("../models/User");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const generateToken = (id) => {
    return jsonwebtoken_1.default.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: "30d",
    });
};
exports.userController = {
    // Register new user
    register: async (req, res) => {
        try {
            const { username, email, password } = req.body;
            const userExists = await User_1.User.findOne({ $or: [{ email }, { username }] });
            if (userExists) {
                res.status(400).json({
                    success: false,
                    message: "User already exists",
                });
                return;
            }
            const user = await User_1.User.create({
                username,
                email,
                password,
            });
            res.status(201).json({
                success: true,
                data: {
                    _id: user._id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    token: generateToken(user._id.toString()),
                },
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: "Server error",
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    },
    // Login user
    login: async (req, res) => {
        try {
            const { email, password } = req.body;
            const user = await User_1.User.findOne({ email });
            if (!user) {
                res.status(401).json({
                    success: false,
                    message: "Invalid credentials",
                });
                return;
            }
            const isMatch = await bcryptjs_1.default.compare(password, user.password);
            if (!isMatch) {
                res.status(401).json({
                    success: false,
                    message: "Invalid credentials",
                });
                return;
            }
            res.json({
                success: true,
                data: {
                    _id: user._id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    token: generateToken(user._id.toString()),
                },
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: "Server error",
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    },
};
