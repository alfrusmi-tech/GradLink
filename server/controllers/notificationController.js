import Notification from "../models/Notification.js";

// LIST OWN NOTIFICATIONS
export const getMyNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ user: req.user._id })
      .populate("relatedJob", "title")
      .sort({ createdAt: -1 });

    res.json(notifications);
  } catch (error) {
    next(error);
  }
};

// MARK AS READ
export const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    if (notification.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to update this notification" });
    }

    notification.isRead = true;
    await notification.save();

    res.json(notification);
  } catch (error) {
    next(error);
  }
};