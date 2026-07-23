import fs from "fs";
import path from "path";

import Application from "../models/Application.js";
import Job from "../models/Job.js";
import CV from "../models/CV.js";
import Notification from "../models/Notification.js";

const allowedStatuses = [
  "pending",
  "shortlisted",
  "accepted",
  "rejected",
];

const getApplicantCVFilePath = (cv) => {
  if (!cv) {
    return null;
  }

  if (cv.storedFileName) {
    return path.resolve(
      "uploads",
      cv.storedFileName
    );
  }

  if (cv.fileUrl) {
    const fileName = path.basename(
      cv.fileUrl
    );

    return path.resolve(
      "uploads",
      fileName
    );
  }

  return null;
};

// POST /api/applications
// Job seeker applies for a job
export const applyForJob = async (
  req,
  res,
  next
) => {
  try {
    const {
      jobId,
      coverLetter = "",
    } = req.body;

    if (!jobId) {
      return res.status(400).json({
        message: "Job ID is required.",
      });
    }

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
          "Applications are not currently accepted for this job.",
      });
    }

    if (
      job.deadline &&
      new Date(job.deadline) <
        new Date()
    ) {
      return res.status(400).json({
        message:
          "The application deadline has passed.",
      });
    }

    const existingApplication =
      await Application.findOne({
        job: job._id,
        applicant: req.user._id,
      });

    if (existingApplication) {
      return res.status(400).json({
        message:
          "You have already applied for this job.",
      });
    }

    const cv = await CV.findOne({
      user: req.user._id,
      isActive: true,
    });

    if (!cv) {
      return res.status(400).json({
        message:
          "Please upload your CV before applying.",
      });
    }

    let matchScoreAtApply = 0;

    if (
      cv.lastMatch?.job &&
      cv.lastMatch.job.toString() ===
        job._id.toString()
    ) {
      matchScoreAtApply =
        cv.lastMatch.matchPercentage ||
        0;
    }

    const application =
      await Application.create({
        job: job._id,
        applicant: req.user._id,
        cv: cv._id,
        coverLetter:
          coverLetter.trim(),
        status: "pending",
        matchScoreAtApply,
        statusHistory: [
          {
            status: "pending",
            changedAt: new Date(),
          },
        ],
      });

    await Job.findByIdAndUpdate(
      job._id,
      {
        $inc: {
          applicantsCount: 1,
        },
      }
    );

    await Notification.create({
      user: job.recruiter,
      type: "application_submitted",
      message: `${req.user.name} applied for ${job.title}.`,
      relatedJob: job._id,
      relatedApplication:
        application._id,
      isRead: false,
    });

    const populatedApplication =
      await Application.findById(
        application._id
      )
        .populate({
          path: "job",
          select:
            "title location jobType status deadline",
          populate: {
            path: "company",
            select:
              "name logo location",
          },
        })
        .populate(
          "applicant",
          "name email phone location skills"
        )
        .populate(
          "cv",
          "fileName fileUrl extractedSkills"
        );

    return res.status(201).json({
      message:
        "Application submitted successfully.",
      application:
        populatedApplication,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        message:
          "You have already applied for this job.",
      });
    }

    next(error);
  }
};

// GET /api/applications/me
// Job seeker views own applications
export const getMyApplications =
  async (req, res, next) => {
    try {
      const applications =
        await Application.find({
          applicant: req.user._id,
        })
          .populate({
            path: "job",
            select:
              "title description location jobType experienceLevel salaryMin salaryMax status deadline createdAt",
            populate: {
              path: "company",
              select:
                "name logo location website",
            },
          })
          .populate(
            "cv",
            "fileName fileUrl extractedSkills"
          )
          .sort({
            createdAt: -1,
          });

      return res.status(200).json({
        count: applications.length,
        applications,
      });
    } catch (error) {
      next(error);
    }
  };

// GET /api/applications/job/:jobId
// Recruiter views applicants for their job
export const getJobApplicants =
  async (req, res, next) => {
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

      if (
        job.recruiter.toString() !==
          req.user._id.toString() &&
        req.user.role !== "admin"
      ) {
        return res.status(403).json({
          message:
            "You are not authorized to view applicants for this job.",
        });
      }

      const applications =
        await Application.find({
          job: job._id,
        })
          .populate(
            "applicant",
            "name email phone location skills education experience certifications profilePicture"
          )
          .populate(
            "cv",
            "fileName fileUrl storedFileName extractedSkills extractedEducation extractedExperience extractedCertifications"
          )
          .sort({
            createdAt: -1,
          });

      return res.status(200).json({
        job: {
          id: job._id,
          title: job.title,
          company: job.company,
          applicantsCount:
            job.applicantsCount,
        },
        count: applications.length,
        applications,
      });
    } catch (error) {
      next(error);
    }
  };

