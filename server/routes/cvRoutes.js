import express from "express";

import {
  uploadCVFile,
  getMyCV,
  analyzeCV,
} from "../controllers/cvController.js";

import {
  protect,
} from "../middleware/authMiddleware.js";

import {
  authorize,
} from "../middleware/roleMiddleware.js";

import {
  uploadCV,
} from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.post(
  "/upload",
  protect,
  authorize("jobseeker"),
  uploadCV.single("cv"),
  uploadCVFile
);

router.get(
  "/me",
  protect,
  authorize("jobseeker"),
  getMyCV
);

router.post(
  "/analyze/:jobId",
  protect,
  authorize("jobseeker"),
  analyzeCV
);

export default router;

// Planned for next build stage:
// POST   /api/cv/upload           - upload CV (jobseeker)
// POST   /api/cv/analyze/:jobId   - run keyword match analysis against a job
// GET    /api/cv/me               - get own CV + latest analysis



