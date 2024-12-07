import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Path,
  Route,
  Tags,
  Response,
  Query,
  Request,
} from "tsoa";
import {
  Record,
  RecordResponse,
  PaginatedResponse,
} from "../types/recordInterfaces";
import { RecordService } from "../services/recordService";

@Route("entities/{entityName}/records")
@Tags("Records")
export class RecordController extends Controller {
  private recordService: RecordService;

  constructor() {
    super();
    this.recordService = new RecordService();
  }

  @Post("/")
  @Response<RecordResponse>(201, "Record created")
  public async createRecord(
    @Path() entityName: string,
    @Body() requestBody: Record
  ): Promise<RecordResponse> {
    return this.recordService.createRecord(entityName, requestBody);
  }

  @Get("/")
  @Response<PaginatedResponse>(200, "List all records")
  public async getRecords(
    @Path() entityName: string,
    @Request() request: any,
    @Query() paginationPage?: number,
    @Query() paginationSize?: number,
    @Query() sortBy?: string,
    @Query() sortOrder?: "asc" | "desc",
    @Query() filters?: string,
    @Query() referencedBy?: string
  ): Promise<PaginatedResponse> {
    return this.recordService.getRecords(entityName, {
      ...request.query,
      paginationPage,
      paginationSize,
      sortBy,
      sortOrder,
      filters,
      referencedBy,
    });
  }

  @Put("/{recordId}")
  @Response<RecordResponse>(200, "Record updated")
  public async updateRecord(
    @Path() entityName: string,
    @Path() recordId: string,
    @Body() requestBody: Record
  ): Promise<RecordResponse> {
    return this.recordService.updateRecord(entityName, recordId, requestBody);
  }

  @Delete("/{recordId}")
  @Response<{ success: boolean; message: string }>(200, "Record deleted")
  public async deleteRecord(
    @Path() entityName: string,
    @Path() recordId: string
  ): Promise<{ success: boolean; message: string }> {
    return this.recordService.deleteRecord(entityName, recordId);
  }
}
