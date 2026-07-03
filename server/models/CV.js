import mongoose from "mongoose";

const cvSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    fileName: { type: String, required: true },
    fileUrl: { type: String, required: true },
    rawText: { type: String, default: "" },

    // Extracted data (via keyword-based parsing)
    extractedSkills: [{ type: String }],
    extractedEducation: [{ type: String }],
    extractedExperience: [{ type: String }],
    extractedCertifications: [{ type: String }],

    // Most recent match run against a specific job (optional, cached)
    lastMatch: {
      job: { type: mongoose.Schema.Types.ObjectId, ref: "Job" },
      matchPercentage: Number,
      matchedSkills: [String],
      missingSkills: [String],
      suggestions: [String],
      analyzedAt: Date,
    },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const CV = mongoose.model("CV", cvSchema);
export default CV;