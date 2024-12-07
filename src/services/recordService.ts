import mongoose from "mongoose";
import { DynamicEntity, createDynamicModel } from "../models/DynamicEntity";
import {
  Record,
  RecordResponse,
  PaginatedResponse,
  QueryOptions,
} from "../types/recordInterfaces";

export class RecordService {
  private async getDynamicModel(entityName: string) {
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

    return { DynamicModel, entity };
  }

  public async createRecord(
    entityName: string,
    recordData: Record
  ): Promise<RecordResponse> {
    const { DynamicModel } = await this.getDynamicModel(entityName);
    const record = await DynamicModel.create(recordData);

    return {
      success: true,
      data: record,
    };
  }

  public async getRecords(
    entityName: string,
    options: QueryOptions
  ): Promise<PaginatedResponse> {
    const { DynamicModel, entity } = await this.getDynamicModel(entityName);

    if (options.referencedBy) {
      return this.getReferencedRecords(entityName, options.referencedBy);
    }

    // Convert query parameters to filters string if not provided
    if (!options.filters) {
      const queryParams: { [key: string]: any } = {};
      // Get all query parameters except pagination, sorting and referencedBy
      Object.entries(options).forEach(([key, value]) => {
        if (
          value !== undefined &&
          ![
            "paginationPage",
            "paginationSize",
            "sortBy",
            "sortOrder",
            "referencedBy",
            "filters",
          ].includes(key)
        ) {
          queryParams[key] = value;
        }
      });
      if (Object.keys(queryParams).length > 0) {
        options.filters = JSON.stringify(queryParams);
      }
    }

    const filter = await this.buildFilter(entity, options.filters);

    const sort = this.buildSort(options.sortBy, options.sortOrder);
    const { skip, limit } = this.getPaginationParams(options);

    const total = await DynamicModel.countDocuments(filter);
    const records = await DynamicModel.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    return this.buildPaginatedResponse(records, total, options);
  }

  public async updateRecord(
    entityName: string,
    recordId: string,
    recordData: Record
  ): Promise<RecordResponse> {
    const { DynamicModel } = await this.getDynamicModel(entityName);
    const record = await DynamicModel.findByIdAndUpdate(recordId, recordData, {
      new: true,
    });

    return {
      success: true,
      data: record,
    };
  }

  public async deleteRecord(
    entityName: string,
    recordId: string
  ): Promise<{ success: boolean; message: string }> {
    const { DynamicModel } = await this.getDynamicModel(entityName);
    await DynamicModel.findByIdAndDelete(recordId);

    return {
      success: true,
      message: "Record deleted successfully",
    };
  }

  private async getReferencedRecords(
    entityName: string,
    referencedBy: string
  ): Promise<PaginatedResponse> {
    const entity = await DynamicEntity.findOne({
      name: entityName,
      deletedAt: null,
    });

    if (!entity) {
      throw new Error("Entity not found");
    }

    const referencingEntity = await DynamicEntity.findOne({
      name: referencedBy,
      deletedAt: null,
      "fields.reference": entityName,
    });

    if (!referencingEntity) {
      throw new Error("Referencing entity not found");
    }

    const ReferencingModel = mongoose.model(referencedBy);
    const referenceField = referencingEntity.fields.find(
      (f) => f.reference === entityName
    );

    if (!referenceField) {
      throw new Error("Reference field not found");
    }

    const references = await ReferencingModel.find({
      [referenceField.name as string]: entity._id,
      deletedAt: null,
    });

    return {
      data: references.map((ref) => ({
        success: true,
        data: ref,
      })),
      pagination: {
        total: references.length,
        page: 1,
        pageSize: references.length,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    };
  }

  private async buildFilter(entity: any, filters?: string) {
    const filter: { [key: string]: any } = { deletedAt: null };

    if (!filters) {
      return filter;
    }

    try {
      // First try to parse as JSON
      const parsedFilters = JSON.parse(decodeURIComponent(filters));
      Object.entries(parsedFilters).forEach(([key, value]) => {
        const field = entity.fields.find((f: any) => f.name === key);
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
      // If JSON parsing fails, handle as query string parameters
      try {
        const queryParams = new URLSearchParams(filters);
        queryParams.forEach((value, key) => {
          const field = entity.fields.find((f: any) => f.name === key);
          if (field) {
            if (field.type === "String") {
              filter[key] = { $regex: value, $options: "i" };
            } else if (field.type === "Number") {
              filter[key] = Number(value);
            } else {
              filter[key] = value;
            }
          }
        });
      } catch (error) {
        console.error("Error parsing filters:", error);
      }
    }

    return filter;
  }

  private buildSort(sortBy?: string, sortOrder?: "asc" | "desc") {
    return sortBy
      ? ({ [sortBy]: sortOrder === "desc" ? -1 : 1 } as {
          [key: string]: 1 | -1;
        })
      : {};
  }

  private getPaginationParams(options: QueryOptions) {
    const page = options.paginationPage || 1;
    const limit = options.paginationSize || 10;
    const skip = (page - 1) * limit;
    return { skip, limit, page };
  }

  private buildPaginatedResponse(
    records: any[],
    total: number,
    options: QueryOptions
  ): PaginatedResponse {
    const page = options.paginationPage || 1;
    const pageSize = options.paginationSize || 10;
    const totalPages = Math.ceil(total / pageSize);

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
}
