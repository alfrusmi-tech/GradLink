import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    company: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },
    recruiter: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    description: { type: String, required: true },
    responsibilities: [{ type: String }],
    requiredSkills: [{ type: String, required: true }],
    preferredSkills: [{ type: String }],
    experienceLevel: {
      type: String,
      enum: ["entry", "junior", "mid", "senior", "lead"],
      default: "entry",
    },
    experienceYears: { type: Number, default: 0 },
    location: { type: String, required: true },
    jobType: {
      type: String,
      enum: ["full-time", "part-time", "contract", "internship", "remote"],
      default: "full-time",
    },
    salaryMin: { type: Number },
    salaryMax: { type: Number },
    education: { type: String, default: "" },
    status: {
      type: String,
      enum: ["open", "closed", "draft"],
      default: "open",
    },
    applicantsCount: { type: Number, default: 0 },
    deadline: { type: Date },
  },
  { timestamps: true }
);

jobSchema.index({ title: "text", requiredSkills: "text", location: "text" });

const Job = mongoose.model("Job", jobSchema);
export default Job;
