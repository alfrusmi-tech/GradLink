import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

const tabs = [
  { id: "overview", label: "Overview" },
  { id: "users", label: "Users" },
  { id: "jobs", label: "Jobs" },
  { id: "companies", label: "Companies" },
];

const roleClasses = {
  admin: "bg-purple-100 text-purple-700",
  recruiter: "bg-blue-100 text-blue-700",
  jobseeker: "bg-emerald-100 text-emerald-700",
};

const statusClasses = {
  open: "bg-emerald-100 text-emerald-700",
  closed: "bg-red-100 text-red-700",
  draft: "bg-amber-100 text-amber-700",
};

const emptyPagination = {
  currentPage: 1,
  totalPages: 1,
  total: 0,
  hasNextPage: false,
  hasPreviousPage: false,
};

const formatDate = (value) => {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
};

const capitalize = (value = "") =>
  value.charAt(0).toUpperCase() + value.slice(1);

function StatCard({ title, value, subtitle, icon }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-2 text-3xl font-black text-slate-900">{value ?? 0}</p>
          {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}
        </div>
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-indigo-50 text-xl">
          {icon}
        </span>
      </div>
    </article>
  );
}

function Pagination({ pagination, onChange }) {
  if (!pagination || pagination.totalPages <= 1) return null;

  return (
    <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-slate-500">
        Page {pagination.currentPage} of {pagination.totalPages} · {pagination.total} records
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={!pagination.hasPreviousPage}
          onClick={() => onChange(pagination.currentPage - 1)}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Previous
        </button>
        <button
          type="button"
          disabled={!pagination.hasNextPage}
          onClick={() => onChange(pagination.currentPage + 1)}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="h-32 animate-pulse rounded-2xl bg-slate-200" />
      ))}
    </div>
  );
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [statistics, setStatistics] = useState(null);
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [companies, setCompanies] = useState([]);

  const [usersPagination, setUsersPagination] = useState(emptyPagination);
  const [jobsPagination, setJobsPagination] = useState(emptyPagination);
  const [companiesPagination, setCompaniesPagination] = useState(emptyPagination);

  const [userSearch, setUserSearch] = useState("");
  const [userRole, setUserRole] = useState("");
  const [userStatus, setUserStatus] = useState("");
  const [jobSearch, setJobSearch] = useState("");
  const [jobStatus, setJobStatus] = useState("");
  const [companySearch, setCompanySearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const showError = (err, fallback) => {
    setSuccess("");
    setError(err.response?.data?.message || fallback);
  };

  const showSuccess = (message) => {
    setError("");
    setSuccess(message);
  };

  const loadStatistics = useCallback(async () => {
    const response = await api.get("/admin/statistics");
    setStatistics(response.data);
  }, []);

  const loadUsers = useCallback(
    async (page = 1) => {
      setLoading(true);
      setError("");
      try {
        const response = await api.get("/admin/users", {
          params: {
            page,
            limit: 10,
            search: userSearch.trim(),
            role: userRole,
            status: userStatus,
          },
        });
        setUsers(response.data.users || []);
        setUsersPagination(response.data.pagination || emptyPagination);
      } catch (err) {
        showError(err, "Failed to load users.");
      } finally {
        setLoading(false);
      }
    },
    [userSearch, userRole, userStatus]
  );

  const loadJobs = useCallback(
    async (page = 1) => {
      setLoading(true);
      setError("");
      try {
        const response = await api.get("/admin/jobs", {
          params: {
            page,
            limit: 10,
            search: jobSearch.trim(),
            status: jobStatus,
          },
        });
        setJobs(response.data.jobs || []);
        setJobsPagination(response.data.pagination || emptyPagination);
      } catch (err) {
        showError(err, "Failed to load jobs.");
      } finally {
        setLoading(false);
      }
    },
    [jobSearch, jobStatus]
  );

  const loadCompanies = useCallback(
    async (page = 1) => {
      setLoading(true);
      setError("");
      try {
        const response = await api.get("/admin/companies", {
          params: { page, limit: 10, search: companySearch.trim() },
        });
        setCompanies(response.data.companies || []);
        setCompaniesPagination(response.data.pagination || emptyPagination);
      } catch (err) {
        showError(err, "Failed to load companies.");
      } finally {
        setLoading(false);
      }
    },
    [companySearch]
  );

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError("");
      try {
        await loadStatistics();
      } catch (err) {
        showError(err, "Failed to load admin dashboard.");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [loadStatistics]);

  useEffect(() => {
    if (activeTab === "users") loadUsers(1);
    if (activeTab === "jobs") loadJobs(1);
    if (activeTab === "companies") loadCompanies(1);
  }, [activeTab]); // intentionally only reload when tab changes

  useEffect(() => {
    if (!success) return undefined;
    const timer = window.setTimeout(() => setSuccess(""), 3500);
    return () => window.clearTimeout(timer);
  }, [success]);

  const refreshCurrentTab = async () => {
    if (activeTab === "overview") {
      setLoading(true);
      try {
        await loadStatistics();
        showSuccess("Dashboard refreshed.");
      } catch (err) {
        showError(err, "Could not refresh the dashboard.");
      } finally {
        setLoading(false);
      }
    }
    if (activeTab === "users") await loadUsers(usersPagination.currentPage);
    if (activeTab === "jobs") await loadJobs(jobsPagination.currentPage);
    if (activeTab === "companies") await loadCompanies(companiesPagination.currentPage);
  };

  const updateStatisticsQuietly = async () => {
    try {
      await loadStatistics();
    } catch {
      // The completed action remains successful even if card refresh fails.
    }
  };

  const toggleUserStatus = async (user) => {
    const nextStatus = !user.isActive;
    if (!window.confirm(`${nextStatus ? "Enable" : "Disable"} ${user.name}'s account?`)) return;

    const key = `user-status-${user._id}`;
    setActionLoading(key);
    try {
      const response = await api.put(`/admin/users/${user._id}/status`, {
        isActive: nextStatus,
      });
      setUsers((current) =>
        current.map((item) =>
          item._id === user._id ? { ...item, isActive: response.data.user.isActive } : item
        )
      );
      showSuccess(response.data.message || "User status updated.");
      updateStatisticsQuietly();
    } catch (err) {
      showError(err, "Could not update user status.");
    } finally {
      setActionLoading("");
    }
  };

  const changeUserRole = async (user, role) => {
    if (role === user.role) return;
    if (!window.confirm(`Change ${user.name}'s role to ${role}?`)) return;

    const key = `user-role-${user._id}`;
    setActionLoading(key);
    try {
      const response = await api.put(`/admin/users/${user._id}/role`, { role });
      setUsers((current) =>
        current.map((item) =>
          item._id === user._id ? { ...item, role: response.data.user.role } : item
        )
      );
      showSuccess(response.data.message || "User role updated.");
      updateStatisticsQuietly();
    } catch (err) {
      showError(err, "Could not update user role.");
      await loadUsers(usersPagination.currentPage);
    } finally {
      setActionLoading("");
    }
  };

  const deleteUser = async (user) => {
    if (!window.confirm(`Permanently delete ${user.name}? This cannot be undone.`)) return;

    const key = `delete-user-${user._id}`;
    setActionLoading(key);
    try {
      const response = await api.delete(`/admin/users/${user._id}`);
      showSuccess(response.data.message || "User deleted.");
      await Promise.all([loadUsers(usersPagination.currentPage), updateStatisticsQuietly()]);
    } catch (err) {
      showError(err, "Could not delete user.");
    } finally {
      setActionLoading("");
    }
  };

  const changeJobStatus = async (job, status) => {
    if (status === job.status) return;
    const key = `job-status-${job._id}`;
    setActionLoading(key);
    try {
      const response = await api.put(`/admin/jobs/${job._id}/status`, { status });
      setJobs((current) =>
        current.map((item) => (item._id === job._id ? response.data.job : item))
      );
      showSuccess(response.data.message || "Job status updated.");
      updateStatisticsQuietly();
    } catch (err) {
      showError(err, "Could not update job status.");
      await loadJobs(jobsPagination.currentPage);
    } finally {
      setActionLoading("");
    }
  };

  const deleteJob = async (job) => {
    if (!window.confirm(`Permanently delete “${job.title}”?`)) return;

    const key = `delete-job-${job._id}`;
    setActionLoading(key);
    try {
      const response = await api.delete(`/admin/jobs/${job._id}`);
      showSuccess(response.data.message || "Job deleted.");
      await Promise.all([loadJobs(jobsPagination.currentPage), updateStatisticsQuietly()]);
    } catch (err) {
      showError(err, "Could not delete job.");
    } finally {
      setActionLoading("");
    }
  };

  const deleteCompany = async (company) => {
    if (!window.confirm(`Permanently delete ${company.name}?`)) return;

    const key = `delete-company-${company._id}`;
    setActionLoading(key);
    try {
      const response = await api.delete(`/admin/companies/${company._id}`);
      showSuccess(response.data.message || "Company deleted.");
      await Promise.all([
        loadCompanies(companiesPagination.currentPage),
        updateStatisticsQuietly(),
      ]);
    } catch (err) {
      showError(err, "Could not delete company.");
    } finally {
      setActionLoading("");
    }
  };

  const applicationPercentages = useMemo(() => {
    const applications = statistics?.applications;
    if (!applications?.total) return [];
    return [
      ["Pending", applications.pending],
      ["Shortlisted", applications.shortlisted],
      ["Accepted", applications.accepted],
      ["Rejected", applications.rejected],
    ].map(([label, value]) => ({
      label,
      value,
      percent: Math.round((value / applications.total) * 100),
    }));
  }, [statistics]);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-7 rounded-3xl bg-gradient-to-r from-slate-950 via-indigo-950 to-indigo-800 p-6 text-white shadow-xl sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-indigo-200">
                GradLink Administration
              </p>
              <h1 className="mt-2 text-3xl font-black sm:text-4xl">Admin Dashboard</h1>
              <p className="mt-2 max-w-2xl text-sm text-indigo-100 sm:text-base">
                Manage users, jobs, companies, account access, and platform activity.
              </p>
            </div>
            <button
              type="button"
              onClick={refreshCurrentTab}
              disabled={loading}
              className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-indigo-800 shadow hover:bg-indigo-50 disabled:opacity-60"
            >
              {loading ? "Refreshing..." : "Refresh data"}
            </button>
          </div>
        </header>

        {(error || success) && (
          <div
            className={`mb-5 rounded-xl border px-4 py-3 text-sm font-medium ${
              error
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-emerald-200 bg-emerald-50 text-emerald-700"
            }`}
          >
            {error || success}
          </div>
        )}

        <nav className="mb-6 flex gap-2 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveTab(tab.id);
                setError("");
                setSuccess("");
              }}
              className={`whitespace-nowrap rounded-xl px-5 py-2.5 text-sm font-bold transition ${
                activeTab === tab.id
                  ? "bg-indigo-600 text-white shadow"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {loading && <LoadingState />}

        {!loading && activeTab === "overview" && statistics && (
          <section className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                title="Total users"
                value={statistics.users?.total}
                subtitle={`${statistics.users?.active || 0} active · ${statistics.users?.disabled || 0} disabled`}
                icon="👥"
              />
              <StatCard
                title="Total jobs"
                value={statistics.jobs?.total}
                subtitle={`${statistics.jobs?.open || 0} open · ${statistics.jobs?.draft || 0} draft`}
                icon="💼"
              />
              <StatCard
                title="Applications"
                value={statistics.applications?.total}
                subtitle={`${statistics.applications?.accepted || 0} accepted`}
                icon="📄"
              />
              <StatCard
                title="Companies"
                value={statistics.companies?.total}
                subtitle="Registered recruiter companies"
                icon="🏢"
              />
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
              <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-lg font-black text-slate-900">User distribution</h2>
                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  {[
                    ["Job seekers", statistics.users?.jobSeekers, "bg-emerald-50 text-emerald-700"],
                    ["Recruiters", statistics.users?.recruiters, "bg-blue-50 text-blue-700"],
                    ["Admins", statistics.users?.admins, "bg-purple-50 text-purple-700"],
                  ].map(([label, value, classes]) => (
                    <div key={label} className={`rounded-xl p-4 ${classes}`}>
                      <p className="text-sm font-semibold">{label}</p>
                      <p className="mt-1 text-2xl font-black">{value || 0}</p>
                    </div>
                  ))}
                </div>
              </article>

              <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-lg font-black text-slate-900">Application status</h2>
                <div className="mt-5 space-y-4">
                  {applicationPercentages.length === 0 ? (
                    <p className="text-sm text-slate-500">No applications yet.</p>
                  ) : (
                    applicationPercentages.map((item) => (
                      <div key={item.label}>
                        <div className="mb-1 flex justify-between text-sm">
                          <span className="font-semibold text-slate-700">{item.label}</span>
                          <span className="text-slate-500">{item.value} ({item.percent}%)</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-indigo-600"
                            style={{ width: `${item.percent}%` }}
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </article>
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
              <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 px-5 py-4">
                  <h2 className="font-black text-slate-900">Recent users</h2>
                </div>
                <div className="divide-y divide-slate-100">
                  {(statistics.recentUsers || []).length === 0 ? (
                    <p className="p-5 text-sm text-slate-500">No users found.</p>
                  ) : (
                    statistics.recentUsers.map((user) => (
                      <div key={user._id} className="flex items-center justify-between gap-3 p-4">
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-slate-900">{user.name}</p>
                          <p className="truncate text-sm text-slate-500">{user.email}</p>
                        </div>
                        <div className="text-right">
                          <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${roleClasses[user.role]}`}>
                            {capitalize(user.role)}
                          </span>
                          <p className="mt-1 text-xs text-slate-400">{formatDate(user.createdAt)}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </article>

              <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 px-5 py-4">
                  <h2 className="font-black text-slate-900">Recent jobs</h2>
                </div>
                <div className="divide-y divide-slate-100">
                  {(statistics.recentJobs || []).length === 0 ? (
                    <p className="p-5 text-sm text-slate-500">No jobs found.</p>
                  ) : (
                    statistics.recentJobs.map((job) => (
                      <div key={job._id} className="flex items-center justify-between gap-3 p-4">
                        <div className="min-w-0">
                          <Link to={`/jobs/${job._id}`} className="truncate font-semibold text-slate-900 hover:text-indigo-600">
                            {job.title}
                          </Link>
                          <p className="truncate text-sm text-slate-500">
                            {job.company?.name || "No company"} · {job.location}
                          </p>
                        </div>
                        <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${statusClasses[job.status]}`}>
                          {capitalize(job.status)}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </article>
            </div>
          </section>
        )}

        {!loading && activeTab === "users" && (
          <section>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                loadUsers(1);
              }}
              className="mb-5 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-4"
            >
              <input
                value={userSearch}
                onChange={(event) => setUserSearch(event.target.value)}
                placeholder="Search name or email"
                className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-indigo-500"
              />
              <select value={userRole} onChange={(event) => setUserRole(event.target.value)} className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm">
                <option value="">All roles</option>
                <option value="jobseeker">Job seeker</option>
                <option value="recruiter">Recruiter</option>
                <option value="admin">Admin</option>
              </select>
              <select value={userStatus} onChange={(event) => setUserStatus(event.target.value)} className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm">
                <option value="">All statuses</option>
                <option value="active">Active</option>
                <option value="disabled">Disabled</option>
              </select>
              <button className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-indigo-700">Search users</button>
            </form>

            <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    {['User', 'Role', 'Status', 'Joined', 'Actions'].map((heading) => (
                      <th key={heading} className={`px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500 ${heading === 'Actions' ? 'text-right' : 'text-left'}`}>
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.length === 0 ? (
                    <tr><td colSpan="5" className="px-4 py-12 text-center text-sm text-slate-500">No users found.</td></tr>
                  ) : users.map((user) => (
                    <tr key={user._id} className="hover:bg-slate-50/70">
                      <td className="px-4 py-4">
                        <p className="font-semibold text-slate-900">{user.name}</p>
                        <p className="text-sm text-slate-500">{user.email}</p>
                        {user.company?.name && <p className="mt-1 text-xs font-medium text-indigo-600">{user.company.name}</p>}
                      </td>
                      <td className="px-4 py-4">
                        <select
                          value={user.role}
                          disabled={actionLoading === `user-role-${user._id}`}
                          onChange={(event) => changeUserRole(user, event.target.value)}
                          className="rounded-lg border border-slate-300 px-2 py-1.5 text-sm capitalize disabled:opacity-50"
                        >
                          <option value="jobseeker">Job seeker</option>
                          <option value="recruiter">Recruiter</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${user.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                          {user.isActive ? "Active" : "Disabled"}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-500">{formatDate(user.createdAt)}</td>
                      <td className="px-4 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            disabled={Boolean(actionLoading)}
                            onClick={() => toggleUserStatus(user)}
                            className="rounded-lg border border-amber-200 px-3 py-2 text-xs font-bold text-amber-700 hover:bg-amber-50 disabled:opacity-50"
                          >
                            {user.isActive ? "Disable" : "Enable"}
                          </button>
                          <button
                            type="button"
                            disabled={Boolean(actionLoading)}
                            onClick={() => deleteUser(user)}
                            className="rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 disabled:opacity-50"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination pagination={usersPagination} onChange={loadUsers} />
          </section>
        )}

        {!loading && activeTab === "jobs" && (
          <section>
            <form
              onSubmit={(event) => { event.preventDefault(); loadJobs(1); }}
              className="mb-5 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-3"
            >
              <input value={jobSearch} onChange={(event) => setJobSearch(event.target.value)} placeholder="Search job title" className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-indigo-500" />
              <select value={jobStatus} onChange={(event) => setJobStatus(event.target.value)} className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm">
                <option value="">All statuses</option>
                <option value="open">Open</option>
                <option value="closed">Closed</option>
                <option value="draft">Draft</option>
              </select>
              <button className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-indigo-700">Search jobs</button>
            </form>

            <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    {['Job', 'Recruiter', 'Applicants', 'Status', 'Actions'].map((heading) => (
                      <th key={heading} className={`px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500 ${heading === 'Actions' ? 'text-right' : 'text-left'}`}>{heading}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {jobs.length === 0 ? (
                    <tr><td colSpan="5" className="px-4 py-12 text-center text-sm text-slate-500">No jobs found.</td></tr>
                  ) : jobs.map((job) => (
                    <tr key={job._id} className="hover:bg-slate-50/70">
                      <td className="px-4 py-4">
                        <Link to={`/jobs/${job._id}`} className="font-semibold text-slate-900 hover:text-indigo-600">{job.title}</Link>
                        <p className="text-sm text-slate-500">{job.company?.name || "No company"} · {job.location}</p>
                        <p className="mt-1 text-xs text-slate-400">Created {formatDate(job.createdAt)}</p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm font-medium text-slate-800">{job.recruiter?.name || "Unknown"}</p>
                        <p className="text-xs text-slate-500">{job.recruiter?.email || "—"}</p>
                      </td>
                      <td className="px-4 py-4 text-sm font-bold text-slate-700">{job.applicantsCount || 0}</td>
                      <td className="px-4 py-4">
                        <select
                          value={job.status}
                          disabled={actionLoading === `job-status-${job._id}`}
                          onChange={(event) => changeJobStatus(job, event.target.value)}
                          className="rounded-lg border border-slate-300 px-2 py-1.5 text-sm capitalize disabled:opacity-50"
                        >
                          <option value="open">Open</option>
                          <option value="closed">Closed</option>
                          <option value="draft">Draft</option>
                        </select>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex justify-end gap-2">
                          <Link to={`/jobs/${job._id}`} className="rounded-lg border border-indigo-200 px-3 py-2 text-xs font-bold text-indigo-700 hover:bg-indigo-50">View</Link>
                          <button type="button" disabled={Boolean(actionLoading)} onClick={() => deleteJob(job)} className="rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 disabled:opacity-50">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination pagination={jobsPagination} onChange={loadJobs} />
          </section>
        )}

        {!loading && activeTab === "companies" && (
          <section>
            <form
              onSubmit={(event) => { event.preventDefault(); loadCompanies(1); }}
              className="mb-5 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[1fr_auto]"
            >
              <input value={companySearch} onChange={(event) => setCompanySearch(event.target.value)} placeholder="Search company, industry, or location" className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-indigo-500" />
              <button className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-indigo-700">Search companies</button>
            </form>

            <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    {['Company', 'Owner', 'Industry', 'Jobs', 'Actions'].map((heading) => (
                      <th key={heading} className={`px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500 ${heading === 'Actions' ? 'text-right' : 'text-left'}`}>{heading}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {companies.length === 0 ? (
                    <tr><td colSpan="5" className="px-4 py-12 text-center text-sm text-slate-500">No companies found.</td></tr>
                  ) : companies.map((company) => (
                    <tr key={company._id} className="hover:bg-slate-50/70">
                      <td className="px-4 py-4">
                        <p className="font-semibold text-slate-900">{company.name}</p>
                        <p className="text-sm text-slate-500">{company.location || "No location"}</p>
                        {company.website && <a href={company.website} target="_blank" rel="noreferrer" className="mt-1 inline-block text-xs font-semibold text-indigo-600 hover:underline">Website</a>}
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm font-medium text-slate-800">{company.owner?.name || "Unknown"}</p>
                        <p className="text-xs text-slate-500">{company.owner?.email || "—"}</p>
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-600">{company.industry || "—"}</td>
                      <td className="px-4 py-4 text-sm font-bold text-slate-700">{company.jobsCount || 0}</td>
                      <td className="px-4 py-4 text-right">
                        <button type="button" disabled={Boolean(actionLoading)} onClick={() => deleteCompany(company)} className="rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 disabled:opacity-50">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination pagination={companiesPagination} onChange={loadCompanies} />
          </section>
        )}
      </div>
    </main>
  );
}