import { Controller, Get, Post, Body, Route, Tags, Response } from "tsoa";
import {
  CreateGroupDTO,
  EntityGroupResponse,
} from "../types/entityGroupInterfaces";
import { EntityGroupService } from "../services/entityGroupService";

@Route("entity-groups")
@Tags("Groups")
export class EntityGroupController extends Controller {
  private service: EntityGroupService;

  constructor() {
    super();
    this.service = new EntityGroupService();
  }

  @Get("/")
  @Response<EntityGroupResponse>(200, "Success")
  public async getGroups(): Promise<EntityGroupResponse> {
    const groups = await this.service.findAll();
    return {
      success: true,
      data: groups[0],
    };
  }

  @Post()
  @Response<EntityGroupResponse>(201, "Created")
  public async createGroup(
    @Body() body: CreateGroupDTO
  ): Promise<EntityGroupResponse> {
    const group = await this.service.create(body);
    return {
      success: true,
      data: group,
    };
  }
}
