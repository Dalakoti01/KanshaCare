import mongoose from "mongoose";

const syncLogSchema = new mongoose.Schema({

  status: {
    type: String,
    enum: ["success", "failure"],
    required: true,
  },

  recordsFetched: {
    type: Number,
    default: 0,
  },

  insertedCount: {
    type: Number,
    default: 0,
  },

  modifiedCount: {
    type: Number,
    default: 0,
  },

  executionTimeMs: {
    type: Number,
  },

  errorMessage: {
    type: String,
  },

}, {
  timestamps: true,
});

export const SyncLog = mongoose.model(
  "SyncLog",
  syncLogSchema
);