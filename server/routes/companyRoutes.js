import express from "express";
import {
  createCompany,
  updateCompany,
  getCompanyById,
  getCompanies,
} from "../controllers/companyController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, authorize("recruiter"), createCompany);
router.put("/:id", protect, authorize("recruiter"), updateCompany);
router.get("/:id", getCompanyById);
router.get("/", protect, authorize("admin"), getCompanies);

export default router;

// Planned for next build stage:
// POST   /api/companies          - create company profile (recruiter)
// PUT    /api/companies/:id      - edit company profile (recruiter, owner only)
// GET    /api/companies/:id      - view company profile (public)
// GET    /api/companies          - list companies (admin)


