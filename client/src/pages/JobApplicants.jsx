import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useParams,
} from "react-router-dom";

import api from "../services/api";

const statusColors = {
  pending:
    "bg-yellow-50 text-yellow-700 border-yellow-200",

  shortlisted:
    "bg-blue-50 text-blue-700 border-blue-200",

  accepted:
    "bg-green-50 text-green-700 border-green-200",

  rejected:
    "bg-red-50 text-red-700 border-red-200",
};

const JobApplicants = () => {
  const { jobId } = useParams();

  const [job, setJob] =
    useState(null);

  const [
    applications,
    setApplications,
  ] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [
    updatingId,
    setUpdatingId,
  ] = useState(null);

  const [
    downloadingId,
    setDownloadingId,
  ] = useState(null);

  const fetchApplicants = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        `/applications/job/${jobId}`
      );

      setJob(response.data.job);

      setApplications(
        response.data.applications || []
      );
    } catch (requestError) {
      setError(
        requestError.response?.data
          ?.message ||
          "Failed to load applicants."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicants();
  }, [jobId]);

  const updateStatus = async (
    applicationId,
    status
  ) => {
    try {
      setUpdatingId(
        applicationId
      );

      setError("");
      setSuccess("");

      const response = await api.put(
        `/applications/${applicationId}/status`,
        {
          status,
        }
      );

      setApplications(
        (currentApplications) =>
          currentApplications.map(
            (application) =>
              application._id ===
              applicationId
                ? response.data
                    .application
                : application
          )
      );

      setSuccess(
        response.data.message ||
          "Application status updated successfully."
      );
    } catch (requestError) {
      setError(
        requestError.response?.data
          ?.message ||
          "Failed to update status."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const downloadCV = async (
    application
  ) => {
    try {
      setDownloadingId(
        application._id
      );

      setError("");

      const response = await api.get(
        `/applications/${application._id}/cv`,
        {
          responseType: "blob",
        }
      );

      const fileBlob = new Blob(
        [response.data],
        {
          type:
            response.headers[
              "content-type"
            ] ||
            "application/pdf",
        }
      );

      const fileURL =
        window.URL.createObjectURL(
          fileBlob
        );

      const downloadLink =
        document.createElement("a");

      const applicantName =
        application.applicant?.name
          ?.replace(
            /[^a-zA-Z0-9-_ ]/g,
            ""
          )
          .replace(/\s+/g, "-") ||
        "Applicant";

      downloadLink.href = fileURL;

      downloadLink.download =
        `${applicantName}-CV.pdf`;

      document.body.appendChild(
        downloadLink
      );

      downloadLink.click();
      downloadLink.remove();

      window.URL.revokeObjectURL(
        fileURL
      );
    } catch (requestError) {
      setError(
        requestError.response?.data
          ?.message ||
          "Failed to download CV."
      );
    } finally {
      setDownloadingId(null);
    }
  };

  const formatDate = (
    dateValue
  ) => {
    if (!dateValue) {
      return "Not available";
    }

    return new Date(
      dateValue
    ).toLocaleDateString(
      "en-LK",
      {
        year: "numeric",
        month: "short",
        day: "numeric",
      }
    );
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500">
        Loading applicants...
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <Link
        to="/recruiter/jobs"
        className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
      >
        ← Back to My Jobs
      </Link>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Applicants
          </h1>

          {job && (
            <p className="mt-1 text-gray-500">
              {job.title}

              {job.company?.name
                ? ` · ${job.company.name}`
                : ""}
            </p>
          )}
        </div>

        <div className="w-fit rounded-xl bg-indigo-50 px-5 py-3">
          <p className="text-xs text-indigo-600">
            Total applicants
          </p>

          <p className="text-2xl font-bold text-indigo-800">
            {applications.length}
          </p>
        </div>
      </div>

      {error && (
        <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mt-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {success}
        </div>
      )}

      {applications.length ===
      0 ? (
        <div className="py-12 text-center text-gray-500">
          No applicants yet.
        </div>
      ) : (
        <div className="mt-7 space-y-4">
          {applications.map(
            (application) => {
              const applicant =
                application.applicant;

              const cv =
                application.cv;

              return (
                <article
                  key={
                    application._id
                  }
                  className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h2 className="font-semibold text-gray-900">
                        {applicant?.name ||
                          "Applicant"}
                      </h2>

                      <p className="mt-1 text-sm text-gray-500">
                        {applicant?.email ||
                          "Email unavailable"}
                      </p>

                      {applicant?.phone && (
                        <p className="mt-1 text-sm text-gray-500">
                          {
                            applicant.phone
                          }
                        </p>
                      )}

                      {applicant?.location && (
                        <p className="mt-1 text-sm text-gray-500">
                          {
                            applicant.location
                          }
                        </p>
                      )}
                    </div>

                    <span
                      className={`w-fit rounded-full border px-3 py-1 text-xs font-medium capitalize ${
                        statusColors[
                          application
                            .status
                        ] ||
                        "border-gray-200 bg-gray-50 text-gray-700"
                      }`}
                    >
                      {
                        application.status
                      }
                    </span>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-lg bg-gray-50 p-3">
                      <p className="text-xs text-gray-400">
                        Applied date
                      </p>

                      <p className="mt-1 text-sm font-medium text-gray-700">
                        {formatDate(
                          application.createdAt
                        )}
                      </p>
                    </div>

                    <div className="rounded-lg bg-gray-50 p-3">
                      <p className="text-xs text-gray-400">
                        CV match score
                      </p>

                      <p className="mt-1 text-sm font-medium text-gray-700">
                        {application.matchScoreAtApply ??
                          0}
                        %
                      </p>
                    </div>
                  </div>

                  {application.coverLetter && (
                    <div className="mt-4 rounded-lg bg-gray-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Cover letter
                      </p>

                      <p className="mt-2 whitespace-pre-line text-sm leading-6 text-gray-700">
                        {
                          application.coverLetter
                        }
                      </p>
                    </div>
                  )}

                  {cv?.extractedSkills
                    ?.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-semibold text-gray-900">
                        CV skills
                      </p>

                      <div className="mt-2 flex flex-wrap gap-2">
                        {cv.extractedSkills.map(
                          (skill) => (
                            <span
                              key={
                                skill
                              }
                              className="rounded-full bg-indigo-50 px-3 py-1 text-xs text-indigo-700"
                            >
                              {
                                skill
                              }
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  <div className="mt-5 flex flex-col gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                    <button
                      type="button"
                      onClick={() =>
                        downloadCV(
                          application
                        )
                      }
                      disabled={
                        downloadingId ===
                        application._id
                      }
                      className="rounded-lg border border-indigo-200 px-4 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {downloadingId ===
                      application._id
                        ? "Downloading..."
                        : "Download CV"}
                    </button>

                    <div className="flex flex-wrap gap-2">
                      {[
                        "pending",
                        "shortlisted",
                        "accepted",
                        "rejected",
                      ].map(
                        (status) => (
                          <button
                            key={
                              status
                            }
                            type="button"
                            onClick={() =>
                              updateStatus(
                                application._id,
                                status
                              )
                            }
                            disabled={
                              updatingId ===
                                application._id ||
                              application.status ===
                                status
                            }
                            className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium capitalize hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            {updatingId ===
                              application._id &&
                            application.status !==
                              status
                              ? status
                              : status}
                          </button>
                        )
                      )}
                    </div>
                  </div>
                </article>
              );
            }
          )}
        </div>
      )}
    </main>
  );
};

export default JobApplicants;