import mongoose from "mongoose";
import { protect, isAdmin } from "./authMiddleware";

console.log("Current NODE_ENV:", process.env.NODE_ENV);
console.log("Is Development?:", process.env.NODE_ENV === "development");

export const conditionalProtect = (req: any, res: any, next: any) => {
  console.log("conditionalProtect called, NODE_ENV:", process.env.NODE_ENV);
  if (process.env.NODE_ENV === "development") {
    console.log("Bypassing protection in development");
    return next();
  }
  return protect(req, res, next);
};

export const conditionalIsAdmin = (req: any, res: any, next: any) => {
  console.log("conditionalIsAdmin called, NODE_ENV:", process.env.NODE_ENV);
  if (process.env.NODE_ENV === "development") {
    console.log("Bypassing admin check in development");
    return next();
  }
  return isAdmin(req, res, next);
};

export const simulateUser = (req: any, res: any, next: any) => {
  if (process.env.NODE_ENV === "development") {
    req.user = {
      _id: new mongoose.Types.ObjectId(),
      name: "Dev User",
      email: "dev@example.com",
      role: "admin",
    };
  }
  next();
};
