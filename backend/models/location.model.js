import mongoose from "mongoose";

const locationSchema = new mongoose.Schema({

  cityName: {
    type: String,
    required: true,
  },

  country: {
    type: String,
  },

  coordinates: {

    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },

    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
    },
  },

  monitoringRadius: {
    type: Number,
    default: 500, // km
  },

  alertMagnitudeThreshold: {
    type: Number,
    default: 4.0,
  },

  riskScore: {
    type: Number,
    default: 0,
  },

  lastCalculatedAt: {
    type: Date,
  },

}, {
  timestamps: true,
});

locationSchema.index({ coordinates: "2dsphere" });

export const Location = mongoose.model(
  "Location",
  locationSchema
);