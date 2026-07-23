import express from "express";

import {
  createJob,
  getJobs,
  getJobById,
} from "../controllers/jobController.js";

import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = express.Router();

// PUBLIC ROUTES
router.get("/", getJobs);
router.get("/:id", getJobById);

// RECRUITER ONLY
router.post("/", protect, authorize("recruiter"), createJob);

export default router;

// Planned for next build stage:
// POST   /api/jobs               - post new job (recruiter)
// PUT    /api/jobs/:id           - update job (recruiter, owner only)
// DELETE /api/jobs/:id           - delete job (recruiter, owner only)
// GET    /api/jobs                - search/filter/sort jobs (public)
// GET    /api/jobs/:id           - job details (public)
// GET    /api/jobs/recruiter/mine - recruiter's own postings


