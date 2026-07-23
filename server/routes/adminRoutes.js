import express from "express";

import {
  getAdminStatistics,
  getAdminUsers,
  updateUserStatus,
  updateUserRole,
  deleteUser,
  getAdminJobs,
  updateAdminJobStatus,
  deleteAdminJob,
  getAdminCompanies,
  deleteAdminCompany,
} from "../controllers/adminController.js";

import {
  protect,
} from "../middleware/authMiddleware.js";

import {
  authorize,
} from "../middleware/roleMiddleware.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Every admin endpoint requires an authenticated admin
|--------------------------------------------------------------------------
*/

router.use(
  protect,
  authorize("admin")
);

/*
|--------------------------------------------------------------------------
| Statistics
|--------------------------------------------------------------------------
*/

router.get(
  "/statistics",
  getAdminStatistics
);

/*
|--------------------------------------------------------------------------
| Users
|--------------------------------------------------------------------------
*/

router.get(
  "/users",
  getAdminUsers
);

router.put(
  "/users/:id/status",
  updateUserStatus
);

router.put(
  "/users/:id/role",
  updateUserRole
);

router.delete(
  "/users/:id",
  deleteUser
);

/*
|--------------------------------------------------------------------------
| Jobs
|--------------------------------------------------------------------------
*/

router.get(
  "/jobs",
  getAdminJobs
);

router.put(
  "/jobs/:id/status",
  updateAdminJobStatus
);

router.delete(
  "/jobs/:id",
  deleteAdminJob
);

/*
|--------------------------------------------------------------------------
| Companies
|--------------------------------------------------------------------------
*/

router.get(
  "/companies",
  getAdminCompanies
);

router.delete(
  "/companies/:id",
  deleteAdminCompany
);

export default router;