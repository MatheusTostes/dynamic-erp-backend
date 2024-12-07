import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Route,
  Tags,
  Response,
  Path,
  Put,
} from "tsoa";
import { EntityService } from "../services/entityService";
import { Entity, EntityResponse } from "../types/entityInterfaces";

@Route("entities")
@Tags("Entities")
export class EntityController extends Controller {
  private entityService: EntityService;

  constructor() {
    super();
    this.entityService = new EntityService();
  }

  @Get("/")
  @Response<EntityResponse>(200, "Success")
  public async getEntities(): Promise<EntityResponse> {
    return this.entityService.getEntities();
  }

  @Post("/")
  @Response<EntityResponse>(201, "Created")
  @Response(409, "Entity already exists")
  public async createEntity(
    @Body() requestBody: Entity
  ): Promise<EntityResponse> {
    try {
      return await this.entityService.createEntity(requestBody);
    } catch (error) {
      if (error instanceof Error && error.message.includes("already exists")) {
        this.setStatus(409);
        return {
          success: false,
          data: [],
          message: error.message,
        };
      }
      throw error;
    }
  }

  @Delete("/{name}")
  @Response<{ success: boolean; message: string }>(200, "Deleted")
  public async deleteEntity(
    @Path() name: string
  ): Promise<{ success: boolean; message: string }> {
    return this.entityService.deleteEntity(name);
  }

  @Put("/{name}")
  @Response<EntityResponse>(200, "Updated")
  public async updateEntity(
    @Path() name: string,
    @Body() requestBody: Entity
  ): Promise<EntityResponse> {
    return this.entityService.updateEntity(name, requestBody);
  }
}
