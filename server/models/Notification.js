import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: [
        "application_submitted",
        "application_reviewed",
        "application_accepted",
        "application_rejected",
        "new_job_posted",
      ],
      required: true,
    },
    message: { type: String, required: true },
    relatedJob: { type: mongoose.Schema.Types.ObjectId, ref: "Job" },
    relatedApplication: { type: mongoose.Schema.Types.ObjectId, ref: "Application" },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
