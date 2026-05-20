import mongoose from "mongoose";

const earthquakeSchema = new mongoose.Schema(
  {
    earthquakeId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    magnitude: {
      type: Number,
      index: true,
    },

    highSeverityAlertSent: {
      type: Boolean,
      default: false,
    },

    locationAlertSent: {
   type: Boolean,
   default: false,
},

    place: String,

    title: String,

    eventTime: {
      type: Date,
      index: true,
    },

    updatedTime: Date,

    status: String,

    tsunami: Number,

    alertLevel: String,

    significance: Number,

    feltReports: Number,

    cdi: Number,

    mmi: Number,

    magType: String,

    gap: Number,

    rms: Number,

    nst: Number,

    dmin: Number,

    earthquakeType: String,

    location: {
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

    depth: Number,

    rawData: mongoose.Schema.Types.Mixed

    
  },
  {
    timestamps: true,
  },
);

earthquakeSchema.index({ location: "2dsphere" });

export const Earthquake = mongoose.model("Earthquake", earthquakeSchema);
