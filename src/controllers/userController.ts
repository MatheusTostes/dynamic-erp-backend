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
  IUser,
  CreateUserDto,
  UpdateUserDto,
  PaginatedUserResponse,
} from "../types/userInterfaces";

@Route("users")
@Tags("Users")
export class UserController extends Controller {
  private userService: UserService;

  constructor() {
    super();
    this.userService = new UserService();
  }

  @Post()
  @Response<IUser>(201, "Created")
  public async createUser(@Body() userData: CreateUserDto): Promise<IUser> {
    return this.userService.createUser(userData);
  }

  @Get()
  @Response<PaginatedUserResponse>(200, "Success")
  public async getAllUsers(): Promise<PaginatedUserResponse> {
    return this.userService.getAllUsers();
  }

  @Get("{userId}")
  @Response<IUser>(200, "Success")
  public async getUserById(@Path() userId: string): Promise<IUser> {
    return this.userService.getUserById(userId);
  }

  @Put("{userId}")
  @Response<IUser>(200, "Success")
  public async updateUser(
    @Path() userId: string,
    @Body() userData: UpdateUserDto
  ): Promise<IUser> {
    return this.userService.updateUser(userId, userData);
  }

  @Delete("{userId}")
  @Response(204, "No Content")
  public async deleteUser(@Path() userId: string): Promise<void> {
    await this.userService.deleteUser(userId);
  }
}
