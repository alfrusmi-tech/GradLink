import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

const statusColors = {
  pending: "bg-yellow-50 text-yellow-700",
  shortlisted: "bg-blue-50 text-blue-700",
  accepted: "bg-green-50 text-green-700",
  rejected: "bg-red-50 text-red-700",
};

const FILTERS = ["all", "pending", "shortlisted", "accepted", "rejected"];

const ApplicationHistory = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    api
      .get("/applications/me")
      .then((res) => setApplications(res.data))
      .catch(() => setError("Failed to load application history"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;

  const filtered =
    filter === "all" ? applications : applications.filter((a) => a.status === filter);

  const counts = FILTERS.reduce((acc, f) => {
    acc[f] = f === "all" ? applications.length : applications.filter((a) => a.status === f).length;
    return acc;
  }, {});

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Application History</h1>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      <div className="flex flex-wrap gap-2 mb-6">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-sm font-medium px-3 py-1.5 rounded-full border capitalize transition ${
              filter === f
                ? "bg-indigo-600 text-white border-indigo-600"
                : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
            }`}
          >
            {f} ({counts[f]})
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-gray-500 text-center py-12">
          {filter === "all"
            ? "You haven't applied to any jobs yet."
            : `No applications with status "${filter}".`}
        </p>
      ) : (
        <div className="space-y-4">
          {filtered.map((app) => (
            <div
              key={app._id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-5"
            >
              <div className="flex justify-between items-start">
                <div>
                  <Link
                    to={`/jobs/${app.job?._id}`}
                    className="font-semibold text-gray-900 hover:text-indigo-600"
                  >
                    {app.job?.title}
                  </Link>
                  <p className="text-sm text-gray-600 mt-1">
                    {app.job?.company?.name} · {app.job?.company?.location}
                  </p>
                </div>
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-full capitalize ${statusColors[app.status]}`}
                >
                  {app.status}
                </span>
              </div>

              {app.coverLetter && (
                <p className="text-sm text-gray-600 mt-3 italic line-clamp-2">
                  "{app.coverLetter}"
                </p>
              )}

              <div className="flex items-center justify-between mt-4 text-xs text-gray-400">
                <span>Applied {new Date(app.createdAt).toLocaleDateString()}</span>
                {app.statusHistory?.length > 1 && (
                  <span>
                    Last update{" "}
                    {new Date(
                      app.statusHistory[app.statusHistory.length - 1].changedAt
                    ).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ApplicationHistory;