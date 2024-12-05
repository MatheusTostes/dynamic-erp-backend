import express from "express";
import { recordManagementController } from "../controllers/recordManagementController";
import { conditionalProtect } from "../middleware/developmentMiddleware";

const router = express.Router();

// Create record in dynamic entity
router.post(
  "/:entityName/records",
  conditionalProtect,
  recordManagementController.createRecord
);

// Get records from dynamic entity
router.get(
  "/:entityName/records",
  conditionalProtect,
  recordManagementController.getRecords
);

// Update record in dynamic entity
router.put(
  "/:entityName/records/:recordId",
  conditionalProtect,
  recordManagementController.updateRecord
);

// Delete record from dynamic entity
router.delete(
  "/:entityName/records/:recordId",
  conditionalProtect,
  recordManagementController.deleteRecord
);

export default router;
