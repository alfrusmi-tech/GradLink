import fs from "fs";
import path from "path";
import pdfParse from "pdf-parse";

import CV from "../models/CV.js";
import Job from "../models/Job.js";
import User from "../models/User.js";

const SKILL_DICTIONARY = [
  "html",
  "css",
  "javascript",
  "typescript",
  "react",
  "react.js",
  "vue",
  "vue.js",
  "angular",
  "node",
  "node.js",
  "express",
  "express.js",
  "mongodb",
  "mongoose",
  "mysql",
  "postgresql",
  "sql",
  "firebase",
  "java",
  "spring boot",
  "python",
  "django",
  "flask",
  "c",
  "c++",
  "c#",
  ".net",
  "asp.net",
  "php",
  "laravel",
  "git",
  "github",
  "gitlab",
  "rest api",
  "restful api",
  "graphql",
  "tailwind css",
  "bootstrap",
  "material ui",
  "docker",
  "kubernetes",
  "aws",
  "azure",
  "google cloud",
  "linux",
  "figma",
  "postman",
  "machine learning",
  "artificial intelligence",
  "data analysis",
  "power bi",
  "tableau",
  "numpy",
  "pandas",
  "scikit-learn",
  "tensorflow",
  "pytorch",
  "agile",
  "scrum",
  "communication",
  "teamwork",
  "problem solving",
  "leadership",
];

const normalizeText = (value = "") => {
  return value
    .toString()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
};

const normalizeSkill = (skill = "") => {
  return normalizeText(skill)
    .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "")
    .trim();
};

const removeDuplicateValues = (values = []) => {
  return [
    ...new Set(
      values
        .map((value) => value.trim())
        .filter(Boolean)
    ),
  ];
};

const extractSkillsFromText = (text) => {
  const normalizedCVText = normalizeText(text);

  const extractedSkills = SKILL_DICTIONARY.filter(
    (skill) => {
      const normalizedSkill = normalizeText(skill);

      return normalizedCVText.includes(normalizedSkill);
    }
  );

  return removeDuplicateValues(extractedSkills);
};

const extractMatchingLines = (
  text,
  keywords,
  maximumLines = 5
) => {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length >= 4);

  const matchingLines = lines.filter((line) => {
    const normalizedLine = normalizeText(line);

    return keywords.some((keyword) =>
      normalizedLine.includes(
        normalizeText(keyword)
      )
    );
  });

  return removeDuplicateValues(
    matchingLines
  ).slice(0, maximumLines);
};

const extractEducationFromText = (text) => {
  const educationKeywords = [
    "university",
    "college",
    "degree",
    "bachelor",
    "master",
    "diploma",
    "engineering",
    "computer science",
    "education",
  ];

  return extractMatchingLines(
    text,
    educationKeywords,
    6
  );
};

const extractExperienceFromText = (text) => {
  const experienceKeywords = [
    "experience",
    "intern",
    "internship",
    "developer",
    "engineer",
    "employment",
    "worked",
    "project",
  ];

  return extractMatchingLines(
    text,
    experienceKeywords,
    6
  );
};

const extractCertificationsFromText = (text) => {
  const certificationKeywords = [
    "certification",
    "certificate",
    "certified",
    "course",
    "training",
    "azure",
    "aws",
    "google",
    "microsoft",
    "oracle",
    "cisco",
  ];

  return extractMatchingLines(
    text,
    certificationKeywords,
    6
  );
};

const safelyDeleteFile = (filePath) => {
  try {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error(
      "Could not delete file:",
      error.message
    );
  }
};

const getStoredFilePath = (storedFileName) => {
  if (!storedFileName) {
    return null;
  }

  return path.resolve(
    "uploads",
    storedFileName
  );
};

const prepareJobSkills = (job) => {
  const requiredSkills = Array.isArray(
    job.requiredSkills
  )
    ? job.requiredSkills
    : [];

  const preferredSkills = Array.isArray(
    job.preferredSkills
  )
    ? job.preferredSkills
    : [];

  return removeDuplicateValues([
    ...requiredSkills,
    ...preferredSkills,
  ]);
};

const calculateMatchResult = (
  cvSkills,
  jobSkills
) => {
  const normalizedCVSkills = cvSkills.map(
    normalizeSkill
  );

  const matchedSkills = [];
  const missingSkills = [];

  jobSkills.forEach((originalSkill) => {
    const normalizedJobSkill =
      normalizeSkill(originalSkill);

    const isMatched = normalizedCVSkills.some(
      (cvSkill) => {
        return (
          cvSkill === normalizedJobSkill ||
          cvSkill.includes(normalizedJobSkill) ||
          normalizedJobSkill.includes(cvSkill)
        );
      }
    );

    if (isMatched) {
      matchedSkills.push(originalSkill);
    } else {
      missingSkills.push(originalSkill);
    }
  });

  const matchPercentage =
    jobSkills.length === 0
      ? 0
      : Math.round(
          (matchedSkills.length /
            jobSkills.length) *
            100
        );

  const suggestions = [];

  if (missingSkills.length > 0) {
    suggestions.push(
      `Consider learning or demonstrating these skills: ${missingSkills.join(
        ", "
      )}.`
    );
  }

  if (matchedSkills.length === 0) {
    suggestions.push(
      "Add a clear skills section containing technologies relevant to this job."
    );
  }

  if (
    matchPercentage > 0 &&
    matchPercentage < 50
  ) {
    suggestions.push(
      "Add projects or work experience that demonstrate the required skills."
    );
  }

  if (
    matchPercentage >= 50 &&
    matchPercentage < 80
  ) {
    suggestions.push(
      "Improve your CV by adding measurable achievements related to the matched skills."
    );
  }

  if (matchPercentage >= 80) {
    suggestions.push(
      "Your skill match is strong. Review the job description and customize your summary before applying."
    );
  }

  return {
    matchPercentage,
    matchedSkills,
    missingSkills,
    suggestions,
  };
};

