import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [applyStatus, setApplyStatus] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    api
      .get(`/jobs/${id}`)
      .then((res) => setJob(res.data))
      .catch(() => setError("Job not found"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleApply = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate("/login");
      return;
    }
    setApplying(true);
    setApplyStatus("");
    try {
      await api.post("/applications", { jobId: id, coverLetter });
      setApplyStatus("success");
    } catch (err) {
      setApplyStatus(err.response?.data?.message || "Failed to apply");
    } finally {
      setApplying(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
            <p className="text-gray-600 mt-1">
              {job.company?.name} · {job.location}
            </p>
          </div>
          <span className="text-xs font-medium bg-indigo-50 text-indigo-700 px-2 py-1 rounded-full capitalize">
            {job.jobType}
          </span>
        </div>

        <div className="flex gap-4 mt-4 text-sm text-gray-500">
          <span className="capitalize">{job.experienceLevel} level</span>
          {job.salaryMin && job.salaryMax && (
            <span>
              ${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()}
            </span>
          )}
          {job.deadline && <span>Deadline: {new Date(job.deadline).toLocaleDateString()}</span>}
        </div>

        <div className="mt-6">
          <h2 className="font-semibold text-gray-900 mb-2">Description</h2>
          <p className="text-gray-700 whitespace-pre-line">{job.description}</p>
        </div>

        {job.responsibilities?.length > 0 && (
          <div className="mt-6">
            <h2 className="font-semibold text-gray-900 mb-2">Responsibilities</h2>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              {job.responsibilities.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-6">
          <h2 className="font-semibold text-gray-900 mb-2">Required Skills</h2>
          <div className="flex flex-wrap gap-2">
            {job.requiredSkills?.map((skill) => (
              <span key={skill} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                {skill}
              </span>
            ))}
          </div>
        </div>

        {job.preferredSkills?.length > 0 && (
          <div className="mt-4">
            <h2 className="font-semibold text-gray-900 mb-2">Preferred Skills</h2>
            <div className="flex flex-wrap gap-2">
              {job.preferredSkills.map((skill) => (
                <span key={skill} className="text-xs bg-gray-50 text-gray-500 px-2 py-1 rounded-full">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Only jobseekers see the apply form; recruiters/others don't */}
        {(!user || user.role === "jobseeker") && (
          <div className="mt-8 border-t border-gray-100 pt-6">
            {applyStatus === "success" ? (
              <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-md p-3">
                Application submitted successfully!
              </div>
            ) : (
              <form onSubmit={handleApply} className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Cover letter (optional)
                </label>
                <textarea
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  rows={4}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Tell them why you're a great fit..."
                />
                {applyStatus && applyStatus !== "success" && (
                  <p className="text-sm text-red-600">{applyStatus}</p>
                )}
                <button
                  type="submit"
                  disabled={applying}
                  className="bg-indigo-600 text-white rounded-md px-5 py-2 font-medium hover:bg-indigo-700 disabled:opacity-50"
                >
                  {applying ? "Applying..." : user ? "Apply Now" : "Log in to Apply"}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default JobDetails;