import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

const UploadCV = () => {
  const [cv, setCv] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [file, setFile] = useState(null);

  const fetchCV = () => {
    api
      .get("/cv/me")
      .then((res) => setCv(res.data))
      .catch(() => setCv(null))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCV();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setError("");

    const formData = new FormData();
    formData.append("cv", file);

    try {
      await api.post("/cv/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setFile(null);
      fetchCV();
    } catch (err) {
      setError(err.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Your CV</h1>

      {error && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
          {error}
        </div>
      )}

      <form
        onSubmit={handleUpload}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6"
      >
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {cv ? "Upload a new CV (replaces the current one)" : "Upload your CV (PDF only)"}
        </label>
        <div className="flex gap-3">
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setFile(e.target.files[0])}
            className="flex-1 text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-indigo-50 file:text-indigo-700 file:text-sm file:font-medium hover:file:bg-indigo-100"
          />
          <button
            type="submit"
            disabled={!file || uploading}
            className="bg-indigo-600 text-white rounded-md px-5 py-2 text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
          >
            {uploading ? "Uploading..." : "Upload"}
          </button>
        </div>
      </form>

      {cv && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="font-semibold text-gray-900">{cv.fileName}</h2>
              <p className="text-xs text-gray-400">
                Uploaded {new Date(cv.createdAt).toLocaleDateString()}
              </p>
            </div>
            
            <a
              href={`http://localhost:5000${cv.fileUrl}`}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-medium text-indigo-600 hover:underline"
            >
              View PDF
            </a>
          </div>

          {cv.extractedSkills?.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Extracted Skills</h3>
              <div className="flex flex-wrap gap-2">
                {cv.extractedSkills.map((skill) => (
                  <span key={skill} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {cv.extractedEducation?.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Extracted Education</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                {cv.extractedEducation.map((line, i) => (
                  <li key={i}>{line}</li>
                ))}
              </ul>
            </div>
          )}

          <Link
            to="/cv-analysis"
            className="inline-block mt-2 text-sm font-medium text-indigo-600 hover:underline"
          >
            Check your match against a job
          </Link>
        </div>
      )}

      {!cv && !loading && (
        <p className="text-sm text-gray-500">
          Upload a CV to start seeing match scores on job listings.
        </p>
      )}
    </div>
  );
};

export default UploadCV;