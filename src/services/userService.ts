import { User as UserModel } from "../models/User";
import {
  UserQueryOptions,
  PaginatedUserResponse,
  User,
} from "../types/userInterfaces";

export class UserService {
  public async createUser(userData: User): Promise<User> {
    const userExists = await UserModel.findOne({ email: userData.email });
    if (userExists) {
      throw new Error("User with this email already exists");
    }

    const user = await UserModel.create(userData);
    return user;
  }

  public async getAllUsers(
    options?: UserQueryOptions
  ): Promise<PaginatedUserResponse> {
    const page = options?.paginationPage || 1;
    const pageSize = options?.paginationSize || 10;
    const skip = (page - 1) * pageSize;

    const [users, total] = await Promise.all([
      UserModel.find()
        .skip(skip)
        .limit(pageSize)
        .sort({
          [options?.sortBy || "createdAt"]: options?.sortOrder || "desc",
        }),
      UserModel.countDocuments(),
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

  public async getUserById(
    userId: string
  ): Promise<Omit<User, "password"> | null> {
    const user = await UserModel.findById(userId);
    return user;
  }

  public async updateUser(
    userId: string,
    userData: User
  ): Promise<Omit<User, "password"> | null> {
    const user = await UserModel.findByIdAndUpdate(
      userId,
      { $set: userData },
      { new: true, runValidators: true }
    );

    return user;
  }

  public async deleteUser(
    userId: string
  ): Promise<Omit<User, "password"> | null> {
    const result = await UserModel.findByIdAndDelete(userId);
    return result;
  }
}
