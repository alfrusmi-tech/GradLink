import {
  useEffect,
  useRef,
  useState,
} from "react";

import { Link } from "react-router-dom";
import api from "../services/api";

const MAX_FILE_SIZE =
  5 * 1024 * 1024;

const UploadCV = () => {
  const fileInputRef = useRef(null);

  const [cv, setCv] = useState(null);
  const [file, setFile] = useState(null);

  const [loading, setLoading] =
    useState(true);

  const [uploading, setUploading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const serverURL =
    import.meta.env.VITE_SERVER_URL ||
    "http://localhost:5000";

  const fetchCV = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await api.get("/cv/me");

      setCv(response.data);
    } catch (requestError) {
      if (
        requestError.response?.status ===
        404
      ) {
        setCv(null);
      } else {
        setError(
          requestError.response?.data
            ?.message ||
            "Could not load your CV."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCV();
  }, []);

  const handleFileChange = (
    event
  ) => {
    setError("");
    setSuccess("");

    const selectedFile =
      event.target.files?.[0];

    if (!selectedFile) {
      setFile(null);
      return;
    }

    if (
      selectedFile.type !==
      "application/pdf"
    ) {
      setFile(null);
      event.target.value = "";

      setError(
        "Please select a PDF file."
      );

      return;
    }

    if (
      selectedFile.size >
      MAX_FILE_SIZE
    ) {
      setFile(null);
      event.target.value = "";

      setError(
        "The PDF must be smaller than 5 MB."
      );

      return;
    }

    setFile(selectedFile);
  };

  const handleUpload = async (
    event
  ) => {
    event.preventDefault();

    if (!file) {
      setError(
        "Please select a PDF file."
      );

      return;
    }

    try {
      setUploading(true);
      setError("");
      setSuccess("");

      const formData =
        new FormData();

      formData.append("cv", file);

      const response = await api.post(
        "/cv/upload",
        formData
      );

      setCv(response.data.cv);

      setSuccess(
        response.data.message ||
          "CV uploaded successfully."
      );

      setFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value =
          "";
      }
    } catch (requestError) {
      setError(
        requestError.response?.data
          ?.message ||
          "CV upload failed."
      );
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="h-10 w-10 mx-auto rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />

          <p className="mt-3 text-sm text-gray-500">
            Loading your CV...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-7">
        <h1 className="text-3xl font-bold text-gray-900">
          Your CV
        </h1>

        <p className="mt-2 text-gray-600">
          Upload a PDF CV to extract
          skills and compare it with
          available jobs.
        </p>
      </div>

      {error && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {success}
        </div>
      )}

      <form
        onSubmit={handleUpload}
        className="mb-7 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
      >
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-gray-900">
            {cv
              ? "Replace your current CV"
              : "Upload your CV"}
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            PDF only. Maximum size:
            5 MB.
          </p>
        </div>

        <label className="block rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-6 text-center hover:border-indigo-400">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={
              handleFileChange
            }
            className="hidden"
          />

          <span className="block font-medium text-indigo-600">
            Select PDF CV
          </span>

          <span className="mt-2 block text-sm text-gray-500">
            {file
              ? file.name
              : "Click here to choose a file"}
          </span>
        </label>

        {file && (
          <div className="mt-4 rounded-lg bg-indigo-50 p-3">
            <p className="text-sm font-medium text-indigo-800">
              Selected file:
              {" "}
              {file.name}
            </p>

            <p className="mt-1 text-xs text-indigo-600">
              Size:
              {" "}
              {(
                file.size /
                1024 /
                1024
              ).toFixed(2)}
              {" "}
              MB
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={
            !file || uploading
          }
          className="mt-5 w-full rounded-lg bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {uploading
            ? "Uploading and reading CV..."
            : cv
              ? "Replace CV"
              : "Upload CV"}
        </button>
      </form>

      {cv ? (
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
                Current CV
              </p>

              <h2 className="mt-1 text-lg font-semibold text-gray-900">
                {cv.fileName}
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Uploaded:
                {" "}
                {new Date(
                  cv.updatedAt ||
                    cv.createdAt
                ).toLocaleDateString()}
              </p>
            </div>

            <a
              href={`${serverURL}${cv.fileUrl}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex justify-center rounded-lg border border-indigo-200 px-4 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-50"
            >
              View PDF
            </a>
          </div>

          <div className="mt-6">
            <h3 className="text-sm font-semibold text-gray-900">
              Extracted skills
            </h3>

            {cv.extractedSkills
              ?.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {cv.extractedSkills.map(
                  (skill) => (
                    <span
                      key={skill}
                      className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700"
                    >
                      {skill}
                    </span>
                  )
                )}
              </div>
            ) : (
              <p className="mt-2 text-sm text-gray-500">
                No common technical
                skills were detected.
                Make sure your CV has a
                clear skills section.
              </p>
            )}
          </div>

          {cv.extractedEducation
            ?.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-gray-900">
                Education information
              </h3>

              <ul className="mt-3 space-y-2">
                {cv.extractedEducation.map(
                  (item, index) => (
                    <li
                      key={`${item}-${index}`}
                      className="rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-600"
                    >
                      {item}
                    </li>
                  )
                )}
              </ul>
            </div>
          )}

          {cv.extractedExperience
            ?.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-gray-900">
                Experience information
              </h3>

              <ul className="mt-3 space-y-2">
                {cv.extractedExperience.map(
                  (item, index) => (
                    <li
                      key={`${item}-${index}`}
                      className="rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-600"
                    >
                      {item}
                    </li>
                  )
                )}
              </ul>
            </div>
          )}

          <Link
            to="/cv-analysis"
            className="mt-7 inline-flex rounded-lg bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Analyze CV against a job
          </Link>
        </section>
      ) : (
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">
            No CV uploaded
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Select a PDF above to start
            using GradLink CV analysis.
          </p>
        </div>
      )}
    </div>
  );
};

export default UploadCV;