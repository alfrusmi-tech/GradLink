import mongoose from "mongoose";

const companySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    logo: { type: String, default: "" },
    description: { type: String, default: "" },
    industry: { type: String, default: "" },
    website: { type: String, default: "" },
    location: { type: String, default: "" },
    companySize: { type: String, default: "" },
    foundedYear: { type: Number },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

const Company = mongoose.model("Company", companySchema);
export default Company;