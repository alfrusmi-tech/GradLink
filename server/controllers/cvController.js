import fs from "fs";
import CV from "../models/CV.js";
import Job from "../models/Job.js";
import {
  extractTextFromPDF,
  extractSkillsFromText,
  extractEducationFromText,
  extractCertificationsFromText,
} from "../utils/cvParser.js";
import { normalizeSkillList } from "../utils/skillNormalizer.js";

// UPLOAD CV (jobseeker)
export const uploadCV = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const rawText = await extractTextFromPDF(req.file.path);
    const extractedSkills = extractSkillsFromText(rawText);
    const extractedEducation = extractEducationFromText(rawText);
    const extractedCertifications = extractCertificationsFromText(rawText);

    // Deactivate any previous CV so only one is "active" at a time
    await CV.updateMany({ user: req.user._id }, { isActive: false });

    const cv = await CV.create({
      user: req.user._id,
      fileName: req.file.originalname,
      fileUrl: `/uploads/${req.file.filename}`,
      rawText,
      extractedSkills,
      extractedEducation,
      extractedCertifications,
      isActive: true,
    });

    res.status(201).json(cv);
  } catch (error) {
    next(error);
  }
};

// ANALYZE CV AGAINST A JOB (jobseeker)
export const analyzeCV = async (req, res, next) => {
  try {
    const { jobId } = req.params;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    const cv = await CV.findOne({ user: req.user._id, isActive: true });
    if (!cv) {
      return res.status(404).json({ message: "No active CV found. Please upload one first." });
    }

    const requiredSkills = normalizeSkillList(job.requiredSkills);
    const preferredSkills = normalizeSkillList(job.preferredSkills);
    const candidateSkills = new Set(normalizeSkillList(cv.extractedSkills));

    const matchedRequired = requiredSkills.filter((s) => candidateSkills.has(s));
    const missingRequired = requiredSkills.filter((s) => !candidateSkills.has(s));
    const matchedPreferred = preferredSkills.filter((s) => candidateSkills.has(s));

    const totalRequired = requiredSkills.length || 1; // avoid divide-by-zero
    const matchPercentage = Math.round((matchedRequired.length / totalRequired) * 100);

    const suggestions = missingRequired.map(
      (skill) => `Consider highlighting or gaining experience in "${skill}"`
    );

    const result = {
      job: job._id,
      matchPercentage,
      matchedSkills: [...matchedRequired, ...matchedPreferred],
      missingSkills: missingRequired,
      suggestions,
      analyzedAt: new Date(),
    };

    cv.lastMatch = result;
    await cv.save();

    res.json(result);
  } catch (error) {
    next(error);
  }
};

// GET OWN CV + LATEST ANALYSIS (jobseeker)
export const getMyCV = async (req, res, next) => {
  try {
    const cv = await CV.findOne({ user: req.user._id, isActive: true })
      .populate("lastMatch.job", "title company");

    if (!cv) {
      return res.status(404).json({ message: "No active CV found" });
    }

    res.json(cv);
  } catch (error) {
    next(error);
  }
};