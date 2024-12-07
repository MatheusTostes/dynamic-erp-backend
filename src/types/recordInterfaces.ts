export interface Record {
  [key: string]: unknown;
}

export interface RecordResponse {
  success: boolean;
  data: Record;
  message?: string;
}

export interface UniqueRecordResponse {
  success: boolean;
  data: Record | null;
  message?: string;
}

export interface CreateRecordResponse {
  success: boolean;
  data: Record | null;
  message?: string;
}

export interface PaginatedRecordResponse {
  data: RecordResponse[];
  message?: string;
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface QueryOptions {
  paginationPage?: number;
  paginationSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  filters?: string;
  referencedBy?: string;
}