// PUT /api/applications/:id/status
// Recruiter changes application status
export const updateApplicationStatus =
  async (req, res, next) => {
    try {
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({
          message:
            "Application status is required.",
        });
      }

      if (
        !allowedStatuses.includes(
          status
        )
      ) {
        return res.status(400).json({
          message:
            "Invalid application status.",
          allowedStatuses,
        });
      }

      const application =
        await Application.findById(
          req.params.id
        )
          .populate(
            "job",
            "title recruiter company"
          )
          .populate(
            "applicant",
            "name email"
          );

      if (!application) {
        return res.status(404).json({
          message:
            "Application not found.",
        });
      }

      if (
        application.job.recruiter.toString() !==
          req.user._id.toString() &&
        req.user.role !== "admin"
      ) {
        return res.status(403).json({
          message:
            "You are not authorized to update this application.",
        });
      }

      if (
        application.status === status
      ) {
        return res.status(400).json({
          message: `Application is already ${status}.`,
        });
      }

      application.status = status;

      application.statusHistory.push({
        status,
        changedAt: new Date(),
      });

      await application.save();

      let notificationType =
         "application_reviewed";

      if (status === "shortlisted") {
          notificationType =
              "application_shortlisted";
      }

      if (status === "accepted") {
           notificationType =
              "application_accepted";
      }

      if (status === "rejected") {
          notificationType =
              "application_rejected";
      }



      let notificationMessage = `Your application for ${application.job.title} is now ${status}.`;

      if (status === "shortlisted") {
        notificationMessage = `You have been shortlisted for ${application.job.title}.`;
      }

      if (status === "accepted") {
        notificationMessage = `Congratulations! Your application for ${application.job.title} was accepted.`;
      }

      if (status === "rejected") {
        notificationMessage = `Your application for ${application.job.title} was not selected.`;
      }

      await Notification.create({
        user: application.applicant._id,
        type: notificationType,
        message: notificationMessage,
        relatedJob:
          application.job._id,
        relatedApplication:
          application._id,
        isRead: false,
      });

      const updatedApplication =
        await Application.findById(
          application._id
        )
          .populate({
            path: "job",
            select:
              "title location jobType status",
            populate: {
              path: "company",
              select:
                "name logo location",
            },
          })
          .populate(
            "applicant",
            "name email phone location skills"
          )
          .populate(
            "cv",
            "fileName fileUrl extractedSkills"
          );

      return res.status(200).json({
        message:
          "Application status updated successfully.",
        application:
          updatedApplication,
      });
    } catch (error) {
      next(error);
    }
  };

// GET /api/applications/:id/cv
// Recruiter downloads or views applicant CV
export const getApplicationCV =
  async (req, res, next) => {
    try {
      const application =
        await Application.findById(
          req.params.id
        )
          .populate(
            "job",
            "title recruiter"
          )
          .populate(
            "applicant",
            "name email"
          )
          .populate("cv");

      if (!application) {
        return res.status(404).json({
          message:
            "Application not found.",
        });
      }

      if (
        application.job.recruiter.toString() !==
          req.user._id.toString() &&
        req.user.role !== "admin"
      ) {
        return res.status(403).json({
          message:
            "You are not authorized to access this CV.",
        });
      }

      if (!application.cv) {
        return res.status(404).json({
          message:
            "No CV is attached to this application.",
        });
      }

      const cvFilePath =
        getApplicantCVFilePath(
          application.cv
        );

      if (
        !cvFilePath ||
        !fs.existsSync(cvFilePath)
      ) {
        return res.status(404).json({
          message:
            "The CV file could not be found on the server.",
        });
      }

      const safeApplicantName =
        application.applicant.name
          .replace(
            /[^a-zA-Z0-9-_ ]/g,
            ""
          )
          .replace(/\s+/g, "-");

      const downloadFileName =
        `${safeApplicantName}-CV.pdf`;

      return res.download(
        cvFilePath,
        downloadFileName
      );
    } catch (error) {
      next(error);
    }
  };