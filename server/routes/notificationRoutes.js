
import express from "express";
import { getMyNotifications, markAsRead } from "../controllers/notificationController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getMyNotifications);
router.put("/:id/read", protect, markAsRead);

export default router;

// Planned for next build stage:
// GET    /api/notifications        - list own notifications
// PUT    /api/notifications/:id/read - mark as read


