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
  CreateRecordResponse,
  UniqueRecordResponse,
  PaginatedRecordResponse,
} from "../types/recordInterfaces";
import { RecordService } from "../services/recordService";
import { errorHandler, successHandler } from "../libs/responseHandler";

@Route("entities/{entityName}/records")
@Tags("Records")
export class RecordController extends Controller {
  private recordService: RecordService;

  constructor() {
    super();
    this.recordService = new RecordService();
  }

  @Get("/")
  @Response(200, "Success")
  public async getRecords(
    @Path() entityName: string,
    @Request() request: any,
    @Query() paginationPage?: number,
    @Query() paginationSize?: number,
    @Query() sortBy?: string,
    @Query() sortOrder?: "asc" | "desc",
    @Query() filters?: string,
    @Query() referencedBy?: string
  ): Promise<PaginatedRecordResponse> {
    const { data, pagination } = await this.recordService.getRecords(
      entityName,
      {
        ...request.query,
        paginationPage,
        paginationSize,
        sortBy,
        sortOrder,
        filters,
        referencedBy,
      }
    );
    return successHandler(data, pagination);
  }

  @Post("/")
  @Response(201, "Created")
  @Response(409, "Record already exists")
  public async createRecord(
    @Path() entityName: string,
    @Body() requestBody: Record
  ): Promise<CreateRecordResponse> {
    try {
      const record = await this.recordService.createRecord(
        entityName,
        requestBody
      );
      return successHandler(record);
    } catch (error) {
      this.setStatus(409);
      return errorHandler(error);
    }
  }

  @Put("/{recordId}")
  @Response(200, "Updated")
  @Response(404, "Record not found")
  public async updateRecord(
    @Path() entityName: string,
    @Path() recordId: string,
    @Body() requestBody: Record
  ): Promise<UniqueRecordResponse> {
    const record = await this.recordService.updateRecord(
      entityName,
      recordId,
      requestBody
    );
    if (!record) {
      this.setStatus(404);
      return errorHandler("Record not found");
    }
    return successHandler(record);
  }

  @Delete("/{recordId}")
  @Response(200, "Deleted")
  @Response(404, "Not Found")
  public async deleteRecord(
    @Path() entityName: string,
    @Path() recordId: string
  ): Promise<UniqueRecordResponse> {
    const record = await this.recordService.deleteRecord(entityName, recordId);
    if (!record) {
      this.setStatus(404);
      return errorHandler("Record not found");
    }
    return successHandler(record);
  }
}
