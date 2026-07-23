import express from "express";

import {
  getMyNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllNotifications,
} from "../controllers/notificationController.js";

import {
  protect,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// All notification routes require login
router.use(protect);

/**
 * GET /api/notifications
 * Get the logged-in user's notifications
 */
router.get(
  "/",
  getMyNotifications
);

/**
 * GET /api/notifications/unread-count
 * Get unread notification count
 *
 * This route must be above /:id routes.
 */
router.get(
  "/unread-count",
  getUnreadNotificationCount
);

/**
 * PUT /api/notifications/read-all
 * Mark every notification as read
 *
 * This route must be above /:id/read.
 */
router.put(
  "/read-all",
  markAllNotificationsAsRead
);

/**
 * PUT /api/notifications/:id/read
 * Mark one notification as read
 */
router.put(
  "/:id/read",
  markNotificationAsRead
);

/**
 * DELETE /api/notifications/:id
 * Delete one notification
 */
router.delete(
  "/:id",
  deleteNotification
);

/**
 * DELETE /api/notifications
 * Delete all notifications
 */
router.delete(
  "/",
  deleteAllNotifications
);

export default router;
// Planned for next build stage:
// GET    /api/notifications        - list own notifications
// PUT    /api/notifications/:id/read - mark as read


