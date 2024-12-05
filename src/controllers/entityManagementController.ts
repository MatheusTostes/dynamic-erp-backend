import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Route,
  Tags,
  Response,
  Path,
  Put,
} from "tsoa";
import { Request, Response as ExpressResponse } from "express";
import { DynamicEntity } from "../models/DynamicEntity";

interface EntityField {
  name: string;
  type: "String" | "Number" | "Date" | "Boolean" | "ObjectId";
  required: boolean;
  reference?: string;
}

interface EntityResponse {
  success: boolean;
  data: {
    name: string;
    displayName: string;
    group: string;
    fields: EntityField[];
  }[];
}

interface AuthRequest extends Request {
  user?: {
    _id: string;
    [key: string]: any;
  };
}

interface Entity {
  name: string;
  displayName: string;
  group: string;
  order?: number;
  fields: EntityField[];
  createdBy?: string;
}

@Route("entities")
@Tags("Entities")
export class EntityManagementController extends Controller {
  @Get("/")
  @Response<EntityResponse>(200, "Success")
  public async getEntities(): Promise<EntityResponse> {
    const entities = await DynamicEntity.find({ deletedAt: null })
      .populate("group")
      .sort({ "group.order": 1, order: 1 });

    return {
      success: true,
      data: entities.map((entity) => ({
        name: entity.name,
        displayName: entity.displayName,
        group: entity.group._id.toString(),
        fields: entity.fields.map((field) => ({
          name: field.name || "",
          type: field.type || "String",
          required: field.required || false,
          reference: field.reference || undefined,
        })),
      })),
    };
  }

  @Post("/")
  @Response<EntityResponse>(201, "Created")
  public async createEntity(
    @Body() requestBody: Entity
  ): Promise<EntityResponse> {
    const entity = await DynamicEntity.create({
      ...requestBody,
      createdBy: requestBody.createdBy,
    });

    return {
      success: true,
      data: [
        {
          name: entity.name,
          displayName: entity.displayName,
          group: entity.group._id.toString(),
          fields: entity.fields.map((field) => ({
            name: field.name || "",
            type: field.type || "String",
            required: field.required || false,
            reference: field.reference || undefined,
          })),
        },
      ],
    };
  }

  @Delete("/{name}")
  @Response<{ success: boolean; message: string }>(200, "Deleted")
  public async deleteEntity(
    @Path() name: string
  ): Promise<{ success: boolean; message: string }> {
    const entity = await DynamicEntity.findOneAndUpdate(
      { name, deletedAt: null },
      { deletedAt: new Date() }
    );

    return {
      success: true,
      message: "Entity deleted successfully",
    };
  }

  @Put("/{name}")
  @Response<EntityResponse>(200, "Updated")
  public async updateEntity(
    @Path() name: string,
    @Body() requestBody: Entity
  ): Promise<EntityResponse> {
    const entity = await DynamicEntity.findOneAndUpdate(
      { name, deletedAt: null },
      { ...requestBody },
      { new: true }
    ).populate("group");

    return {
      success: true,
      data: [
        {
          name: entity?.name || "",
          displayName: entity?.displayName || "",
          group: entity?.group?._id.toString() || "",
          fields:
            entity?.fields?.map((field) => ({
              name: field.name || "",
              type: field.type || "String",
              required: field.required || false,
              reference: field.reference || undefined,
            })) || [],
        },
      ],
    };
  }
}

// Implementação real para as rotas Express
export const entityManagementController = {
  getEntities: async (req: Request, res: ExpressResponse): Promise<void> => {
    try {
      const controller = new EntityManagementController();
      const response = await controller.getEntities();
      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error fetching entities",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  createEntity: async (
    req: AuthRequest,
    res: ExpressResponse
  ): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
        return;
      }

      const controller = new EntityManagementController();
      const response = await controller.createEntity({
        ...req.body,
        createdBy: req.user._id,
      });
      res.status(201).json(response);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  deleteEntity: async (
    req: AuthRequest,
    res: ExpressResponse
  ): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
        return;
      }

      const controller = new EntityManagementController();
      const response = await controller.deleteEntity(req.params.name);
      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  updateEntity: async (
    req: AuthRequest,
    res: ExpressResponse
  ): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
        return;
      }

      const controller = new EntityManagementController();
      const response = await controller.updateEntity(req.params.name, req.body);
      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
};
