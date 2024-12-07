import User from "../models/User";
import {
  CreateUserDto,
  UpdateUserDto,
  IUser,
  UserQueryOptions,
  PaginatedUserResponse,
} from "../types/userInterfaces";

export class UserService {
  public async createUser(userData: CreateUserDto): Promise<IUser> {
    const userExists = await User.findOne({ email: userData.email });
    if (userExists) {
      throw new Error("User with this email already exists");
    }

    const user = await User.create(userData);
    return user;
  }

  public async getAllUsers(
    options?: UserQueryOptions
  ): Promise<PaginatedUserResponse> {
    const page = options?.paginationPage || 1;
    const pageSize = options?.paginationSize || 10;
    const skip = (page - 1) * pageSize;

    const [users, total] = await Promise.all([
      User.find()
        .skip(skip)
        .limit(pageSize)
        .sort({
          [options?.sortBy || "createdAt"]: options?.sortOrder || "desc",
        }),
      User.countDocuments(),
    ]);

    return {
      data: users,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
        hasNextPage: page * pageSize < total,
        hasPreviousPage: page > 1,
      },
    };
  }

  public async getUserById(userId: string): Promise<IUser> {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  }

  public async updateUser(
    userId: string,
    userData: UpdateUserDto
  ): Promise<IUser> {
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: userData },
      { new: true, runValidators: true }
    );

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  }

  public async deleteUser(userId: string): Promise<void> {
    const result = await User.findByIdAndDelete(userId);
    if (!result) {
      throw new Error("User not found");
    }
  }
}
