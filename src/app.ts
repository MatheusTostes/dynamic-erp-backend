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
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);
app.use(helmet());
app.use(express.json());

// Connect to Database
connectDB();

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

app.get("/hello", (req, res) => {
  res.send("Hello World");
});

// Register TSOA Routes
RegisterRoutes(app);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown
const shutdown = () => {
  console.log('Received kill signal, shutting down gracefully');
  server.close(() => {
    console.log('Closed out remaining connections');
    process.exit(0);
  });

  // Force close after 10 seconds
  setTimeout(() => {
    console.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
