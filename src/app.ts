import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import { connectDB } from "./config/database.js";
import userRoutes from "./routes/userRoutes";
import entityRoutes from "./routes/entityManagementRoutes";
import recordRoutes from "./routes/recordManagementRoutes";
import entityGroupRoutes from "./routes/entityGroupRoutes";
import swaggerUi from "swagger-ui-express";

dotenv.config();

console.log("app NODE_ENV:", process.env.NODE_ENV);

const app = express();

// Middleware
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:5000"],
    credentials: true,
  })
);
app.use(helmet());
app.use(express.json());

// Connect to Database
connectDB();

// Routes
app.use("/api/users", userRoutes);
app.use("/api/entities", entityRoutes);
app.use("/api/entities", recordRoutes);
app.use("/api/entity-groups", entityGroupRoutes);

// Importa o arquivo de especificação gerado pelo tsoa
import swaggerDocument from "../public/swagger.json";

// Configura a rota para a documentação
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
