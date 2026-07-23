import mongoose from "mongoose";

import User from "../models/User.js";
import Job from "../models/Job.js";
import Company from "../models/Company.js";
import Application from "../models/Application.js";
import Notification from "../models/Notification.js";

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

const isValidObjectId = (id) =>
  mongoose.Types.ObjectId.isValid(id);

const escapeRegex = (value = "") =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/*
|--------------------------------------------------------------------------
| Dashboard statistics
|--------------------------------------------------------------------------
| GET /api/admin/statistics
*/

export const getAdminStatistics = async (
  req,
  res,
  next
) => {
  try {
    const [
      totalUsers,
      totalJobSeekers,
      totalRecruiters,
      totalAdmins,
      activeUsers,
      disabledUsers,
      totalJobs,
      openJobs,
      closedJobs,
      draftJobs,
      totalCompanies,
      totalApplications,
      pendingApplications,
      shortlistedApplications,
      acceptedApplications,
      rejectedApplications,
      recentUsers,
      recentJobs,
    ] = await Promise.all([
      User.countDocuments(),

      User.countDocuments({
        role: "jobseeker",
      }),

      User.countDocuments({
        role: "recruiter",
      }),

      User.countDocuments({
        role: "admin",
      }),

      User.countDocuments({
        isActive: true,
      }),

      User.countDocuments({
        isActive: false,
      }),

      Job.countDocuments(),

      Job.countDocuments({
        status: "open",
      }),

      Job.countDocuments({
        status: "closed",
      }),

      Job.countDocuments({
        status: "draft",
      }),

      Company.countDocuments(),

      Application.countDocuments(),

      Application.countDocuments({
        status: "pending",
      }),

      Application.countDocuments({
        status: "shortlisted",
      }),

      Application.countDocuments({
        status: "accepted",
      }),

      Application.countDocuments({
        status: "rejected",
      }),

      User.find()
        .select(
          "name email role isActive createdAt"
        )
        .sort({
          createdAt: -1,
        })
        .limit(5),

      Job.find()
        .select(
          "title status location jobType applicantsCount createdAt company recruiter"
        )
        .populate(
          "company",
          "name logo"
        )
        .populate(
          "recruiter",
          "name email"
        )
        .sort({
          createdAt: -1,
        })
        .limit(5),
    ]);

    return res.status(200).json({
      users: {
        total: totalUsers,
        jobSeekers: totalJobSeekers,
        recruiters: totalRecruiters,
        admins: totalAdmins,
        active: activeUsers,
        disabled: disabledUsers,
      },

      jobs: {
        total: totalJobs,
        open: openJobs,
        closed: closedJobs,
        draft: draftJobs,
      },

      companies: {
        total: totalCompanies,
      },

      applications: {
        total: totalApplications,
        pending: pendingApplications,
        shortlisted:
          shortlistedApplications,
        accepted: acceptedApplications,
        rejected: rejectedApplications,
      },

      recentUsers,
      recentJobs,
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| Get users
|--------------------------------------------------------------------------
| GET /api/admin/users
*/

export const getAdminUsers = async (
  req,
  res,
  next
) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      role = "",
      status = "",
    } = req.query;

    const pageNumber = Math.max(
      Number.parseInt(page, 10) || 1,
      1
    );

    const limitNumber = Math.min(
      Math.max(
        Number.parseInt(limit, 10) || 10,
        1
      ),
      100
    );

    const filter = {};

    if (
      ["admin", "recruiter", "jobseeker"].includes(
        role
      )
    ) {
      filter.role = role;
    }

    if (status === "active") {
      filter.isActive = true;
    }

    if (status === "disabled") {
      filter.isActive = false;
    }

    if (search.trim()) {
      const searchRegex = new RegExp(
        escapeRegex(search.trim()),
        "i"
      );

      filter.$or = [
        {
          name: searchRegex,
        },
        {
          email: searchRegex,
        },
      ];
    }

    const skip =
      (pageNumber - 1) * limitNumber;

    const [users, total] =
      await Promise.all([
        User.find(filter)
          .select(
            "-password -resetPasswordToken -resetPasswordExpires"
          )
          .populate(
            "company",
            "name logo"
          )
          .sort({
            createdAt: -1,
          })
          .skip(skip)
          .limit(limitNumber),

        User.countDocuments(filter),
      ]);

    const totalPages = Math.max(
      Math.ceil(total / limitNumber),
      1
    );

    return res.status(200).json({
      users,
      pagination: {
        currentPage: pageNumber,
        totalPages,
        total,
        limit: limitNumber,
        hasNextPage:
          pageNumber < totalPages,
        hasPreviousPage:
          pageNumber > 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| Enable or disable a user
|--------------------------------------------------------------------------
| PUT /api/admin/users/:id/status
*/

export const updateUserStatus = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid user ID.",
      });
    }

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        message:
          "isActive must be true or false.",
      });
    }

    if (
      id === req.user._id.toString()
    ) {
      return res.status(400).json({
        message:
          "You cannot disable your own admin account.",
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    user.isActive = isActive;

    await user.save();

    return res.status(200).json({
      message: isActive
        ? "User account enabled successfully."
        : "User account disabled successfully.",

      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| Change user role
|--------------------------------------------------------------------------
| PUT /api/admin/users/:id/role
*/

export const updateUserRole = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid user ID.",
      });
    }

    const allowedRoles = [
      "admin",
      "recruiter",
      "jobseeker",
    ];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        message: "Invalid user role.",
      });
    }

    if (
      id === req.user._id.toString() &&
      role !== "admin"
    ) {
      return res.status(400).json({
        message:
          "You cannot remove your own admin role.",
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    user.role = role;

    await user.save();

    return res.status(200).json({
      message:
        "User role updated successfully.",

      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| Delete user
|--------------------------------------------------------------------------
| DELETE /api/admin/users/:id
*/

export const deleteUser = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid user ID.",
      });
    }

    if (
      id === req.user._id.toString()
    ) {
      return res.status(400).json({
        message:
          "You cannot delete your own admin account.",
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    if (user.role === "recruiter") {
      const recruiterJobCount =
        await Job.countDocuments({
          recruiter: user._id,
        });

      if (recruiterJobCount > 0) {
        return res.status(400).json({
          message:
            "This recruiter owns job posts. Disable the account instead of deleting it.",
        });
      }

      const company = await Company.findOne({
        owner: user._id,
      });

      if (company) {
        return res.status(400).json({
          message:
            "This recruiter owns a company. Delete the company first or disable the account.",
        });
      }
    }

    if (user.role === "jobseeker") {
      const applicationCount =
        await Application.countDocuments({
          applicant: user._id,
        });

      if (applicationCount > 0) {
        return res.status(400).json({
          message:
            "This user has applications. Disable the account instead of deleting it.",
        });
      }
    }

    await Promise.all([
      Notification.deleteMany({
        user: user._id,
      }),

      User.findByIdAndDelete(user._id),
    ]);

    return res.status(200).json({
      message:
        "User deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| Get all jobs for admin
|--------------------------------------------------------------------------
| GET /api/admin/jobs
*/

export const getAdminJobs = async (
  req,
  res,
  next
) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      status = "",
    } = req.query;

    const pageNumber = Math.max(
      Number.parseInt(page, 10) || 1,
      1
    );

    const limitNumber = Math.min(
      Math.max(
        Number.parseInt(limit, 10) || 10,
        1
      ),
      100
    );

    const filter = {};

    if (
      ["open", "closed", "draft"].includes(
        status
      )
    ) {
      filter.status = status;
    }

    if (search.trim()) {
      filter.title = new RegExp(
        escapeRegex(search.trim()),
        "i"
      );
    }

    const skip =
      (pageNumber - 1) * limitNumber;

    const [jobs, total] =
      await Promise.all([
        Job.find(filter)
          .populate(
            "company",
            "name logo location"
          )
          .populate(
            "recruiter",
            "name email isActive"
          )
          .sort({
            createdAt: -1,
          })
          .skip(skip)
          .limit(limitNumber),

        Job.countDocuments(filter),
      ]);

    const totalPages = Math.max(
      Math.ceil(total / limitNumber),
      1
    );

    return res.status(200).json({
      jobs,
      pagination: {
        currentPage: pageNumber,
        totalPages,
        total,
        limit: limitNumber,
        hasNextPage:
          pageNumber < totalPages,
        hasPreviousPage:
          pageNumber > 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| Change job status
|--------------------------------------------------------------------------
| PUT /api/admin/jobs/:id/status
*/

export const updateAdminJobStatus =
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!isValidObjectId(id)) {
        return res.status(400).json({
          message: "Invalid job ID.",
        });
      }

      const allowedStatuses = [
        "open",
        "closed",
        "draft",
      ];

      if (
        !allowedStatuses.includes(status)
      ) {
        return res.status(400).json({
          message: "Invalid job status.",
        });
      }

      const job = await Job.findByIdAndUpdate(
        id,
        {
          status,
        },
        {
          new: true,
          runValidators: true,
        }
      )
        .populate(
          "company",
          "name logo location"
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

      return res.status(200).json({
        message:
          "Job status updated successfully.",
        job,
      });
    } catch (error) {
      next(error);
    }
  };

/*
|--------------------------------------------------------------------------
| Delete job
|--------------------------------------------------------------------------
| DELETE /api/admin/jobs/:id
*/

export const deleteAdminJob = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid job ID.",
      });
    }

    const job = await Job.findById(id);

    if (!job) {
      return res.status(404).json({
        message: "Job not found.",
      });
    }

    const applicationCount =
      await Application.countDocuments({
        job: job._id,
      });

    if (applicationCount > 0) {
      return res.status(400).json({
        message:
          "This job has applications. Close the job instead of deleting it.",
      });
    }

    await Promise.all([
      Notification.deleteMany({
        relatedJob: job._id,
      }),

      Job.findByIdAndDelete(job._id),
    ]);

    return res.status(200).json({
      message:
        "Job deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| Get companies
|--------------------------------------------------------------------------
| GET /api/admin/companies
*/

export const getAdminCompanies = async (
  req,
  res,
  next
) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
    } = req.query;

    const pageNumber = Math.max(
      Number.parseInt(page, 10) || 1,
      1
    );

    const limitNumber = Math.min(
      Math.max(
        Number.parseInt(limit, 10) || 10,
        1
      ),
      100
    );

    const filter = {};

    if (search.trim()) {
      const searchRegex = new RegExp(
        escapeRegex(search.trim()),
        "i"
      );

      filter.$or = [
        {
          name: searchRegex,
        },
        {
          industry: searchRegex,
        },
        {
          location: searchRegex,
        },
      ];
    }

    const skip =
      (pageNumber - 1) * limitNumber;

    const [companies, total] =
      await Promise.all([
        Company.find(filter)
          .populate(
            "owner",
            "name email isActive"
          )
          .sort({
            createdAt: -1,
          })
          .skip(skip)
          .limit(limitNumber),

        Company.countDocuments(filter),
      ]);

    const companyIds = companies.map(
      (company) => company._id
    );

    const jobCounts =
      await Job.aggregate([
        {
          $match: {
            company: {
              $in: companyIds,
            },
          },
        },
        {
          $group: {
            _id: "$company",
            count: {
              $sum: 1,
            },
          },
        },
      ]);

    const jobCountMap = new Map(
      jobCounts.map((item) => [
        item._id.toString(),
        item.count,
      ])
    );

    const companiesWithCounts =
      companies.map((company) => ({
        ...company.toObject(),

        jobsCount:
          jobCountMap.get(
            company._id.toString()
          ) || 0,
      }));

    const totalPages = Math.max(
      Math.ceil(total / limitNumber),
      1
    );

    return res.status(200).json({
      companies: companiesWithCounts,
      pagination: {
        currentPage: pageNumber,
        totalPages,
        total,
        limit: limitNumber,
        hasNextPage:
          pageNumber < totalPages,
        hasPreviousPage:
          pageNumber > 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| Delete company
|--------------------------------------------------------------------------
| DELETE /api/admin/companies/:id
*/

export const deleteAdminCompany =
  async (req, res, next) => {
    try {
      const { id } = req.params;

      if (!isValidObjectId(id)) {
        return res.status(400).json({
          message:
            "Invalid company ID.",
        });
      }

      const company =
        await Company.findById(id);

      if (!company) {
        return res.status(404).json({
          message:
            "Company not found.",
        });
      }

      const jobsCount =
        await Job.countDocuments({
          company: company._id,
        });

      if (jobsCount > 0) {
        return res.status(400).json({
          message:
              "This company still has job posts. Permanently delete those jobs before deleting the company.",
        });
      }

      await Promise.all([
        User.updateMany(
          {
            company: company._id,
          },
          {
            $unset: {
              company: 1,
            },
          }
        ),

        Company.findByIdAndDelete(
          company._id
        ),
      ]);

      return res.status(200).json({
        message:
          "Company deleted successfully.",
      });
    } catch (error) {
      next(error);
    }
  };
  