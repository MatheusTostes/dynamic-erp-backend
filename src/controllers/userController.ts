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
  Path,
} from "tsoa";
import { UserService } from "../services/userService";
import {
  CreateUserResponse,
  PaginatedUserResponse,
  UniqueUserResponse,
  User,
} from "../types/userInterfaces";
import { errorHandler, successHandler } from "../libs/responseHandler";

@Route("users")
@Tags("Users")
export class UserController extends Controller {
  private userService: UserService;

  constructor() {
    super();
    this.userService = new UserService();
  }

  @Get("/")
  @Response(200, "Success")
  public async getAllUsers(): Promise<PaginatedUserResponse> {
    const { data, pagination } = await this.userService.getAllUsers();
    return successHandler(data, pagination);
  }

  @Get("/{userId}")
  @Response(200, "Success")
  @Response(404, "Not Found")
  public async getUserById(
    @Path() userId: string
  ): Promise<UniqueUserResponse> {
    const user = await this.userService.getUserById(userId);
    if (!user) {
      this.setStatus(404);
      return errorHandler(new Error("User not found"));
    }
    return successHandler(user);
  }

  @Post("/")
  @Response(201, "Created")
  @Response(409, "User already exists")
  public async createUser(@Body() userData: User): Promise<CreateUserResponse> {
    try {
      const user = await this.userService.createUser(userData);
      return successHandler(user);
    } catch (error) {
      this.setStatus(409);
      return errorHandler(error);
    }
  }

  @Put("/{userId}")
  @Response(200, "Success")
  @Response(404, "Not Found")
  public async updateUser(
    @Path() userId: string,
    @Body() userData: User
  ): Promise<UniqueUserResponse> {
    const user = await this.userService.updateUser(userId, userData);
    if (!user) {
      this.setStatus(404);
      return errorHandler(new Error("User not found"));
    }
    return successHandler(user);
  }

  @Delete("/{userId}")
  @Response(200, "Deleted")
  @Response(404, "Not Found")
  public async deleteUser(@Path() userId: string): Promise<UniqueUserResponse> {
    const user = await this.userService.deleteUser(userId);
    if (!user) {
      this.setStatus(404);
      return errorHandler(new Error("User not found"));
    }
    return successHandler(user);
  }
}
