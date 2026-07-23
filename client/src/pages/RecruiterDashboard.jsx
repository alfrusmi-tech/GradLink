import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

const STATUS_STYLES = {
  open: "bg-emerald-100 text-emerald-700",
  closed: "bg-rose-100 text-rose-700",
  draft: "bg-amber-100 text-amber-700",
};

const STATUS_OPTIONS = ["all", "open", "closed", "draft"];

const formatDate = (value) => {
  if (!value) return "No deadline";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Invalid date";

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatJobType = (value = "") =>
  value
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const RecruiterDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [deletingId, setDeletingId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const loadJobs = useCallback(async ({ showPageLoader = false } = {}) => {
    try {
      if (showPageLoader) setLoading(true);
      else setRefreshing(true);

      setError("");
      const { data } = await api.get("/jobs/recruiter/mine");
      setJobs(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load your job postings.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadJobs({ showPageLoader: true });
  }, [loadJobs]);

  useEffect(() => {
    if (!success) return undefined;

    const timeoutId = window.setTimeout(() => setSuccess(""), 3500);
    return () => window.clearTimeout(timeoutId);
  }, [success]);

  const statistics = useMemo(() => {
    return jobs.reduce(
      (totals, job) => {
        totals.total += 1;
        totals[job.status] = (totals[job.status] || 0) + 1;
        totals.applicants += Number(job.applicantsCount || 0);
        return totals;
      },
      { total: 0, open: 0, closed: 0, draft: 0, applicants: 0 }
    );
  }, [jobs]);

  const filteredJobs = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    const result = jobs.filter((job) => {
      const matchesStatus =
        statusFilter === "all" || job.status === statusFilter;

      const searchableText = [
        job.title,
        job.company?.name,
        job.location,
        job.jobType,
        job.experienceLevel,
        ...(job.requiredSkills || []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return matchesStatus && (!searchText || searchableText.includes(searchText));
    });

    return [...result].sort((a, b) => {
      if (sortBy === "oldest") {
        return new Date(a.createdAt) - new Date(b.createdAt);
      }

      if (sortBy === "applicants") {
        return Number(b.applicantsCount || 0) - Number(a.applicantsCount || 0);
      }

      if (sortBy === "deadline") {
        const aDeadline = a.deadline ? new Date(a.deadline).getTime() : Infinity;
        const bDeadline = b.deadline ? new Date(b.deadline).getTime() : Infinity;
        return aDeadline - bDeadline;
      }

      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }, [jobs, search, sortBy, statusFilter]);

  const updateJobStatus = async (job, nextStatus) => {
    if (job.status === nextStatus) return;

    try {
      setUpdatingId(job._id);
      setError("");
      setSuccess("");

      const { data } = await api.put(`/jobs/${job._id}`, {
        status: nextStatus,
      });

      const updatedJob = data?.job || { ...job, status: nextStatus };

      setJobs((currentJobs) =>
        currentJobs.map((currentJob) =>
          currentJob._id === job._id ? { ...currentJob, ...updatedJob } : currentJob
        )
      );

      setSuccess(`“${job.title}” is now ${nextStatus}.`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update the job status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (job) => {
    const confirmed = window.confirm(
      `Delete “${job.title}”? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setDeletingId(job._id);
      setError("");
      setSuccess("");

      const { data } = await api.delete(`/jobs/${job._id}`);
      setJobs((currentJobs) =>
        currentJobs.filter((currentJob) => currentJob._id !== job._id)
      );

      setSuccess(data?.message || "Job deleted successfully.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to delete the job. Jobs with applications should be closed instead."
      );
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="animate-pulse space-y-6">
          <div className="h-9 w-72 rounded bg-gray-200" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="h-28 rounded-2xl bg-gray-200" />
            ))}
          </div>
          <div className="h-72 rounded-2xl bg-gray-200" />
        </div>
      </main>
    );
  }

  const cards = [
    { label: "Total jobs", value: statistics.total, valueClass: "text-gray-900" },
    { label: "Open jobs", value: statistics.open, valueClass: "text-emerald-600" },
    { label: "Draft jobs", value: statistics.draft, valueClass: "text-amber-600" },
    { label: "Closed jobs", value: statistics.closed, valueClass: "text-rose-600" },
    {
      label: "Total applicants",
      value: statistics.applicants,
      valueClass: "text-indigo-600",
    },
  ];

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-700 to-violet-600 px-6 py-8 text-white shadow-lg sm:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-indigo-100">
              Recruiter workspace
            </p>
            <h1 className="text-3xl font-bold sm:text-4xl">Recruiter Dashboard</h1>
            <p className="mt-3 max-w-2xl text-sm text-indigo-100 sm:text-base">
              Manage your company’s job postings, update their status, and review
              applicants from one place.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/recruiter/company"
              className="rounded-xl border border-white/40 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/20"
            >
              Company Profile
            </Link>
            <Link
              to="/recruiter/jobs/new"
              className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-indigo-700 shadow-sm transition hover:bg-indigo-50"
            >
              + Post New Job
            </Link>
          </div>
        </div>
      </section>

      <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map((card) => (
          <article
            key={card.label}
            className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
          >
            <p className="text-sm font-medium text-gray-500">{card.label}</p>
            <p className={`mt-3 text-3xl font-bold ${card.valueClass}`}>
              {card.value}
            </p>
          </article>
        ))}
      </section>

      {error && (
        <div className="mb-5 flex items-start justify-between gap-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <span>{error}</span>
          <button type="button" onClick={() => setError("")} className="font-bold">
            ×
          </button>
        </div>
      )}

      {success && (
        <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          {success}
        </div>
      )}

      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 p-5 sm:p-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Your Job Postings</h2>
              <p className="mt-1 text-sm text-gray-500">
                Showing {filteredJobs.length} of {jobs.length} jobs
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search jobs..."
                className="rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 sm:col-span-2"
              />

              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-indigo-500"
              >
                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status === "all" ? "All statuses" : formatJobType(status)}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
                className="rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-indigo-500"
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="applicants">Most applicants</option>
                <option value="deadline">Nearest deadline</option>
              </select>
            </div>
          </div>
        </div>

        {jobs.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100 text-2xl">
              💼
            </div>
            <h3 className="text-lg font-bold text-gray-900">No jobs posted yet</h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
              Create your first job posting to start receiving applications.
            </p>
            <Link
              to="/recruiter/jobs/new"
              className="mt-5 inline-flex rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Post Your First Job
            </Link>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <h3 className="text-lg font-bold text-gray-900">No matching jobs</h3>
            <p className="mt-2 text-sm text-gray-500">
              Change your search text or status filter.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setStatusFilter("all");
              }}
              className="mt-4 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredJobs.map((job) => {
              const isUpdating = updatingId === job._id;
              const isDeleting = deletingId === job._id;

              return (
                <article key={job._id} className="p-5 transition hover:bg-gray-50 sm:p-6">
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-bold text-gray-900">{job.title}</h3>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                            STATUS_STYLES[job.status] || "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {job.status || "unknown"}
                        </span>
                      </div>

                      <p className="mt-2 text-sm text-gray-600">
                        {job.company?.name || "Company not available"} · {job.location || "No location"} · {formatJobType(job.jobType)}
                      </p>

                      <div className="mt-4 grid gap-3 text-sm text-gray-500 sm:grid-cols-2 xl:grid-cols-4">
                        <span>
                          <strong className="font-semibold text-gray-700">Applicants:</strong>{" "}
                          {Number(job.applicantsCount || 0)}
                        </span>
                        <span>
                          <strong className="font-semibold text-gray-700">Experience:</strong>{" "}
                          {formatJobType(job.experienceLevel)}
                        </span>
                        <span>
                          <strong className="font-semibold text-gray-700">Posted:</strong>{" "}
                          {formatDate(job.createdAt)}
                        </span>
                        <span>
                          <strong className="font-semibold text-gray-700">Deadline:</strong>{" "}
                          {formatDate(job.deadline)}
                        </span>
                      </div>

                      {Array.isArray(job.requiredSkills) && job.requiredSkills.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {job.requiredSkills.slice(0, 5).map((skill) => (
                            <span
                              key={`${job._id}-${skill}`}
                              className="rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600"
                            >
                              {skill}
                            </span>
                          ))}
                          {job.requiredSkills.length > 5 && (
                            <span className="px-2 py-1 text-xs text-gray-500">
                              +{job.requiredSkills.length - 5} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex w-full flex-col gap-3 lg:w-60">
                      <select
                        value={job.status}
                        onChange={(event) => updateJobStatus(job, event.target.value)}
                        disabled={isUpdating || isDeleting}
                        aria-label={`Change status for ${job.title}`}
                        className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm font-medium outline-none focus:border-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <option value="open">Open</option>
                        <option value="draft">Draft</option>
                        <option value="closed">Closed</option>
                      </select>

                      <div className="grid grid-cols-2 gap-2">
                        <Link
                          to={`/jobs/${job._id}`}
                          className="rounded-xl border border-gray-300 px-3 py-2 text-center text-sm font-semibold text-gray-700 hover:bg-white"
                        >
                          View
                        </Link>
                        <Link
                          to={`/recruiter/jobs/${job._id}/edit`}
                          className="rounded-xl border border-indigo-200 px-3 py-2 text-center text-sm font-semibold text-indigo-700 hover:bg-indigo-50"
                        >
                          Edit
                        </Link>
                      </div>

                      <Link
                        to={`/recruiter/jobs/${job._id}/applicants`}
                        className="rounded-xl bg-indigo-600 px-3 py-2.5 text-center text-sm font-semibold text-white hover:bg-indigo-700"
                      >
                        View Applicants ({Number(job.applicantsCount || 0)})
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleDelete(job)}
                        disabled={isDeleting || isUpdating}
                        className="rounded-xl border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isDeleting ? "Deleting..." : "Delete Job"}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <div className="mt-5 flex justify-end">
        <button
          type="button"
          onClick={() => loadJobs()}
          disabled={refreshing}
          className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {refreshing ? "Refreshing..." : "Refresh Dashboard"}
        </button>
      </div>
    </main>
  );
};

export default RecruiterDashboard;