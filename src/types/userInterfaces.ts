export interface User {
  id?: string;
  email: string;
  password: string;
  name: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserResponse {
  success: boolean;
  data: Omit<User, "password">[];
  message?: string;
}

export interface UniqueUserResponse {
  success: boolean;
  data: Omit<User, "password"> | null;
  message?: string;
}

export interface CreateUserResponse {
  success: boolean;
  data: Omit<User, "password"> | null;
  message?: string;
}

export interface PaginatedUserResponse {
  success?: boolean;
  data: Omit<User, "password">[];
  pagination?: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  message?: string;
}

export interface UserQueryOptions {
  paginationPage?: number;
  paginationSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  filters?: string;
}
