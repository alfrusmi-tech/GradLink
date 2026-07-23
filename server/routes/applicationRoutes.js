import express from "express";

import {
  applyForJob,
  getMyApplications,
  getJobApplicants,
  updateApplicationStatus,
  getApplicationCV,
} from "../controllers/applicationController.js";

import {
  protect,
} from "../middleware/authMiddleware.js";

import {
  authorize,
} from "../middleware/roleMiddleware.js";

const router = express.Router();

// Job seeker applies for a job
router.post(
  "/",
  protect,
  authorize("jobseeker"),
  applyForJob
);

// Job seeker views own applications
router.get(
  "/me",
  protect,
  authorize("jobseeker"),
  getMyApplications
);

// Recruiter views applicants for one job
router.get(
  "/job/:jobId",
  protect,
  authorize("recruiter", "admin"),
  getJobApplicants
);

// Recruiter updates application status
router.put(
  "/:id/status",
  protect,
  authorize("recruiter", "admin"),
  updateApplicationStatus
);

// Recruiter downloads applicant CV
router.get(
  "/:id/cv",
  protect,
  authorize("recruiter", "admin"),
  getApplicationCV
);

export default router;

// Planned for next build stage:
// POST   /api/applications             - apply for a job (jobseeker)
// GET    /api/applications/me          - view own applications (jobseeker)
// GET    /api/applications/job/:jobId  - view applicants for a job (recruiter)
// PUT    /api/applications/:id/status  - change application status (recruiter)
// GET    /api/applications/:id/cv      - download applicant CV (recruiter)


