import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import { connectDB } from "./config/database.js";
import { RegisterRoutes } from "./routes/routes";
import swaggerUi from "swagger-ui-express";
import { swaggerOptions, configureSwaggerDocument } from "./config/swagger";

dotenv.config();

console.log("app NODE_ENV:", process.env.NODE_ENV);

const app = express();

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

// Endpoint to expose TypeScript interfaces
app.get("/api/types", (_, res) => {
  res.json(swaggerDocument.components.schemas);
});

// Register TSOA Routes
RegisterRoutes(app);

// Import swagger.json
import swaggerDocument from "../public/swagger.json";

// Configure swagger.json
const configuredSwaggerDocument = configureSwaggerDocument(swaggerDocument);

// Configure API documentation route
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(configuredSwaggerDocument, swaggerOptions)
);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
