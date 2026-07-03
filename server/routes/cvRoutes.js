import express from "express";

const router = express.Router();

// Planned for next build stage:
// POST   /api/cv/upload           - upload CV (jobseeker)
// POST   /api/cv/analyze/:jobId   - run keyword match analysis against a job
// GET    /api/cv/me               - get own CV + latest analysis


router.get("/", (req, res) => {
  res.json({ message: "CV route working" });
});

export default router;
