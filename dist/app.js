"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
const database_js_1 = require("./config/database.js");
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const dynamicEntityRoutes_1 = __importDefault(require("./routes/dynamicEntityRoutes"));
dotenv_1.default.config();
console.log("app NODE_ENV:", process.env.NODE_ENV);
const app = (0, express_1.default)();
// Middleware
app.use((0, cors_1.default)({
    origin: ["http://localhost:3000", "http://localhost:5000"],
    credentials: true,
}));
app.use((0, helmet_1.default)());
app.use(express_1.default.json());
// Connect to Database
(0, database_js_1.connectDB)();
// Routes
app.use("/api/users", userRoutes_1.default);
app.use("/api/entities", dynamicEntityRoutes_1.default);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
