import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import api from "../services/api";

const CVAnalysis = () => {
  const [searchParams] = useSearchParams();
  const preselectedJobId = searchParams.get("jobId");

  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState(preselectedJobId || "");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/jobs")
      .then((res) => setJobs(res.data))
      .catch(() => setError("Failed to load jobs"))
      .finally(() => setLoading(false));
  }, []);

  const runAnalysis = async (jobId) => {
    if (!jobId) return;
    setAnalyzing(true);
    setError("");
    setResult(null);
    try {
      const res = await api.post(`/cv/analyze/${jobId}`);
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Analysis failed");
    } finally {
      setAnalyzing(false);
    }
  };

  useEffect(() => {
    if (preselectedJobId) runAnalysis(preselectedJobId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preselectedJobId]);

  const handleJobChange = (e) => {
    const jobId = e.target.value;
    setSelectedJobId(jobId);
    runAnalysis(jobId);
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">CV Match Analysis</h1>
      <p className="text-sm text-gray-500 mb-6">
        Pick a job to see how well your uploaded CV matches its required skills.
      </p>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select a job</label>
        <select
          value={selectedJobId}
          onChange={handleJobChange}
          className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Choose a job...</option>
          {jobs.map((job) => (
            <option key={job._id} value={job._id}>
              {job.title} — {job.company?.name || "Unknown Company"}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
          {error}
        </div>
      )}

      {analyzing && <p className="text-center text-gray-500">Analyzing...</p>}

      {result && !analyzing && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
              <div
                className="bg-indigo-600 h-3 rounded-full transition-all"
                style={{ width: `${result.matchPercentage}%` }}
              />
            </div>
            <span className="text-lg font-semibold text-gray-900">
              {result.matchPercentage}%
            </span>
          </div>

          {result.matchedSkills?.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Matched Skills</h3>
              <div className="flex flex-wrap gap-2">
                {result.matchedSkills.map((skill) => (
                  <span
                    key={skill}
                    className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {result.missingSkills?.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Missing Skills</h3>
              <div className="flex flex-wrap gap-2">
                {result.missingSkills.map((skill) => (
                  <span
                    key={skill}
                    className="text-xs bg-red-50 text-red-700 px-2 py-1 rounded-full"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {result.suggestions?.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Suggestions</h3>
              <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                {result.suggestions.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          )}

          <Link
            to={`/jobs/${selectedJobId}`}
            className="inline-block mt-5 text-sm font-medium text-indigo-600 hover:underline"
          >
            View job & apply →
          </Link>
        </div>
      )}

      {!result && !analyzing && !error && selectedJobId === "" && (
        <p className="text-gray-400 text-center py-8">
          Select a job above to see your match.
        </p>
      )}
    </div>
  );
};

export default CVAnalysis;