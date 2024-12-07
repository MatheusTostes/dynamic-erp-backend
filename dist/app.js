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
const routes_1 = require("./routes/routes");
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_1 = require("./config/swagger");
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
// Register TSOA Routes
(0, routes_1.RegisterRoutes)(app);
// Importa o arquivo de especificação gerado pelo tsoa
const swagger_json_1 = __importDefault(require("../public/swagger.json"));
// Configura o documento do swagger
const configuredSwaggerDocument = (0, swagger_1.configureSwaggerDocument)(swagger_json_1.default);
// Configura a rota para a documentação
app.use("/api-docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(configuredSwaggerDocument, swagger_1.swaggerOptions));
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
