import mongoose from "mongoose";

const lastMatchSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      default: null,
    },

    matchPercentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    matchedSkills: {
      type: [String],
      default: [],
    },

    missingSkills: {
      type: [String],
      default: [],
    },

    suggestions: {
      type: [String],
      default: [],
    },

    analyzedAt: {
      type: Date,
      default: null,
    },
  },
  {
    _id: false,
  }
);

const cvSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    fileName: {
      type: String,
      required: true,
      trim: true,
    },

    storedFileName: {
      type: String,
      required: true,
    },

    fileUrl: {
      type: String,
      required: true,
    },

    rawText: {
      type: String,
      default: "",
    },

    extractedSkills: {
      type: [String],
      default: [],
    },

    extractedEducation: {
      type: [String],
      default: [],
    },

    extractedExperience: {
      type: [String],
      default: [],
    },

    extractedCertifications: {
      type: [String],
      default: [],
    },

    lastMatch: {
      type: lastMatchSchema,
      default: () => ({}),
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const CV = mongoose.model("CV", cvSchema);

export default CV;