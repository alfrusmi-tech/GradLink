import Application from "../models/Application.js";
import Job from "../models/Job.js";
import { createNotification } from "../utils/notify.js";

// APPLY FOR A JOB (jobseeker)
export const applyToJob = async (req, res, next) => {
  try {
    const { jobId, cv, coverLetter } = req.body;

    if (!jobId) {
      return res.status(400).json({ message: "jobId is required" });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (job.status !== "open") {
      return res.status(400).json({ message: "This job is no longer accepting applications" });
    }

    const application = await Application.create({
      job: jobId,
      applicant: req.user._id, // trusted source, not req.body
      cv,
      coverLetter,
      statusHistory: [{ status: "pending" }],
    });

    job.applicantsCount += 1;
    await job.save();

    // Notify the recruiter that someone applied
    await createNotification({
      user: job.recruiter,
      type: "application_submitted",
      message: `New application received for "${job.title}"`,
      relatedJob: job._id,
      relatedApplication: application._id,
    });

    res.status(201).json(application);
  } catch (error) {
    // Duplicate application (unique index on job + applicant)
    if (error.code === 11000) {
      return res.status(400).json({ message: "You have already applied to this job" });
    }
    next(error);
  }
};

// VIEW OWN APPLICATIONS (jobseeker)
export const getMyApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ applicant: req.user._id })
      .populate({
        path: "job",
        populate: { path: "company", select: "name logo location" },
      })
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (error) {
    next(error);
  }
};

// VIEW APPLICANTS FOR A JOB (recruiter, owner only)
export const getApplicantsForJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.jobId);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (job.recruiter.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to view applicants for this job" });
    }

    const applications = await Application.find({ job: req.params.jobId })
      .populate("applicant", "name email skills education experience resumeUrl")
      .populate("cv")
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (error) {
    next(error);
  }
};

// CHANGE APPLICATION STATUS (recruiter, owner only)
export const updateApplicationStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ["pending", "shortlisted", "rejected", "accepted"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const application = await Application.findById(req.params.id).populate("job");

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    if (application.job.recruiter.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to update this application" });
    }

    application.status = status;
    application.statusHistory.push({ status });
    await application.save();

    // Notify the applicant their status changed
    const statusToType = {
      shortlisted: "application_reviewed",
      accepted: "application_accepted",
      rejected: "application_rejected",
    };

    if (statusToType[status]) {
      await createNotification({
        user: application.applicant,
        type: statusToType[status],
        message: `Your application for "${application.job.title}" was ${status}`,
        relatedJob: application.job._id,
        relatedApplication: application._id,
      });
    }

    res.json(application);
  } catch (error) {
    next(error);
  }
};