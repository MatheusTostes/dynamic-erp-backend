import { DynamicEntity } from "../models/DynamicEntity";
import {
  CreateEntityResponse,
  Entity,
  EntityResponse,
} from "../types/entityInterfaces";
import mongoose from "mongoose";

export class EntityService {
  public async findAll(): Promise<Entity[]> {
    const entities = await DynamicEntity.find({ deletedAt: null })
      .populate("group")
      .sort({ "group.order": 1, order: 1 });

    return this.mapEntitiesToResponse(entities);
  }

  public async createEntity(entity: Entity, userId?: string): Promise<Entity> {
    const existingEntity = await DynamicEntity.findOne({
      name: entity.name,
    });

    if (existingEntity) {
      if (existingEntity.deletedAt) {
        await DynamicEntity.deleteOne({ name: entity.name });
      } else {
        throw new Error(`Entity with name '${entity.name}' already exists`);
      }
    }

    const newEntity = await DynamicEntity.create(
      [
        {
          ...entity,
          group: new mongoose.Types.ObjectId(entity.group),
        },
      ],
      {
        context: {
          user: { _id: userId },
        },
      }
    );

    return this.mapEntitiesToResponse([newEntity[0]])[0];
  }

  public async deleteEntity(entityId: string): Promise<Entity> {
    const entity = await DynamicEntity.findOne({
      id: entityId,
      deletedAt: null,
    });
    if (!entity) {
      throw new Error("Entity not found");
    }

    await DynamicEntity.findOneAndUpdate(
      { entityId, deletedAt: null },
      { deletedAt: new Date() }
    );

    const EntityModel = mongoose.model(entityId);
    await EntityModel.deleteMany({});

    return this.mapEntitiesToResponse([entity])[0];
  }

  public async updateEntity(entityId: string, entity: Entity): Promise<Entity> {
    const updatedEntity = await DynamicEntity.findOneAndUpdate(
      { id: entityId, deletedAt: null },
      { ...entity },
      { new: true }
    ).populate("group");

    if (!updatedEntity) {
      throw new Error("Entity not found");
    }

    return this.mapEntitiesToResponse([updatedEntity])[0];
  }

  private mapEntitiesToResponse(entities: any[]): any[] {
    return entities.map((entity) => ({
      name: entity.name,
      displayName: entity.displayName,
      group: entity.group._id.toString(),
      fields: entity.fields.map((field: any) => ({
        name: field.name || "",
        type: field.type || "String",
        required: field.required || false,
        reference: field.reference || undefined,
      })),
    }));
  }
}
