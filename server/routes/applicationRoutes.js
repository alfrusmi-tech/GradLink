import express from "express";
import {
  applyToJob,
  getMyApplications,
  getApplicantsForJob,
  updateApplicationStatus,
} from "../controllers/applicationController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// JOBSEEKER
router.post("/", protect, authorize("jobseeker"), applyToJob);
router.get("/me", protect, authorize("jobseeker"), getMyApplications);

// RECRUITER
router.get("/job/:jobId", protect, authorize("recruiter"), getApplicantsForJob);
router.put("/:id/status", protect, authorize("recruiter"), updateApplicationStatus);

export default router;

// Planned for next build stage:
// POST   /api/applications             - apply for a job (jobseeker)
// GET    /api/applications/me          - view own applications (jobseeker)
// GET    /api/applications/job/:jobId  - view applicants for a job (recruiter)
// PUT    /api/applications/:id/status  - change application status (recruiter)
// GET    /api/applications/:id/cv      - download applicant CV (recruiter)


