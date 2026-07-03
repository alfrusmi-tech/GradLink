import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import User from "../models/User.js";

const router = express.Router();

// @desc    Update own profile
// @route   PUT /api/users/profile
// @access  Private
router.put("/profile", protect, async (req, res, next) => {
  try {
    const updatableFields = [
      "name",
      "phone",
      "location",
      "skills",
      "education",
      "experience",
      "certifications",
    ];
    const updates = {};
    updatableFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    }).select("-password");

    res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
});

router.get("/", (req, res) => {
  res.json({ message: "User routes working" });
});

export default router;

// NOTE: This is a starter stub. Planned additions for the next build stage:
// - GET /api/users/:id (public profile view for recruiters)
// - POST /api/users/profile-picture (image upload)
// - GET /api/users/saved-jobs
// - POST/DELETE /api/users/saved-jobs/:jobId