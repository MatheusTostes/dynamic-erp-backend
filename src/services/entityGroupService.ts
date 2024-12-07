import { EntityGroup as EntityGroupModel } from "../models/EntityGroup";
import { CreateGroupDTO, EntityGroup } from "../types/entityGroupInterfaces";

export class EntityGroupService {
  public async findAll(): Promise<EntityGroup[]> {
    const groups = await EntityGroupModel.find({ deletedAt: null });
    return groups.map((group) => ({
      id: group._id.toString(),
      name: group.name,
      displayName: group.displayName,
      order: group.order,
      createdAt: group.createdAt,
      updatedAt: group.updatedAt,
    }));
  }

  public async create(data: CreateGroupDTO): Promise<EntityGroup> {
    const group = await EntityGroupModel.create(data);
    return {
      id: group._id.toString(),
      name: group.name,
      displayName: group.displayName,
      order: group.order,
      createdAt: group.createdAt,
      updatedAt: group.updatedAt,
    };
  }
}
