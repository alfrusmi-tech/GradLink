import {
  useEffect,
  useState,
} from "react";

import api from "../services/api";

const typeLabels = {
  application_submitted:
    "New Application",
  application_reviewed:
    "Application Reviewed",
  application_shortlisted:
    "Application Shortlisted",
  application_accepted:
    "Application Accepted",
  application_rejected:
    "Application Rejected",
  new_job_posted:
    "New Job Posted",
  general:
    "Notification",
};

const typeColors = {
  application_submitted:
    "bg-blue-50 text-blue-700",
  application_reviewed:
    "bg-yellow-50 text-yellow-700",
  application_shortlisted:
    "bg-purple-50 text-purple-700",
  application_accepted:
    "bg-green-50 text-green-700",
  application_rejected:
    "bg-red-50 text-red-700",
  new_job_posted:
    "bg-indigo-50 text-indigo-700",
  general:
    "bg-gray-100 text-gray-700",
};

const Notifications = () => {
  const [
    notifications,
    setNotifications,
  ] = useState([]);

  const [
    unreadCount,
    setUnreadCount,
  ] = useState(0);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [
    actionLoading,
    setActionLoading,
  ] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadNotifications =
      async () => {
        try {
          setLoading(true);
          setError("");

          const response =
            await api.get(
              "/notifications?limit=50"
            );

          if (!cancelled) {
            setNotifications(
              response.data.notifications ||
                []
            );

            setUnreadCount(
              response.data.unreadCount || 0
            );
          }
        } catch (error) {
          if (!cancelled) {
            setError(
              error.response?.data
                ?.message ||
                "Failed to load notifications."
            );
          }
        } finally {
          if (!cancelled) {
            setLoading(false);
          }
        }
      };

    loadNotifications();

    return () => {
      cancelled = true;
    };
  }, []);

  const markAsRead = async (id) => {
    const selectedNotification =
      notifications.find(
        (notification) =>
          notification._id === id
      );

    if (
      !selectedNotification ||
      selectedNotification.isRead
    ) {
      return;
    }

    try {
      await api.put(
        `/notifications/${id}/read`
      );

      setNotifications((previous) =>
        previous.map((notification) =>
          notification._id === id
            ? {
                ...notification,
                isRead: true,
                readAt:
                  new Date().toISOString(),
              }
            : notification
        )
      );

      setUnreadCount((previous) =>
        Math.max(previous - 1, 0)
      );
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Could not mark notification as read."
      );
    }
  };

  const markAllAsRead = async () => {
    try {
      setActionLoading(true);
      setError("");

      await api.put(
        "/notifications/read-all"
      );

      setNotifications((previous) =>
        previous.map((notification) => ({
          ...notification,
          isRead: true,
          readAt:
            notification.readAt ||
            new Date().toISOString(),
        }))
      );

      setUnreadCount(0);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Could not mark all notifications as read."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const deleteOneNotification =
    async (id) => {
      const notificationToDelete =
        notifications.find(
          (notification) =>
            notification._id === id
        );

      try {
        await api.delete(
          `/notifications/${id}`
        );

        setNotifications((previous) =>
          previous.filter(
            (notification) =>
              notification._id !== id
          )
        );

        if (
          notificationToDelete &&
          !notificationToDelete.isRead
        ) {
          setUnreadCount((previous) =>
            Math.max(previous - 1, 0)
          );
        }
      } catch (error) {
        setError(
          error.response?.data?.message ||
            "Could not delete notification."
        );
      }
    };

  const deleteAllNotifications =
    async () => {
      const confirmed =
        window.confirm(
          "Are you sure you want to delete all notifications?"
        );

      if (!confirmed) {
        return;
      }

      try {
        setActionLoading(true);
        setError("");

        await api.delete(
          "/notifications"
        );

        setNotifications([]);
        setUnreadCount(0);
      } catch (error) {
        setError(
          error.response?.data?.message ||
            "Could not delete all notifications."
        );
      } finally {
        setActionLoading(false);
      }
    };

  const formatDate = (dateValue) => {
    if (!dateValue) {
      return "";
    }

    return new Date(
      dateValue
    ).toLocaleString();
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500">
        Loading notifications...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Notifications
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            {unreadCount > 0
              ? `${unreadCount} unread notification${
                  unreadCount === 1
                    ? ""
                    : "s"
                }`
              : "You have no unread notifications"}
          </p>
        </div>

        {notifications.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                disabled={actionLoading}
                className="rounded-lg border border-indigo-200 px-4 py-2 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Mark all as read
              </button>
            )}

            <button
              type="button"
              onClick={
                deleteAllNotifications
              }
              disabled={actionLoading}
              className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Delete all
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {notifications.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white py-14 text-center">
          <div className="text-4xl">
            🔔
          </div>

          <h2 className="mt-3 text-lg font-semibold text-gray-900">
            No notifications yet
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            New application and job
            updates will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map(
            (notification) => (
              <div
                key={notification._id}
                className={`rounded-xl border p-4 transition ${
                  notification.isRead
                    ? "border-gray-200 bg-white"
                    : "border-indigo-200 bg-indigo-50/50"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <button
                    type="button"
                    onClick={() =>
                      markAsRead(
                        notification._id
                      )
                    }
                    className="flex-1 text-left"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${
                          typeColors[
                            notification
                              .type
                          ] ||
                          "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {typeLabels[
                          notification
                            .type
                        ] ||
                          notification.type}
                      </span>

                      {!notification.isRead && (
                        <span
                          className="mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-indigo-600"
                          aria-label="Unread"
                        />
                      )}
                    </div>

                    <p className="mt-3 text-sm text-gray-700">
                      {
                        notification.message
                      }
                    </p>

                    {notification
                      .relatedJob?.title && (
                      <p className="mt-2 text-sm font-semibold text-indigo-700">
                        {
                          notification
                            .relatedJob
                            .title
                        }
                      </p>
                    )}

                    <p className="mt-2 text-xs text-gray-400">
                      {formatDate(
                        notification.createdAt
                      )}
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      deleteOneNotification(
                        notification._id
                      )
                    }
                    className="rounded-lg px-2 py-1 text-sm text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                    aria-label="Delete notification"
                    title="Delete notification"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default Notifications;