import mongoose from "mongoose";
import Job from "../models/Job.js";
import Application from "../models/Application.js";

/**
 * Convert comma-separated strings or arrays into clean arrays.
 */
const normalizeArray = (value) => {
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item).trim())
      .filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

/**
 * Validate common job fields.
 */
const validateJobData = (data) => {
  if (!data.title?.trim()) {
    return "Job title is required.";
  }

  if (!data.description?.trim()) {
    return "Job description is required.";
  }

  if (!data.location?.trim()) {
    return "Job location is required.";
  }

  const requiredSkills = normalizeArray(
    data.requiredSkills
  );

  if (requiredSkills.length === 0) {
    return "At least one required skill is required.";
  }

  const allowedJobTypes = [
    "full-time",
    "part-time",
    "contract",
    "internship",
    "remote",
  ];

  if (
    data.jobType &&
    !allowedJobTypes.includes(data.jobType)
  ) {
    return "Invalid job type.";
  }

  const allowedExperienceLevels = [
    "entry",
    "junior",
    "mid",
    "senior",
    "lead",
  ];

  if (
    data.experienceLevel &&
    !allowedExperienceLevels.includes(
      data.experienceLevel
    )
  ) {
    return "Invalid experience level.";
  }

  const allowedStatuses = [
    "open",
    "closed",
    "draft",
  ];

  if (
    data.status &&
    !allowedStatuses.includes(data.status)
  ) {
    return "Invalid job status.";
  }

  const salaryMin =
    data.salaryMin === "" ||
    data.salaryMin === undefined ||
    data.salaryMin === null
      ? null
      : Number(data.salaryMin);

  const salaryMax =
    data.salaryMax === "" ||
    data.salaryMax === undefined ||
    data.salaryMax === null
      ? null
      : Number(data.salaryMax);

  if (
    salaryMin !== null &&
    (Number.isNaN(salaryMin) || salaryMin < 0)
  ) {
    return "Minimum salary must be a valid positive number.";
  }

  if (
    salaryMax !== null &&
    (Number.isNaN(salaryMax) || salaryMax < 0)
  ) {
    return "Maximum salary must be a valid positive number.";
  }

  if (
    salaryMin !== null &&
    salaryMax !== null &&
    salaryMin > salaryMax
  ) {
    return "Minimum salary cannot be greater than maximum salary.";
  }

  const experienceYears =
    data.experienceYears === "" ||
    data.experienceYears === undefined ||
    data.experienceYears === null
      ? 0
      : Number(data.experienceYears);

  if (
    Number.isNaN(experienceYears) ||
    experienceYears < 0
  ) {
    return "Experience years must be a valid positive number.";
  }

  if (data.deadline) {
    const deadline = new Date(data.deadline);

    if (Number.isNaN(deadline.getTime())) {
      return "Invalid application deadline.";
    }
  }

  return null;
};

/**
 * @desc    Create a new job
 * @route   POST /api/jobs
 * @access  Recruiter
 */
