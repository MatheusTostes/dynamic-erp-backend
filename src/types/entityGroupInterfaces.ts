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
  data: EntityGroup;
}

export interface CreateGroupDTO {
  name: string;
  displayName: string;
  order?: number;
}

export interface AuthRequest extends Request {
  user?: {
    _id: string;
    [key: string]: any;
  };
}
