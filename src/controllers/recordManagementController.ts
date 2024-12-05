import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Path,
  Route,
  Tags,
  Response,
  Query,
  Request,
} from "tsoa";
import {
  Request as ExpressRequest,
  Response as ExpressResponse,
} from "express";
import { DynamicEntity, createDynamicModel } from "../models/DynamicEntity";
import mongoose from "mongoose";

interface Record {
  [key: string]: any;
}

interface RecordResponse {
  success: boolean;
  data: Record;
}

// Adicionar nova interface para resposta paginada
interface PaginatedResponse {
  data: RecordResponse[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

@Route("entities/{entityName}/records")
@Tags("Records")
export class RecordManagementController extends Controller {
  @Request() request!: ExpressRequest;

  @Post("/")
  @Response<RecordResponse>(201, "Record created")
  public async createRecord(
    @Path() entityName: string,
    @Body() requestBody: Record
  ): Promise<RecordResponse> {
    const entity = await DynamicEntity.findOne({
      name: entityName,
      deletedAt: null,
    });

    if (!entity) {
      throw new Error("Entity not found");
    }

    // Criar/recuperar o modelo dinâmico
    let DynamicModel;
    try {
      DynamicModel = mongoose.model(entityName);
    } catch {
      // Se o modelo não existir, cria-o
      DynamicModel = createDynamicModel(entity);
    }

    const record = await DynamicModel.create(requestBody);

    return {
      success: true,
      data: record,
    };
  }

  @Get("/")
  @Response<PaginatedResponse>(200, "List all records")
  public async getRecords(
    @Path() entityName: string,
    @Query() paginationPage?: number,
    @Query() paginationSize?: number,
    @Query() sortBy?: string,
    @Query() sortOrder?: "asc" | "desc",
    @Query() filters?: string
  ): Promise<PaginatedResponse> {
    const entity = await DynamicEntity.findOne({
      name: entityName,
      deletedAt: null,
    });

    if (!entity) {
      throw new Error("Entity not found");
    }

    let DynamicModel;
    try {
      DynamicModel = mongoose.model(entityName);
    } catch {
      DynamicModel = createDynamicModel(entity);
    }

    const filter: { [key: string]: any } = { deletedAt: null };

    // Parse os filtros da query string
    if (filters) {
      try {
        const parsedFilters = JSON.parse(decodeURIComponent(filters));
        Object.entries(parsedFilters).forEach(([key, value]) => {
          const field = entity.fields.find((f) => f.name === key);
          if (field) {
            if (Array.isArray(value) && value.length === 2) {
              const [min, max] = value.map((v) =>
                field.type === "Number" ? Number(v) : v
              );
              filter[key] = { $gte: min, $lt: max };
            } else {
              if (field.type === "String") {
                filter[key] = { $regex: value as string, $options: "i" };
              } else {
                filter[key] = field.type === "Number" ? Number(value) : value;
              }
            }
          }
        });
      } catch (error) {
        const queryParams = { ...this.request.query };
        delete queryParams.paginationPage;
        delete queryParams.paginationSize;
        delete queryParams.sortBy;
        delete queryParams.sortOrder;

        Object.entries(queryParams).forEach(([key, value]) => {
          const field = entity.fields.find((f) => f.name === key);
          if (field) {
            if (Array.isArray(value)) {
              const [min, max] = value.map((v) =>
                field.type === "Number" ? Number(v as string) : v
              );
              if (!isNaN(min as number) && !isNaN(max as number)) {
                filter[key] = { $gte: min, $lte: max };
              }
            }
          }
        });
      }
    }

    const sort = sortBy
      ? ({ [sortBy]: sortOrder === "desc" ? -1 : 1 } as {
          [key: string]: 1 | -1;
        })
      : {};
    const page = paginationPage || 1;
    const pageSize = paginationSize || 10;
    const skip = (page - 1) * pageSize;

    // Buscar total de registros
    const total = await DynamicModel.countDocuments(filter);
    const totalPages = Math.ceil(total / pageSize);

    const records = await DynamicModel.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(pageSize);

    return {
      data: records.map((record) => ({
        success: true,
        data: record,
      })),
      pagination: {
        total,
        page,
        pageSize,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  @Put("/{recordId}")
  @Response<RecordResponse>(200, "Record updated")
  public async updateRecord(
    @Path() entityName: string,
    @Path() recordId: string,
    @Body() requestBody: Record
  ): Promise<RecordResponse> {
    const DynamicModel = mongoose.model(entityName);
    const record = await DynamicModel.findByIdAndUpdate(recordId, requestBody, {
      new: true,
    });

    return {
      success: true,
      data: record,
    };
  }

  @Delete("/{recordId}")
  @Response<{ success: boolean; message: string }>(200, "Record deleted")
  public async deleteRecord(
    @Path() entityName: string,
    @Path() recordId: string
  ): Promise<{ success: boolean; message: string }> {
    const DynamicModel = mongoose.model(entityName);
    await DynamicModel.findByIdAndDelete(recordId);

    return {
      success: true,
      message: "Record deleted successfully",
    };
  }
}

// Implementação Express
export const recordManagementController = {
  createRecord: async (
    req: ExpressRequest,
    res: ExpressResponse
  ): Promise<void> => {
    try {
      const controller = new RecordManagementController();
      const response = await controller.createRecord(
        req.params.entityName,
        req.body
      );
      res.status(201).json(response);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  getRecords: async (
    req: ExpressRequest,
    res: ExpressResponse
  ): Promise<void> => {
    try {
      const controller = new RecordManagementController();
      controller.request = req;

      // Mapear os parâmetros de paginação corretamente
      const {
        paginationPage,
        paginationSize,
        sortBy,
        sortOrder,
        ...queryFilters
      } = req.query;

      const response = await controller.getRecords(
        req.params.entityName,
        Number(paginationPage), // Alterado de page para paginationPage
        Number(paginationSize), // Alterado de limit para paginationSize
        sortBy as string,
        sortOrder as "asc" | "desc",
        Object.keys(queryFilters).length > 0
          ? JSON.stringify(queryFilters)
          : undefined
      );
      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error fetching records",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  updateRecord: async (
    req: ExpressRequest,
    res: ExpressResponse
  ): Promise<void> => {
    try {
      const controller = new RecordManagementController();
      const response = await controller.updateRecord(
        req.params.entityName,
        req.params.recordId,
        req.body
      );
      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  deleteRecord: async (
    req: ExpressRequest,
    res: ExpressResponse
  ): Promise<void> => {
    try {
      const controller = new RecordManagementController();
      const response = await controller.deleteRecord(
        req.params.entityName,
        req.params.recordId
      );
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
