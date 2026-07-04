import Company from "../models/Company.js";
import User from "../models/User.js";

// CREATE COMPANY (recruiter)
export const createCompany = async (req, res, next) => {
  try {
    // Prevent a recruiter from creating multiple companies
    if (req.user.company) {
      return res.status(400).json({ message: "You already have a company profile" });
    }

    const { name, description, industry, website, location, companySize, foundedYear } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Company name is required" });
    }

    const company = await Company.create({
      name,
      description,
      industry,
      website,
      location,
      companySize,
      foundedYear,
      owner: req.user._id,
    });

    // Link the company back to the recruiter's user record
    req.user.company = company._id;
    await req.user.save();

    res.status(201).json(company);
  } catch (error) {
    next(error);
  }
};

// UPDATE COMPANY (owner only)
export const updateCompany = async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    if (company.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to edit this company" });
    }

    const updatableFields = [
      "name", "description", "industry", "website",
      "location", "companySize", "foundedYear", "logo",
    ];
    updatableFields.forEach((field) => {
      if (req.body[field] !== undefined) company[field] = req.body[field];
    });

    await company.save();
    res.json(company);
  } catch (error) {
    next(error);
  }
};

// GET SINGLE COMPANY (public)
export const getCompanyById = async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    res.json(company);
  } catch (error) {
    next(error);
  }
};

// GET ALL COMPANIES (admin)
export const getCompanies = async (req, res, next) => {
  try {
    const companies = await Company.find();
    res.json(companies);
  } catch (error) {
    next(error);
  }
};