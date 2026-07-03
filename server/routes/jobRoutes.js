import express from "express";

const router = express.Router();

// Planned for next build stage:
// POST   /api/jobs               - post new job (recruiter)
// PUT    /api/jobs/:id           - update job (recruiter, owner only)
// DELETE /api/jobs/:id           - delete job (recruiter, owner only)
// GET    /api/jobs                - search/filter/sort jobs (public)
// GET    /api/jobs/:id           - job details (public)
// GET    /api/jobs/recruiter/mine - recruiter's own postings


router.get("/", (req, res) => {
  res.json({ message: "Job route working" });
});

export default router;