import express from "express";
import entityManagementRoutes from "./entityManagementRoutes";
import recordManagementRoutes from "./recordManagementRoutes";
import entityGroupRoutes from "./entityGroupRoutes";

const router = express.Router();

// Mount routes
router.use("/entities", entityManagementRoutes);
router.use("/entities", recordManagementRoutes);
router.use("/entity-groups", entityGroupRoutes);

export default router;
