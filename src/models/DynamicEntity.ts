import mongoose, { Schema } from "mongoose";

// Schema to store entity definitions
const dynamicEntitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    fields: [
      {
        name: String,
        type: {
          type: String,
          enum: ["String", "Number", "Date", "Boolean", "ObjectId"],
        },
        required: Boolean,
        reference: String, // For ObjectId types, store the referenced model name
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Function to create a dynamic model based on entity definition
export const createDynamicModel = (entity: any) => {
  const schemaFields: any = {};
  entity.fields.forEach((field: any) => {
    const SchemaTypes: { [key: string]: any } = {
      String: String,
      Number: Number,
      Date: Date,
      Boolean: Boolean,
      ObjectId: mongoose.Schema.Types.ObjectId,
    };

    schemaFields[field.name] = { type: SchemaTypes[field.type] };
  });

  const dynamicSchema = new Schema(schemaFields);
  return mongoose.model(entity.name, dynamicSchema);
};

export const DynamicEntity = mongoose.model(
  "DynamicEntity",
  dynamicEntitySchema
);
