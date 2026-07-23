import express from "express";

import {
  createJob,
  getJobs,
  getJobById,
  getRecruiterJobs,
  getRecruiterJobById,
  updateJob,
  deleteJob,
} from "../controllers/jobController.js";

import {
  protect,
} from "../middleware/authMiddleware.js";

import {
  authorize,
} from "../middleware/roleMiddleware.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Public routes
|--------------------------------------------------------------------------
*/

router.get("/", getJobs);

/*
|--------------------------------------------------------------------------
| Recruiter routes
|--------------------------------------------------------------------------
| These routes must remain above router.get("/:id").
*/

router.get(
  "/recruiter/mine",
  protect,
  authorize("recruiter"),
  getRecruiterJobs
);

router.get(
  "/recruiter/mine/:id",
  protect,
  authorize("recruiter"),
  getRecruiterJobById
);

router.post(
  "/",
  protect,
  authorize("recruiter"),
  createJob
);

router.put(
  "/:id",
  protect,
  authorize("recruiter"),
  updateJob
);

router.delete(
  "/:id",
  protect,
  authorize("recruiter"),
  deleteJob
);

/*
|--------------------------------------------------------------------------
| Public single-job route
|--------------------------------------------------------------------------
*/

router.get("/:id", getJobById);

export default router;