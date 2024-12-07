export interface EntityField {
  name: string;
  type: "String" | "Number" | "Date" | "Boolean" | "ObjectId";
  required: boolean;
  reference?: string;
}

export interface Entity {
  id?: string;
  name: string;
  displayName: string;
  group: string;
  order?: number;
  fields: EntityField[];
  createdBy?: string;
}

export interface EntityResponse {
  success: boolean;
  data: Entity[];
  message?: string;
}

export interface UniqueEntityResponse {
  success: boolean;
  data: Entity | null;
  message?: string;
}

export interface CreateEntityResponse {
  success: boolean;
  data: Entity | null;
  message?: string;
}
