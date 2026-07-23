import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const statusStyles = {
  pending:
    "bg-amber-50 text-amber-700 border-amber-200",

  shortlisted:
    "bg-blue-50 text-blue-700 border-blue-200",

  accepted:
    "bg-green-50 text-green-700 border-green-200",

  rejected:
    "bg-red-50 text-red-700 border-red-200",
};

const ApplicationHistory = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [applications, setApplications] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("all");

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/applications/me"
      );

      setApplications(
        response.data.applications || []
      );
    } catch (requestError) {
      setError(
        requestError.response?.data
          ?.message ||
          "Could not load your applications."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate("/login");

      return;
    }

    if (user.role !== "jobseeker") {
      navigate("/");

      return;
    }

    fetchApplications();
  }, [user, navigate]);

  const filteredApplications =
    useMemo(() => {
      if (statusFilter === "all") {
        return applications;
      }

      return applications.filter(
        (application) =>
          application.status ===
          statusFilter
      );
    }, [
      applications,
      statusFilter,
    ]);

  const applicationCounts =
    useMemo(() => {
      return {
        all: applications.length,

        pending:
          applications.filter(
            (application) =>
              application.status ===
              "pending"
          ).length,

        shortlisted:
          applications.filter(
            (application) =>
              application.status ===
              "shortlisted"
          ).length,

        accepted:
          applications.filter(
            (application) =>
              application.status ===
              "accepted"
          ).length,

        rejected:
          applications.filter(
            (application) =>
              application.status ===
              "rejected"
          ).length,
      };
    }, [applications]);

  const formatDate = (dateValue) => {
    if (!dateValue) {
      return "Not available";
    }

    return new Date(
      dateValue
    ).toLocaleDateString("en-LK", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatSalary = (
    minimum,
    maximum
  ) => {
    if (!minimum && !maximum) {
      return "Not specified";
    }

    if (minimum && maximum) {
      return `LKR ${Number(
        minimum
      ).toLocaleString()} - LKR ${Number(
        maximum
      ).toLocaleString()}`;
    }

    if (minimum) {
      return `From LKR ${Number(
        minimum
      ).toLocaleString()}`;
    }

    return `Up to LKR ${Number(
      maximum
    ).toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />

          <p className="mt-3 text-sm text-gray-500">
            Loading your applications...
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Application History
          </h1>

          <p className="mt-2 text-gray-600">
            View all jobs you have applied
            for and track their current
            status.
          </p>
        </div>

        <Link
          to="/jobs"
          className="inline-flex justify-center rounded-lg bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          Browse more jobs
        </Link>
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <section className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <button
          type="button"
          onClick={() =>
            setStatusFilter("all")
          }
          className={`rounded-xl border p-4 text-left transition ${
            statusFilter === "all"
              ? "border-indigo-500 bg-indigo-50"
              : "border-gray-200 bg-white hover:border-indigo-300"
          }`}
        >
          <p className="text-sm text-gray-500">
            All
          </p>

          <p className="mt-1 text-2xl font-bold text-gray-900">
            {applicationCounts.all}
          </p>
        </button>

        <button
          type="button"
          onClick={() =>
            setStatusFilter("pending")
          }
          className={`rounded-xl border p-4 text-left transition ${
            statusFilter === "pending"
              ? "border-amber-500 bg-amber-50"
              : "border-gray-200 bg-white hover:border-amber-300"
          }`}
        >
          <p className="text-sm text-gray-500">
            Pending
          </p>

          <p className="mt-1 text-2xl font-bold text-amber-700">
            {applicationCounts.pending}
          </p>
        </button>

        <button
          type="button"
          onClick={() =>
            setStatusFilter(
              "shortlisted"
            )
          }
          className={`rounded-xl border p-4 text-left transition ${
            statusFilter ===
            "shortlisted"
              ? "border-blue-500 bg-blue-50"
              : "border-gray-200 bg-white hover:border-blue-300"
          }`}
        >
          <p className="text-sm text-gray-500">
            Shortlisted
          </p>

          <p className="mt-1 text-2xl font-bold text-blue-700">
            {
              applicationCounts.shortlisted
            }
          </p>
        </button>

        <button
          type="button"
          onClick={() =>
            setStatusFilter("accepted")
          }
          className={`rounded-xl border p-4 text-left transition ${
            statusFilter === "accepted"
              ? "border-green-500 bg-green-50"
              : "border-gray-200 bg-white hover:border-green-300"
          }`}
        >
          <p className="text-sm text-gray-500">
            Accepted
          </p>

          <p className="mt-1 text-2xl font-bold text-green-700">
            {applicationCounts.accepted}
          </p>
        </button>

        <button
          type="button"
          onClick={() =>
            setStatusFilter("rejected")
          }
          className={`rounded-xl border p-4 text-left transition ${
            statusFilter === "rejected"
              ? "border-red-500 bg-red-50"
              : "border-gray-200 bg-white hover:border-red-300"
          }`}
        >
          <p className="text-sm text-gray-500">
            Rejected
          </p>

          <p className="mt-1 text-2xl font-bold text-red-700">
            {applicationCounts.rejected}
          </p>
        </button>
      </section>

      {applications.length === 0 ? (
        <section className="mt-8 rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900">
            No applications yet
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            You have not applied for any
            jobs yet.
          </p>

          <Link
            to="/jobs"
            className="mt-5 inline-flex rounded-lg bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Find jobs
          </Link>
        </section>
      ) : filteredApplications.length ===
        0 ? (
        <section className="mt-8 rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">
            No applications found
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            You do not have any
            applications with this
            status.
          </p>

          <button
            type="button"
            onClick={() =>
              setStatusFilter("all")
            }
            className="mt-5 rounded-lg border border-indigo-200 px-5 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-50"
          >
            Show all applications
          </button>
        </section>
      ) : (
        <section className="mt-8 space-y-5">
          {filteredApplications.map(
            (application) => {
              const job =
                application.job;

              const company =
                job?.company;

              return (
                <article
                  key={application._id}
                  className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex-1">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <h2 className="text-xl font-semibold text-gray-900">
                            {job?.title ||
                              "Job unavailable"}
                          </h2>

                          <p className="mt-1 text-sm text-gray-600">
                            {company?.name ||
                              "Company unavailable"}
                          </p>
                        </div>

                        <span
                          className={`w-fit rounded-full border px-3 py-1 text-xs font-semibold capitalize ${
                            statusStyles[
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

                      <div className="mt-5 grid gap-3 text-sm text-gray-600 sm:grid-cols-2 lg:grid-cols-3">
                        <div className="rounded-lg bg-gray-50 px-3 py-2">
                          <span className="block text-xs text-gray-400">
                            Location
                          </span>

                          <span className="mt-1 block font-medium text-gray-700">
                            {job?.location ||
                              "Not specified"}
                          </span>
                        </div>

                        <div className="rounded-lg bg-gray-50 px-3 py-2">
                          <span className="block text-xs text-gray-400">
                            Job type
                          </span>

                          <span className="mt-1 block font-medium capitalize text-gray-700">
                            {job?.jobType ||
                              "Not specified"}
                          </span>
                        </div>

                        <div className="rounded-lg bg-gray-50 px-3 py-2">
                          <span className="block text-xs text-gray-400">
                            Salary
                          </span>

                          <span className="mt-1 block font-medium text-gray-700">
                            {formatSalary(
                              job?.salaryMin,
                              job?.salaryMax
                            )}
                          </span>
                        </div>

                        <div className="rounded-lg bg-gray-50 px-3 py-2">
                          <span className="block text-xs text-gray-400">
                            Applied date
                          </span>

                          <span className="mt-1 block font-medium text-gray-700">
                            {formatDate(
                              application.createdAt
                            )}
                          </span>
                        </div>

                        <div className="rounded-lg bg-gray-50 px-3 py-2">
                          <span className="block text-xs text-gray-400">
                            Match score
                          </span>

                          <span className="mt-1 block font-medium text-gray-700">
                            {application.matchScoreAtApply ??
                              0}
                            %
                          </span>
                        </div>

                        <div className="rounded-lg bg-gray-50 px-3 py-2">
                          <span className="block text-xs text-gray-400">
                            Job status
                          </span>

                          <span className="mt-1 block font-medium capitalize text-gray-700">
                            {job?.status ||
                              "Unavailable"}
                          </span>
                        </div>
                      </div>

                      {application.coverLetter && (
                        <div className="mt-5 rounded-xl border border-gray-100 bg-gray-50 p-4">
                          <h3 className="text-sm font-semibold text-gray-900">
                            Cover letter
                          </h3>

                          <p className="mt-2 whitespace-pre-line text-sm leading-6 text-gray-600">
                            {
                              application.coverLetter
                            }
                          </p>
                        </div>
                      )}

                      {application.statusHistory
                        ?.length > 0 && (
                        <div className="mt-5">
                          <h3 className="text-sm font-semibold text-gray-900">
                            Status history
                          </h3>

                          <div className="mt-3 flex flex-wrap gap-2">
                            {application.statusHistory.map(
                              (
                                history,
                                index
                              ) => (
                                <span
                                  key={`${history.status}-${index}`}
                                  className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-600"
                                >
                                  <span className="font-medium capitalize">
                                    {
                                      history.status
                                    }
                                  </span>
                                  {" · "}
                                  {formatDate(
                                    history.changedAt
                                  )}
                                </span>
                              )
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex shrink-0 flex-col gap-3 lg:w-48">
                      {job?._id && (
                        <Link
                          to={`/jobs/${job._id}`}
                          className="rounded-lg bg-indigo-600 px-4 py-2 text-center text-sm font-semibold text-white hover:bg-indigo-700"
                        >
                          View job
                        </Link>
                      )}

                      {job?._id && (
                        <Link
                          to={`/cv-analysis?jobId=${job._id}`}
                          className="rounded-lg border border-indigo-200 px-4 py-2 text-center text-sm font-semibold text-indigo-700 hover:bg-indigo-50"
                        >
                          View CV match
                        </Link>
                      )}

                      {application.cv
                        ?.fileUrl && (
                        <a
                          href={`${
                            import.meta.env
                              .VITE_SERVER_URL ||
                            "http://localhost:5000"
                          }${
                            application.cv
                              .fileUrl
                          }`}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-lg border border-gray-200 px-4 py-2 text-center text-sm font-semibold text-gray-700 hover:bg-gray-50"
                        >
                          View submitted CV
                        </a>
                      )}
                    </div>
                  </div>
                </article>
              );
            }
          )}
        </section>
      )}
    </main>
  );
};

export default ApplicationHistory;