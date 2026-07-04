import express from "express";
import { uploadCV, analyzeCV, getMyCV } from "../controllers/cvController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";
import { uploadCV as uploadCVMiddleware } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.post("/upload", protect, authorize("jobseeker"), uploadCVMiddleware.single("cv"), uploadCV);
router.post("/analyze/:jobId", protect, authorize("jobseeker"), analyzeCV);
router.get("/me", protect, authorize("jobseeker"), getMyCV);

export default router;

// Planned for next build stage:
// POST   /api/cv/upload           - upload CV (jobseeker)
// POST   /api/cv/analyze/:jobId   - run keyword match analysis against a job
// GET    /api/cv/me               - get own CV + latest analysis



