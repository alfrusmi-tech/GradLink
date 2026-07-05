import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    api
      .get("/jobs")
      .then((res) => setJobs(res.data))
      .catch(() => setError("Failed to load jobs"))
      .finally(() => setLoading(false));
  }, []);

  const filteredJobs = jobs.filter((job) =>
    job.title.toLowerCase().includes(search.toLowerCase()) ||
    job.location.toLowerCase().includes(search.toLowerCase()) ||
    job.requiredSkills?.some((s) => s.toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) return <div className="p-8 text-center text-gray-500">Loading jobs...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Browse Jobs</h1>

      <input
        type="text"
        placeholder="Search by title, location, or skill..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full rounded-md border border-gray-300 px-4 py-2 mb-6 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />

      {filteredJobs.length === 0 ? (
        <p className="text-gray-500 text-center py-12">No jobs match your search.</p>
      ) : (
        <div className="space-y-4">
          {filteredJobs.map((job) => (
            <Link
              key={job._id}
              to={`/jobs/${job._id}`}
              className="block bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{job.title}</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {job.company?.name || "Unknown Company"} · {job.location}
                  </p>
                </div>
                <span className="text-xs font-medium bg-indigo-50 text-indigo-700 px-2 py-1 rounded-full capitalize">
                  {job.jobType}
                </span>
              </div>

              <div className="flex flex-wrap gap-2 mt-3">
                {job.requiredSkills?.slice(0, 5).map((skill) => (
                  <span
                    key={skill}
                    className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
                  >
                    {skill}
                  </span>
                ))}
              </div>

              <p className="text-xs text-gray-400 mt-3 capitalize">
                {job.experienceLevel} level
                {job.deadline && ` · Apply by ${new Date(job.deadline).toLocaleDateString()}`}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Jobs;
