import Job from "../models/Job.js";

// CREATE JOB (recruiter)
export const createJob = async (req, res, next) => {
  try {
    // Recruiter must have a company profile before posting jobs
    if (!req.user.company) {
      return res.status(400).json({
        message: "You must create a company profile before posting a job",
      });
    }

    const job = await Job.create({
      title: req.body.title,
      description: req.body.description,
      responsibilities: req.body.responsibilities,
      requiredSkills: req.body.requiredSkills,
      preferredSkills: req.body.preferredSkills,
      experienceLevel: req.body.experienceLevel,
      experienceYears: req.body.experienceYears,
      location: req.body.location,
      jobType: req.body.jobType,
      salaryMin: req.body.salaryMin,
      salaryMax: req.body.salaryMax,
      education: req.body.education,
      deadline: req.body.deadline,
      company: req.user.company,   // trusted source, not req.body
      recruiter: req.user._id,     // trusted source, not req.body
    });

    res.status(201).json(job);
  } catch (error) {
    next(error);
  }
};

// GET ALL JOBS
export const getJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find().populate("company recruiter");
    res.json(jobs);
  } catch (error) {
    next(error);
  }
};

// GET SINGLE JOB
export const getJobById = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id).populate("company recruiter");

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    res.json(job);
  } catch (error) {
    next(error);
  }
};