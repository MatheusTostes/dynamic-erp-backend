import { Controller, Get, Post, Body, Route, Tags, Response } from "tsoa";
import { EntityGroup as EntityGroupModel } from "../models/EntityGroup";
import { Request, Response as ExpressResponse } from "express";

interface EntityGroup {
  id?: string;
  name: string;
  displayName: string;
  order?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface EntityGroupResponse {
  success: boolean;
  data: EntityGroup;
}

interface CreateGroupDTO {
  name: string;
  displayName: string;
  order?: number;
}

interface AuthRequest extends Request {
  user?: {
    _id: string;
    [key: string]: any;
  };
}

@Route("entity-groups")
@Tags("Groups")
export class EntityGroupController extends Controller {
  @Get("/")
  @Response<EntityGroupResponse>(200, "Success")
  public async getGroups(): Promise<EntityGroupResponse> {
    const groups = await EntityGroupModel.find({ deletedAt: null });
    return {
      success: true,
      data: groups.map((group) => ({
        id: group._id.toString(),
        name: group.name,
        displayName: group.displayName,
        order: group.order,
        createdAt: group.createdAt,
        updatedAt: group.updatedAt,
      })) as unknown as EntityGroup,
    };
  }

  @Post()
  @Response<EntityGroupResponse>(201, "Created")
  public async createGroup(
    @Body() body: CreateGroupDTO
  ): Promise<EntityGroupResponse> {
    const group = await EntityGroupModel.create(body);
    return {
      success: true,
      data: {
        id: group._id.toString(),
        name: group.name,
        displayName: group.displayName,
        order: group.order,
        createdAt: group.createdAt,
        updatedAt: group.updatedAt,
      },
    };
  }
}

// Implementação Express
export const entityGroupController = {
  createGroup: async (
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

      const controller = new EntityGroupController();
      const response = await controller.createGroup({
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

  getGroups: async (req: Request, res: ExpressResponse): Promise<void> => {
    try {
      const controller = new EntityGroupController();
      const response = await controller.getGroups();
      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error fetching groups",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
};
