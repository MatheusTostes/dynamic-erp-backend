import mongoose, { Schema } from "mongoose";

// Schema to store entity definitions
const dynamicEntitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    displayName: {
      type: String,
      required: true,
    },
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EntityGroup",
      required: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    fields: [
      {
        name: String,
        type: {
          type: String,
          enum: ["String", "Number", "Date", "Boolean", "ObjectId"],
        },
        required: Boolean,
        reference: String,
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Índice composto para ordenação
dynamicEntitySchema.index({ group: 1, order: 1 });
dynamicEntitySchema.index({ deletedAt: 1 });

interface Context {
  user?: { _id: string };
}

// Add pre-save middleware to set createdBy if not provided
dynamicEntitySchema.pre("save", function (next) {
  const context = (this as any).context as Context;
  if (!this.createdBy && context?.user) {
    this.createdBy = new mongoose.Types.ObjectId(context.user._id);
  }
  next();
});

// Function to create a dynamic model based on entity definition
export const createDynamicModel = (entity: any) => {
  const schemaFields: any = {
    deletedAt: { type: Date, default: null },
  };

  entity.fields.forEach((field: any) => {
    const SchemaTypes: { [key: string]: any } = {
      String: String,
      Number: Number,
      Date: Date,
      Boolean: Boolean,
      ObjectId: mongoose.Schema.Types.ObjectId,
    };

    if (field.type === "ObjectId" && field.reference) {
      schemaFields[field.name] = {
        type: SchemaTypes[field.type],
        ref: field.reference,
      };
    } else {
      schemaFields[field.name] = { type: SchemaTypes[field.type] };
    }
  });

  const dynamicSchema = new Schema(schemaFields, { timestamps: true });
  dynamicSchema.index({ deletedAt: 1 });

  return mongoose.model(entity.name, dynamicSchema);
};

export const DynamicEntity = mongoose.model(
  "DynamicEntity",
  dynamicEntitySchema
);
