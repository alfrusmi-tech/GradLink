import express from "express";

const router = express.Router();

// Planned for next build stage:
// GET    /api/notifications        - list own notifications
// PUT    /api/notifications/:id/read - mark as read


router.get("/", (req, res) => {
  res.json({ message: "Notification route working" });
});

export default router;