export const uploadCVFile = async (
  req,
  res,
  next
) => {
  let uploadedFilePath = null;

  try {
    if (!req.file) {
      return res.status(400).json({
        message: "Please select a PDF CV.",
      });
    }

    uploadedFilePath = req.file.path;

    const fileBuffer = fs.readFileSync(
      uploadedFilePath
    );

    const pdfData = await pdfParse(fileBuffer);

    const rawText = pdfData.text?.trim() || "";

    if (!rawText) {
      safelyDeleteFile(uploadedFilePath);

      return res.status(400).json({
        message:
          "The PDF does not contain readable text. Please upload a text-based PDF.",
      });
    }

    const extractedSkills =
      extractSkillsFromText(rawText);

    const extractedEducation =
      extractEducationFromText(rawText);

    const extractedExperience =
      extractExperienceFromText(rawText);

    const extractedCertifications =
      extractCertificationsFromText(rawText);

    const existingCV = await CV.findOne({
      user: req.user._id,
    });

    const oldStoredFilePath =
      getStoredFilePath(
        existingCV?.storedFileName
      );

    const cvData = {
      user: req.user._id,
      fileName: req.file.originalname,
      storedFileName: req.file.filename,
      fileUrl: `/uploads/${req.file.filename}`,
      rawText,
      extractedSkills,
      extractedEducation,
      extractedExperience,
      extractedCertifications,
      lastMatch: {
        job: null,
        matchPercentage: 0,
        matchedSkills: [],
        missingSkills: [],
        suggestions: [],
        analyzedAt: null,
      },
      isActive: true,
    };

    const cv = await CV.findOneAndUpdate(
      {
        user: req.user._id,
      },
      cvData,
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    if (
      existingCV &&
      oldStoredFilePath &&
      oldStoredFilePath !== uploadedFilePath
    ) {
      safelyDeleteFile(oldStoredFilePath);
    }

    await User.findByIdAndUpdate(
      req.user._id,
      {
        resumeUrl: cv.fileUrl,
      }
    );

    return res.status(201).json({
      message: "CV uploaded successfully.",
      cv,
    });
  } catch (error) {
    if (uploadedFilePath) {
      safelyDeleteFile(uploadedFilePath);
    }

    next(error);
  }
};

export const getMyCV = async (
  req,
  res,
  next
) => {
  try {
    const cv = await CV.findOne({
      user: req.user._id,
      isActive: true,
    }).populate(
      "lastMatch.job",
      "title company requiredSkills preferredSkills"
    );

    if (!cv) {
      return res.status(404).json({
        message: "You have not uploaded a CV.",
      });
    }

    return res.status(200).json(cv);
  } catch (error) {
    next(error);
  }
};

export const analyzeCV = async (
  req,
  res,
  next
) => {
  try {
    const { jobId } = req.params;

    const job = await Job.findById(
      jobId
    ).populate(
      "company",
      "name logo location"
    );

    if (!job) {
      return res.status(404).json({
        message: "Job not found.",
      });
    }

    if (job.status !== "open") {
      return res.status(400).json({
        message:
          "CV analysis is only available for open jobs.",
      });
    }

    const cv = await CV.findOne({
      user: req.user._id,
      isActive: true,
    });

    if (!cv) {
      return res.status(404).json({
        message:
          "Please upload your CV before running an analysis.",
      });
    }

    let cvSkills = cv.extractedSkills || [];

    if (cvSkills.length === 0) {
      cvSkills = extractSkillsFromText(
        cv.rawText
      );

      cv.extractedSkills = cvSkills;
    }

    const jobSkills =
      prepareJobSkills(job);

    const result = calculateMatchResult(
      cvSkills,
      jobSkills
    );

    cv.lastMatch = {
      job: job._id,
      matchPercentage:
        result.matchPercentage,
      matchedSkills:
        result.matchedSkills,
      missingSkills:
        result.missingSkills,
      suggestions: result.suggestions,
      analyzedAt: new Date(),
    };

    await cv.save();

    return res.status(200).json({
      message: "CV analysis completed.",
      job: {
        id: job._id,
        title: job.title,
        company: job.company,
        requiredSkills:
          job.requiredSkills || [],
        preferredSkills:
          job.preferredSkills || [],
      },
      cv: {
        fileName: cv.fileName,
        extractedSkills:
          cv.extractedSkills,
      },
      analysis: result,
    });
  } catch (error) {
    next(error);
  }
};