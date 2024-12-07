import mongoose from "mongoose";
import { DynamicEntity, createDynamicModel } from "../models/DynamicEntity";
import {
  Record,
  QueryOptions,
  PaginatedRecordResponse,
} from "../types/recordInterfaces";
import { Entity } from "../types/entityInterfaces";

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
  ): Promise<Record> {
    const { DynamicModel } = await this.getDynamicModel(entityName);
    const record = await DynamicModel.create(recordData);

    return record;
  }

  public async getRecords(
    entityName: string,
    options: QueryOptions
  ): Promise<PaginatedRecordResponse> {
    const { DynamicModel, entity } = await this.getDynamicModel(entityName);
    const page = options.paginationPage || 1;
    const pageSize = options.paginationSize || 10;
    const skip = (page - 1) * pageSize;

    if (options.referencedBy) {
      return this.getReferencedRecords(entityName, options.referencedBy);
    }

    if (!options.filters) {
      const queryParams: { [key: string]: any } = {};
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

    const filter = await this.buildFilter(
      this.mapEntityToResponse(entity),
      options.filters
    );

    const sort = this.buildSort(options.sortBy, options.sortOrder);

    const [records, total] = await Promise.all([
      DynamicModel.find(filter).sort(sort).skip(skip).limit(pageSize),
      DynamicModel.countDocuments(filter),
    ]);

    return {
      data: records,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
        hasNextPage: page * pageSize < total,
        hasPreviousPage: page > 1,
      },
    };
  }

  public async updateRecord(
    entityName: string,
    recordId: string,
    recordData: Record
  ): Promise<Record> {
    const { DynamicModel } = await this.getDynamicModel(entityName);
    const record = await DynamicModel.findByIdAndUpdate(recordId, recordData, {
      new: true,
    });

    return record;
  }

  public async deleteRecord(
    entityName: string,
    recordId: string
  ): Promise<Record> {
    const { DynamicModel } = await this.getDynamicModel(entityName);
    const record = await DynamicModel.findByIdAndDelete(recordId);

    return record;
  }

  private async getReferencedRecords(
    entityName: string,
    referencedBy: string
  ): Promise<PaginatedRecordResponse> {
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
      data: references,
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

  private async buildFilter(entity: Entity, filters?: string) {
    const filter: { [key: string]: unknown } = { deletedAt: null };

    if (!filters) {
      return filter;
    }

    try {
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

  private mapEntityToResponse(entity: any): Entity {
    return {
      ...entity.toObject(),
      id: entity._id.toString(),
      group: entity.group.toString(),
    };
  }
}
