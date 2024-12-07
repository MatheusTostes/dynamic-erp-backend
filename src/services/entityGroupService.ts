import { EntityGroup as EntityGroupModel } from "../models/EntityGroup";
import { EntityGroup } from "../types/entityGroupInterfaces";

export class EntityGroupService {
  public async findAll(): Promise<EntityGroup[]> {
    const groups = await EntityGroupModel.find({ deletedAt: null });
    return groups;
  }

  public async create(
    data: EntityGroup,
    userId?: string
  ): Promise<EntityGroup> {
    const group = await EntityGroupModel.create([data], {
      context: userId || undefined,
    });
    return group[0];
  }

  public async findById(id: string): Promise<EntityGroup | null> {
    const group = await EntityGroupModel.findOne({ _id: id, deletedAt: null });
    return group;
  }

  public async update(
    groupId: string,
    data: Partial<EntityGroup>,
    userId?: string
  ): Promise<EntityGroup | null> {
    const group = await EntityGroupModel.findOneAndUpdate(
      { _id: groupId, deletedAt: null },
      { $set: data },
      {
        new: true,
        context: userId || undefined,
      }
    );
    return group;
  }

  public async delete(
    groupId: string,
    userId?: string
  ): Promise<EntityGroup | null> {
    const group = await EntityGroupModel.findOneAndUpdate(
      { _id: groupId, deletedAt: null },
      { $set: { deletedAt: new Date() } },
      {
        new: true,
        context: userId || undefined,
      }
    );
    return group;
  }
}
