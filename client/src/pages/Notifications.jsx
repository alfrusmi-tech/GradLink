import { useState, useEffect } from "react";
import api from "../services/api";

const typeLabels = {
  application_submitted: "New Application",
  application_reviewed: "Application Reviewed",
  application_accepted: "Application Accepted",
  application_rejected: "Application Rejected",
  new_job_posted: "New Job Posted",
};

const typeColors = {
  application_submitted: "bg-blue-50 text-blue-700",
  application_reviewed: "bg-yellow-50 text-yellow-700",
  application_accepted: "bg-green-50 text-green-700",
  application_rejected: "bg-red-50 text-red-700",
  new_job_posted: "bg-indigo-50 text-indigo-700",
};

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchNotifications = () => {
    api
      .get("/notifications")
      .then((res) => setNotifications(res.data))
      .catch(() => setError("Failed to load notifications"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
    } catch {
      // non-critical, fail silently
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Notifications</h1>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      {notifications.length === 0 ? (
        <p className="text-gray-500 text-center py-12">You have no notifications yet.</p>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n._id}
              onClick={() => !n.read && markAsRead(n._id)}
              className={`bg-white rounded-xl border p-4 cursor-pointer transition ${
                n.read ? "border-gray-200" : "border-indigo-200 bg-indigo-50/30"
              }`}
            >
              <div className="flex justify-between items-start">
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-full ${
                    typeColors[n.type] || "bg-gray-100 text-gray-600"
                  }`}
                >
                  {typeLabels[n.type] || n.type}
                </span>
                {!n.read && <span className="w-2 h-2 rounded-full bg-indigo-600 mt-1" />}
              </div>
              <p className="text-sm text-gray-700 mt-2">{n.message}</p>
              <p className="text-xs text-gray-400 mt-2">
                {new Date(n.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;