import express from "express";

import {
  createCompany,
  getCompanies,
  getCompanyById,
  updateCompany,
} from "../controllers/companyController.js";

import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/", getCompanies);

router.get("/:id", getCompanyById);

router.post(
  "/",
  protect,
  authorize("recruiter"),
  createCompany
);

router.put(
  "/:id",
  protect,
  authorize("recruiter"),
  updateCompany
);

export default router;

// Planned for next build stage:
// POST   /api/companies          - create company profile (recruiter)
// PUT    /api/companies/:id      - edit company profile (recruiter, owner only)
// GET    /api/companies/:id      - view company profile (public)
// GET    /api/companies          - list companies (admin)


