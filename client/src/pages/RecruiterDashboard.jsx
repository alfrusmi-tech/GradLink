import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

const RecruiterDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchJobs = () => {
    api
      .get("/jobs/my-jobs")
      .then((res) => setJobs(res.data))
      .catch(() => setError("Failed to load your jobs"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Your Job Postings</h1>
        <div className="flex gap-2">
          <Link
            to="/recruiter/company"
            className="border border-gray-300 text-gray-700 rounded-md px-4 py-2 text-sm font-medium hover:bg-gray-50"
          >
            Company Profile
          </Link>
          <Link
            to="/recruiter/jobs/new"
            className="bg-indigo-600 text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-indigo-700"
          >
            + Post a Job
          </Link>
        </div>
      </div>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      {jobs.length === 0 ? (
        <p className="text-gray-500 text-center py-12">
          You haven't posted any jobs yet.
        </p>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <div
              key={job._id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-5"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{job.title}</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {job.location} · {job.jobType}
                  </p>
                </div>
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-full capitalize ${
                    job.status === "open"
                      ? "bg-green-50 text-green-700"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {job.status}
                </span>
              </div>

              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-gray-500">
                  {job.applicantsCount} applicant{job.applicantsCount !== 1 ? "s" : ""}
                </p>
                <Link
                  to={`/recruiter/jobs/${job._id}/applicants`}
                  className="text-sm font-medium text-indigo-600 hover:underline"
                >
                  View Applicants →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecruiterDashboard;