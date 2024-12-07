export interface Record {
  [key: string]: any;
}

export interface RecordResponse {
  success: boolean;
  data: Record;
}

export interface PaginatedResponse {
  data: RecordResponse[];
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
