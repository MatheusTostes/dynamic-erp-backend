import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import { connectDB } from "./config/database.js";
import userRoutes from "./routes/userRoutes";
import dynamicEntityRoutes from "./routes/dynamicEntityRoutes";
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
app.use("/api/entities", dynamicEntityRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
