import { Request, Response } from "express";
import { DynamicEntity, createDynamicModel } from "../models/DynamicEntity";
import mongoose from "mongoose";

interface AuthRequest extends Request {
  user?: any;
}

export const dynamicEntityController = {
  // Create new entity definition
  createEntity: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { name, fields } = req.body;

      const entityExists = await DynamicEntity.findOne({ name });
      if (entityExists) {
        res.status(400).json({
          success: false,
          message: "Entity already exists",
        });
        return;
      }

      const entity = await DynamicEntity.create({
        name,
        fields,
        createdBy: req.user._id,
      });

      createDynamicModel(entity);

      res.status(201).json({
        success: true,
        data: entity,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  // Create record in dynamic entity
  createRecord: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { entityName } = req.params;
      const data = req.body;

      const entityDefinition = await DynamicEntity.findOne({
        name: entityName,
      });
      if (!entityDefinition) {
        res.status(404).json({
          success: false,
          message: "Entity not found",
        });
        return;
      }

      // Criar/recuperar o modelo dinâmico
      let DynamicModel;
      try {
        DynamicModel = mongoose.model(entityName);
      } catch {
        // Se o modelo não existir, cria-o
        DynamicModel = createDynamicModel(entityDefinition);
      }

      const record = await DynamicModel.create(data);

      res.status(201).json({
        success: true,
        data: record,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  // Get all records from dynamic entity
  getRecords: async (req: Request, res: Response): Promise<void> => {
    try {
      const { entityName } = req.params;
      const { paginationPage, paginationSize, ...filters } = req.query;

      // Configuração da paginação com valores padrão
      const page = Number(paginationPage) || 1;
      const limit = Number(paginationSize) || 10;

      const entityDefinition = await DynamicEntity.findOne({
        name: entityName,
      });
      if (!entityDefinition) {
        res.status(404).json({
          success: false,
          message: "Entity not found",
        });
        return;
      }

      let DynamicModel;
      try {
        DynamicModel = mongoose.model(entityName);
      } catch {
        DynamicModel = createDynamicModel(entityDefinition);
      }

      // Construir query dinâmica para filtros
      const queryFilters: any = {};
      entityDefinition.fields.forEach((field: any) => {
        const values = filters[field.name];
        if (values !== undefined) {
          if (field.type === "String") {
            queryFilters[field.name] = { $regex: values, $options: "i" };
          } else if (field.type === "Number") {
            if (Array.isArray(values)) {
              const [min, max] = values.map(Number);
              queryFilters[field.name] = { $gte: min, $lte: max };
            } else {
              queryFilters[field.name] = Number(values);
            }
          } else {
            queryFilters[field.name] = values;
          }
        }
      });

      const records = await DynamicModel.find(queryFilters)
        .limit(Number(limit))
        .skip((Number(page) - 1) * Number(limit));

      const total = await DynamicModel.countDocuments(queryFilters);

      res.json({
        success: true,
        data: records,
        pagination: {
          currentPage: page,
          pageSize: limit,
          totalRecords: total,
          totalPages: Math.ceil(total / limit),
          hasNextPage: page * limit < total,
          hasPreviousPage: page > 1,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  getEntities: async (req: Request, res: Response) => {
    try {
      const entities = await DynamicEntity.find().select("name fields");

      res.status(200).json({
        success: true,
        data: entities.map((entity) => ({
          name: entity.name,
          fields: entity.fields,
          endpoints: {
            create: `/api/entities/${entity.name}/records`,
            list: `/api/entities/${entity.name}/records`,
          },
        })),
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error fetching entities",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
};
