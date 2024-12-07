export interface EntityGroup {
  id?: string;
  name: string;
  displayName: string;
  order?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface EntityGroupResponse {
  success: boolean;
  data: EntityGroup[];
  message?: string;
}

export interface UniqueGroupResponse {
  success: boolean;
  data: EntityGroup | null;
  message?: string;
}

export interface CreateGroupResponse {
  success: boolean;
  data: EntityGroup | null;
  message?: string;
}
