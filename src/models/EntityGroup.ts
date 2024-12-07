import mongoose from "mongoose";

interface Context {
  user?: { _id: string };
}

const entityGroupSchema = new mongoose.Schema(
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
    order: {
      type: Number,
      default: 0,
    },
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

entityGroupSchema.pre("save", function (next) {
  const context = (this as any).context as Context;
  if (!this.createdBy && context?.user) {
    this.createdBy = new mongoose.Types.ObjectId(context.user._id);
  }
  next();
});

entityGroupSchema.index({ order: 1 });
entityGroupSchema.index({ deletedAt: 1 });

export const EntityGroup = mongoose.model("EntityGroup", entityGroupSchema);
