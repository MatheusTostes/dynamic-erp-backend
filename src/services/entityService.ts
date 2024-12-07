import { DynamicEntity } from "../models/DynamicEntity";
import { Entity, EntityResponse } from "../types/entityInterfaces";
import mongoose from "mongoose";

export class EntityService {
  public async getEntities(): Promise<EntityResponse> {
    const entities = await DynamicEntity.find({ deletedAt: null })
      .populate("group")
      .sort({ "group.order": 1, order: 1 });

    return {
      success: true,
      data: this.mapEntitiesToResponse(entities),
    };
  }

  public async createEntity(
    entity: Entity,
    userId?: string
  ): Promise<EntityResponse> {
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

    return {
      success: true,
      data: this.mapEntitiesToResponse(newEntity),
    };
  }

  public async deleteEntity(
    name: string
  ): Promise<{ success: boolean; message: string }> {
    await DynamicEntity.findOneAndUpdate(
      { name, deletedAt: null },
      { deletedAt: new Date() }
    );

    return {
      success: true,
      message: "Entity deleted successfully",
    };
  }

  public async updateEntity(
    name: string,
    entity: Entity
  ): Promise<EntityResponse> {
    const updatedEntity = await DynamicEntity.findOneAndUpdate(
      { name, deletedAt: null },
      { ...entity },
      { new: true }
    ).populate("group");

    if (!updatedEntity) {
      throw new Error("Entity not found");
    }

    return {
      success: true,
      data: this.mapEntitiesToResponse([updatedEntity]),
    };
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
