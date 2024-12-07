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
import {
  CreateEntityResponse,
  Entity,
  EntityResponse,
  UniqueEntityResponse,
} from "../types/entityInterfaces";
import { errorHandler, successHandler } from "../libs/responseHandler";

@Route("entities")
@Tags("Entities")
export class EntityController extends Controller {
  private entityService: EntityService;

  constructor() {
    super();
    this.entityService = new EntityService();
  }

  @Get("/")
  @Response(200, "Success")
  public async getEntities(): Promise<EntityResponse> {
    const entities = await this.entityService.findAll();
    return successHandler(entities);
  }

  @Post("/")
  @Response(201, "Created")
  @Response(409, "Entity already exists")
  public async createEntity(
    @Body() body: Entity
  ): Promise<CreateEntityResponse> {
    try {
      const entity = await this.entityService.createEntity(body);
      return successHandler(entity);
    } catch (error) {
      this.setStatus(409);
      return errorHandler(error);
    }
  }

  @Put("/{entityId}")
  @Response(200, "Updated")
  @Response(404, "Not Found")
  public async updateEntity(
    entityId: string,
    @Body() body: Entity
  ): Promise<UniqueEntityResponse> {
    const entity = await this.entityService.updateEntity(entityId, body);
    if (!entity) {
      this.setStatus(404);
      return errorHandler("Entity not found");
    }
    return successHandler(entity);
  }

  @Delete("/{entityId}")
  @Response(200, "Deleted")
  @Response(404, "Not Found")
  public async deleteEntity(entityId: string): Promise<UniqueEntityResponse> {
    const entity = await this.entityService.deleteEntity(entityId);
    if (!entity) {
      this.setStatus(404);
      return errorHandler("Entity not found");
    }
    return successHandler(entity);
  }
}
