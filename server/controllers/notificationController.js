import mongoose from "mongoose";
import Notification from "../models/Notification.js";

/**
 * @desc    Get logged-in user's notifications
 * @route   GET /api/notifications
 * @access  Private
 */
export const getMyNotifications = async (
  req,
  res,
  next
) => {
  try {
    const {
      page = 1,
      limit = 20,
      unreadOnly = "false",
    } = req.query;

    const pageNumber = Math.max(
      Number.parseInt(page, 10) || 1,
      1
    );

    const limitNumber = Math.min(
      Math.max(
        Number.parseInt(limit, 10) || 20,
        1
      ),
      100
    );

    const filter = {
      user: req.user._id,
    };

    if (unreadOnly === "true") {
      filter.isRead = false;
    }

    const skip =
      (pageNumber - 1) * limitNumber;

    const [
      notifications,
      totalNotifications,
      unreadCount,
    ] = await Promise.all([
      Notification.find(filter)
        .populate({
          path: "relatedJob",
          select:
            "title location jobType status",
          populate: {
            path: "company",
            select: "name logo",
          },
        })
        .populate({
          path: "relatedApplication",
          select:
            "status matchScoreAtApply applicant",
        })
        .sort({
          createdAt: -1,
        })
        .skip(skip)
        .limit(limitNumber),

      Notification.countDocuments(filter),

      Notification.countDocuments({
        user: req.user._id,
        isRead: false,
      }),
    ]);

    const totalPages = Math.max(
      Math.ceil(
        totalNotifications / limitNumber
      ),
      1
    );

    return res.status(200).json({
      notifications,
      unreadCount,
      pagination: {
        currentPage: pageNumber,
        totalPages,
        totalNotifications,
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

/**
 * @desc    Get unread notification count
 * @route   GET /api/notifications/unread-count
 * @access  Private
 */
export const getUnreadNotificationCount =
  async (req, res, next) => {
    try {
      const unreadCount =
        await Notification.countDocuments({
          user: req.user._id,
          isRead: false,
        });

      return res.status(200).json({
        unreadCount,
      });
    } catch (error) {
      next(error);
    }
  };

/**
 * @desc    Mark one notification as read
 * @route   PUT /api/notifications/:id/read
 * @access  Private
 */
export const markNotificationAsRead =
  async (req, res, next) => {
    try {
      const { id } = req.params;

      if (
        !mongoose.Types.ObjectId.isValid(id)
      ) {
        return res.status(400).json({
          message:
            "Invalid notification ID.",
        });
      }

      const notification =
        await Notification.findOne({
          _id: id,
          user: req.user._id,
        });

      if (!notification) {
        return res.status(404).json({
          message:
            "Notification not found.",
        });
      }

      if (!notification.isRead) {
        notification.isRead = true;
        notification.readAt = new Date();

        await notification.save();
      }

      return res.status(200).json({
        message:
          "Notification marked as read.",
        notification,
      });
    } catch (error) {
      next(error);
    }
  };

/**
 * @desc    Mark all user's notifications as read
 * @route   PUT /api/notifications/read-all
 * @access  Private
 */
export const markAllNotificationsAsRead =
  async (req, res, next) => {
    try {
      const result =
        await Notification.updateMany(
          {
            user: req.user._id,
            isRead: false,
          },
          {
            $set: {
              isRead: true,
              readAt: new Date(),
            },
          }
        );

      return res.status(200).json({
        message:
          "All notifications marked as read.",
        updatedCount:
          result.modifiedCount || 0,
      });
    } catch (error) {
      next(error);
    }
  };

/**
 * @desc    Delete one notification
 * @route   DELETE /api/notifications/:id
 * @access  Private
 */
export const deleteNotification = async (
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
        message:
          "Invalid notification ID.",
      });
    }

    const notification =
      await Notification.findOneAndDelete({
        _id: id,
        user: req.user._id,
      });

    if (!notification) {
      return res.status(404).json({
        message:
          "Notification not found.",
      });
    }

    return res.status(200).json({
      message:
        "Notification deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete all user's notifications
 * @route   DELETE /api/notifications
 * @access  Private
 */
export const deleteAllNotifications =
  async (req, res, next) => {
    try {
      const result =
        await Notification.deleteMany({
          user: req.user._id,
        });

      return res.status(200).json({
        message:
          "All notifications deleted successfully.",
        deletedCount:
          result.deletedCount || 0,
      });
    } catch (error) {
      next(error);
    }
  };