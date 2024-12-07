import { Request } from "express";

export interface EntityField {
  name: string;
  type: "String" | "Number" | "Date" | "Boolean" | "ObjectId";
  required: boolean;
  reference?: string;
}

export interface EntityResponse {
  success: boolean;
  data: {
    name: string;
    displayName: string;
    group: string;
    fields: EntityField[];
  }[];
}

export interface AuthRequest extends Request {
  user?: {
    _id: string;
    [key: string]: any;
  };
}

export interface Entity {
  name: string;
  displayName: string;
  group: string;
  order?: number;
  fields: EntityField[];
  createdBy?: string;
}
