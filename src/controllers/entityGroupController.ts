import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Route,
  Tags,
  Response,
} from "tsoa";
import {
  CreateGroupResponse,
  EntityGroup,
  EntityGroupResponse,
  UniqueGroupResponse,
} from "../types/entityGroupInterfaces";
import { EntityGroupService } from "../services/entityGroupService";
import { errorHandler, successHandler } from "../libs/responseHandler";

@Route("entity-groups")
@Tags("Groups")
export class EntityGroupController extends Controller {
  private service: EntityGroupService;

  constructor() {
    super();
    this.service = new EntityGroupService();
  }

  @Get("/")
  @Response(200, "Success")
  public async getGroups(): Promise<EntityGroupResponse> {
    const groups = await this.service.findAll();
    return successHandler(groups);
  }

  @Post("/")
  @Response(201, "Created")
  @Response(409, "Entity group already exists")
  public async createGroup(
    @Body() body: EntityGroup
  ): Promise<CreateGroupResponse> {
    try {
      const group = await this.service.create(body);
      return successHandler(group);
    } catch (error) {
      this.setStatus(409);
      return errorHandler(error);
    }
  }

  @Put("/{groupId}")
  @Response(200, "Success")
  @Response(404, "Not Found")
  public async updateGroup(
    groupId: string,
    @Body() body: Partial<EntityGroup>
  ): Promise<CreateGroupResponse | UniqueGroupResponse> {
    const group = await this.service.update(groupId, body);
    if (!group) {
      this.setStatus(404);
      return errorHandler("Group not found");
    }
    return successHandler(group);
  }

  @Delete("/{groupId}")
  @Response(200, "Deleted")
  @Response(404, "Not Found")
  public async deleteGroup(groupId: string): Promise<UniqueGroupResponse> {
    const group = await this.service.delete(groupId);
    if (!group) {
      this.setStatus(404);
      return errorHandler("Group not found");
    }
    return successHandler(group);
  }
}
