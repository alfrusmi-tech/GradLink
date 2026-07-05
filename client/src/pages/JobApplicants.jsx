import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";

const statusColors = {
  pending: "bg-yellow-50 text-yellow-700",
  shortlisted: "bg-blue-50 text-blue-700",
  accepted: "bg-green-50 text-green-700",
  rejected: "bg-red-50 text-red-700",
};

const JobApplicants = () => {
  const { jobId } = useParams();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const fetchApplicants = () => {
    api
      .get(`/applications/job/${jobId}`)
      .then((res) => setApplications(res.data))
      .catch(() => setError("Failed to load applicants"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchApplicants();
  }, [jobId]);

  const updateStatus = async (applicationId, status) => {
    setUpdatingId(applicationId);
    try {
      await api.put(`/applications/${applicationId}/status`, { status });
      fetchApplicants();
    } catch {
      setError("Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Applicants</h1>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      {applications.length === 0 ? (
        <p className="text-gray-500 text-center py-12">No applicants yet.</p>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <div
              key={app._id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-5"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="font-semibold text-gray-900">{app.applicant?.name}</h2>
                  <p className="text-sm text-gray-500">{app.applicant?.email}</p>
                </div>
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-full capitalize ${statusColors[app.status]}`}
                >
                  {app.status}
                </span>
              </div>

              {app.coverLetter && (
                <p className="text-sm text-gray-700 mt-3 italic">"{app.coverLetter}"</p>
              )}

              {app.applicant?.skills?.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {app.applicant.skills.map((skill) => (
                    <span key={skill} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                      {skill}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex gap-2 mt-4">
                {["shortlisted", "accepted", "rejected"].map((status) => (
                  <button
                    key={status}
                    onClick={() => updateStatus(app._id, status)}
                    disabled={updatingId === app._id || app.status === status}
                    className="text-xs font-medium border border-gray-300 rounded-md px-3 py-1.5 hover:bg-gray-50 disabled:opacity-40 capitalize"
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default JobApplicants;