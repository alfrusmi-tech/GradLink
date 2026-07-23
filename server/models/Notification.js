import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: [
        "application_submitted",
        "application_reviewed",
        "application_shortlisted",
        "application_accepted",
        "application_rejected",
        "new_job_posted",
        "general",
      ],
      required: true,
      default: "general",
    },

    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },

    relatedJob: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      default: null,
    },

    relatedApplication: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
      default: null,
    },

    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },

    readAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Helps load one user's newest notifications quickly
notificationSchema.index({
  user: 1,
  createdAt: -1,
});

// Helps count unread notifications quickly
notificationSchema.index({
  user: 1,
  isRead: 1,
});

const Notification = mongoose.model(
  "Notification",
  notificationSchema
);

export default Notification;
