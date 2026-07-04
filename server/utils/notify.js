import Notification from "../models/Notification.js";

// Centralized notification creator, so every module calls the same function
export const createNotification = async ({ user, type, message, relatedJob, relatedApplication }) => {
  try {
    await Notification.create({ user, type, message, relatedJob, relatedApplication });
  } catch (error) {
    // Don't let a notification failure break the main request (e.g. applying to a job)
    console.error("Failed to create notification:", error.message);
  }
};