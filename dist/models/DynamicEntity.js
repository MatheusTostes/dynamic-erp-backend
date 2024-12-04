"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.DynamicEntity = exports.createDynamicModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
// Schema to store entity definitions
const dynamicEntitySchema = new mongoose_1.default.Schema({
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
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
}, {
    timestamps: true,
});
// Function to create a dynamic model based on entity definition
const createDynamicModel = (entity) => {
    const schemaFields = {};
    entity.fields.forEach((field) => {
        const SchemaTypes = {
            String: String,
            Number: Number,
            Date: Date,
            Boolean: Boolean,
            ObjectId: mongoose_1.default.Schema.Types.ObjectId,
        };
        schemaFields[field.name] = { type: SchemaTypes[field.type] };
    });
    const dynamicSchema = new mongoose_1.Schema(schemaFields);
    return mongoose_1.default.model(entity.name, dynamicSchema);
};
exports.createDynamicModel = createDynamicModel;
exports.DynamicEntity = mongoose_1.default.model("DynamicEntity", dynamicEntitySchema);