export const createJob = async (
  req,
  res,
  next
) => {
  try {
    if (!req.user.company) {
      return res.status(400).json({
        message:
          "You must create a company profile before posting a job.",
      });
    }

    const validationError =
      validateJobData(req.body);

    if (validationError) {
      return res.status(400).json({
        message: validationError,
      });
    }

    const job = await Job.create({
      title: req.body.title.trim(),
      description: req.body.description.trim(),

      responsibilities: normalizeArray(
        req.body.responsibilities
      ),

      requiredSkills: normalizeArray(
        req.body.requiredSkills
      ),

      preferredSkills: normalizeArray(
        req.body.preferredSkills
      ),

      experienceLevel:
        req.body.experienceLevel || "entry",

      experienceYears:
        req.body.experienceYears === "" ||
        req.body.experienceYears === undefined
          ? 0
          : Number(req.body.experienceYears),

      location: req.body.location.trim(),

      jobType:
        req.body.jobType || "full-time",

      salaryMin:
        req.body.salaryMin === "" ||
        req.body.salaryMin === undefined
          ? undefined
          : Number(req.body.salaryMin),

      salaryMax:
        req.body.salaryMax === "" ||
        req.body.salaryMax === undefined
          ? undefined
          : Number(req.body.salaryMax),

      education:
        req.body.education?.trim() || "",

      status: req.body.status || "open",

      deadline:
        req.body.deadline || undefined,

      company: req.user.company,
      recruiter: req.user._id,
    });

    const populatedJob =
      await Job.findById(job._id)
        .populate(
          "company",
          "name logo location industry"
        )
        .populate(
          "recruiter",
          "name email"
        );

    return res.status(201).json({
      message:
        "Job created successfully.",
      job: populatedJob,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all public jobs
 * @route   GET /api/jobs
 * @access  Public
 */
export const getJobs = async (
  req,
  res,
  next
) => {
  try {
    const jobs = await Job.find({
      status: "open",
    })
      .populate(
        "company",
        "name logo location industry"
      )
      .populate(
        "recruiter",
        "name"
      )
      .sort({ createdAt: -1 });

    return res.status(200).json(jobs);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get recruiter's own jobs
 * @route   GET /api/jobs/recruiter/mine
 * @access  Recruiter
 */
export const getRecruiterJobs = async (
  req,
  res,
  next
) => {
  try {
    const jobs = await Job.find({
      recruiter: req.user._id,
    })
      .populate(
        "company",
        "name logo location industry"
      )
      .sort({ createdAt: -1 });

    return res.status(200).json(jobs);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get one job
 * @route   GET /api/jobs/:id
 * @access  Public
 */
export const getJobById = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      return res.status(400).json({
        message: "Invalid job ID.",
      });
    }

    const job = await Job.findById(id)
      .populate(
        "company",
        "name logo description industry website location companySize foundedYear"
      )
      .populate(
        "recruiter",
        "name email"
      );

    if (!job) {
      return res.status(404).json({
        message: "Job not found.",
      });
    }

    return res.status(200).json(job);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get one recruiter-owned job for editing
 * @route   GET /api/jobs/recruiter/mine/:id
 * @access  Recruiter
 */
export const getRecruiterJobById =
  async (req, res, next) => {
    try {
      const { id } = req.params;

      if (
        !mongoose.Types.ObjectId.isValid(id)
      ) {
        return res.status(400).json({
          message: "Invalid job ID.",
        });
      }

      const job = await Job.findOne({
        _id: id,
        recruiter: req.user._id,
      }).populate(
        "company",
        "name logo"
      );

      if (!job) {
        return res.status(404).json({
          message:
            "Job not found or you do not own this job.",
        });
      }

      return res.status(200).json(job);
    } catch (error) {
      next(error);
    }
  };

/**
 * @desc    Update recruiter-owned job
 * @route   PUT /api/jobs/:id
 * @access  Recruiter
 */
export const updateJob = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      return res.status(400).json({
        message: "Invalid job ID.",
      });
    }

    const job = await Job.findOne({
      _id: id,
      recruiter: req.user._id,
    });

    if (!job) {
      return res.status(404).json({
        message:
          "Job not found or you do not have permission to edit it.",
      });
    }

    const mergedData = {
      ...job.toObject(),
      ...req.body,
    };

    const validationError =
      validateJobData(mergedData);

    if (validationError) {
      return res.status(400).json({
        message: validationError,
      });
    }

    const allowedFields = [
      "title",
      "description",
      "experienceLevel",
      "experienceYears",
      "location",
      "jobType",
      "salaryMin",
      "salaryMax",
      "education",
      "status",
      "deadline",
    ];

    allowedFields.forEach((field) => {
      if (
        Object.prototype.hasOwnProperty.call(
          req.body,
          field
        )
      ) {
        job[field] = req.body[field];
      }
    });

    if (
      Object.prototype.hasOwnProperty.call(
        req.body,
        "title"
      )
    ) {
      job.title = req.body.title.trim();
    }

    if (
      Object.prototype.hasOwnProperty.call(
        req.body,
        "description"
      )
    ) {
      job.description =
        req.body.description.trim();
    }

    if (
      Object.prototype.hasOwnProperty.call(
        req.body,
        "location"
      )
    ) {
      job.location =
        req.body.location.trim();
    }

    if (
      Object.prototype.hasOwnProperty.call(
        req.body,
        "education"
      )
    ) {
      job.education =
        req.body.education?.trim() || "";
    }

    if (
      Object.prototype.hasOwnProperty.call(
        req.body,
        "responsibilities"
      )
    ) {
      job.responsibilities =
        normalizeArray(
          req.body.responsibilities
        );
    }

    if (
      Object.prototype.hasOwnProperty.call(
        req.body,
        "requiredSkills"
      )
    ) {
      job.requiredSkills =
        normalizeArray(
          req.body.requiredSkills
        );
    }

    if (
      Object.prototype.hasOwnProperty.call(
        req.body,
        "preferredSkills"
      )
    ) {
      job.preferredSkills =
        normalizeArray(
          req.body.preferredSkills
        );
    }

    if (
      Object.prototype.hasOwnProperty.call(
        req.body,
        "salaryMin"
      )
    ) {
      job.salaryMin =
        req.body.salaryMin === "" ||
        req.body.salaryMin === null
          ? undefined
          : Number(req.body.salaryMin);
    }

    if (
      Object.prototype.hasOwnProperty.call(
        req.body,
        "salaryMax"
      )
    ) {
      job.salaryMax =
        req.body.salaryMax === "" ||
        req.body.salaryMax === null
          ? undefined
          : Number(req.body.salaryMax);
    }

    if (
      Object.prototype.hasOwnProperty.call(
        req.body,
        "experienceYears"
      )
    ) {
      job.experienceYears =
        req.body.experienceYears === ""
          ? 0
          : Number(
              req.body.experienceYears
            );
    }

    if (
      Object.prototype.hasOwnProperty.call(
        req.body,
        "deadline"
      )
    ) {
      job.deadline =
        req.body.deadline || undefined;
    }

    const updatedJob = await job.save();

    const populatedJob =
      await Job.findById(updatedJob._id)
        .populate(
          "company",
          "name logo location industry"
        )
        .populate(
          "recruiter",
          "name email"
        );

    return res.status(200).json({
      message:
        "Job updated successfully.",
      job: populatedJob,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete recruiter-owned job
 * @route   DELETE /api/jobs/:id
 * @access  Recruiter
 */
export const deleteJob = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      return res.status(400).json({
        message: "Invalid job ID.",
      });
    }

    const job = await Job.findOne({
      _id: id,
      recruiter: req.user._id,
    });

    if (!job) {
      return res.status(404).json({
        message:
          "Job not found or you do not have permission to delete it.",
      });
    }

    const applicationCount =
      await Application.countDocuments({
        job: job._id,
      });

    if (applicationCount > 0) {
      return res.status(400).json({
        message:
          "This job already has applications. Close the job instead of deleting it.",
      });
    }

    await job.deleteOne();

    return res.status(200).json({
      message:
        "Job deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};