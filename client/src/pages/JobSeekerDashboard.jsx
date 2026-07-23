import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

const statusColors = {
  pending: "bg-yellow-50 text-yellow-700",
  shortlisted: "bg-blue-50 text-blue-700",
  accepted: "bg-green-50 text-green-700",
  rejected: "bg-red-50 text-red-700",
};

const JobSeekerDashboard = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/applications/me")
      .then((res) => {
        const data = res.data?.applications;
        setApplications(Array.isArray(data) ? data : []);
      })
      .catch(() => setError("Failed to load applications"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;

  const recent = applications.slice(0, 4);
  const counts = {
    pending: applications.filter((a) => a.status === "pending").length,
    shortlisted: applications.filter((a) => a.status === "shortlisted").length,
    accepted: applications.filter((a) => a.status === "accepted").length,
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="flex gap-2">
          <Link
            to="/upload-cv"
            className="border border-gray-300 text-gray-700 rounded-md px-4 py-2 text-sm font-medium hover:bg-gray-50"
          >
            Manage CV
          </Link>
          <Link
            to="/jobs"
            className="bg-indigo-600 text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-indigo-700"
          >
            Browse Jobs
          </Link>
        </div>
      </div>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-5 text-center">
          <p className="text-2xl font-bold text-gray-900">{applications.length}</p>
          <p className="text-xs text-gray-500 mt-1">Total Applications</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 text-center">
          <p className="text-2xl font-bold text-blue-700">{counts.shortlisted}</p>
          <p className="text-xs text-gray-500 mt-1">Shortlisted</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 text-center">
          <p className="text-2xl font-bold text-green-700">{counts.accepted}</p>
          <p className="text-xs text-gray-500 mt-1">Accepted</p>
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Recent Applications</h2>
        <Link to="/applications/history" className="text-sm font-medium text-indigo-600 hover:underline">
          See full history →
        </Link>
      </div>

      {recent.length === 0 ? (
        <p className="text-gray-500 text-center py-12">
          You haven't applied to any jobs yet.
        </p>
      ) : (
        <div className="space-y-3">
          {recent.map((app) => (
            <Link
              key={app._id}
              to={`/jobs/${app.job?._id}`}
              className="block bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-900">{app.job?.title}</p>
                  <p className="text-xs text-gray-500">{app.job?.company?.name}</p>
                </div>
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-full capitalize ${statusColors[app.status]}`}
                >
                  {app.status}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default JobSeekerDashboard;