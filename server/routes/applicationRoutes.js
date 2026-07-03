import express from "express";

const router = express.Router();

// Planned for next build stage:
// POST   /api/applications             - apply for a job (jobseeker)
// GET    /api/applications/me          - view own applications (jobseeker)
// GET    /api/applications/job/:jobId  - view applicants for a job (recruiter)
// PUT    /api/applications/:id/status  - change application status (recruiter)
// GET    /api/applications/:id/cv      - download applicant CV (recruiter)


router.get("/", (req, res) => {
  res.json({ message: "Application route working" });
});

export default router;