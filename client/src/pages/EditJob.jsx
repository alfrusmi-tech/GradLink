import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import api from "../services/api";

const initialForm = {
  title: "",
  description: "",
  responsibilities: "",
  requiredSkills: "",
  preferredSkills: "",
  location: "",
  jobType: "full-time",
  experienceLevel: "entry",
  experienceYears: "",
  salaryMin: "",
  salaryMax: "",
  education: "",
  status: "open",
  deadline: "",
};

const EditJob = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();

  const [form, setForm] =
    useState(initialForm);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    let cancelled = false;

    const loadJob = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(
          `/jobs/recruiter/mine/${jobId}`
        );

        const job = response.data;

        if (!cancelled) {
          setForm({
            title: job.title || "",
            description:
              job.description || "",

            responsibilities:
              job.responsibilities?.join(
                ", "
              ) || "",

            requiredSkills:
              job.requiredSkills?.join(
                ", "
              ) || "",

            preferredSkills:
              job.preferredSkills?.join(
                ", "
              ) || "",

            location: job.location || "",

            jobType:
              job.jobType ||
              "full-time",

            experienceLevel:
              job.experienceLevel ||
              "entry",

            experienceYears:
              job.experienceYears ?? "",

            salaryMin:
              job.salaryMin ?? "",

            salaryMax:
              job.salaryMax ?? "",

            education:
              job.education || "",

            status:
              job.status || "open",

            deadline: job.deadline
              ? new Date(job.deadline)
                  .toISOString()
                  .split("T")[0]
              : "",
          });
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.response?.data?.message ||
              "Failed to load job."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadJob();

    return () => {
      cancelled = true;
    };
  }, [jobId]);

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const toArray = (value) =>
    value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setSaving(true);
    setError("");

    try {
      await api.put(`/jobs/${jobId}`, {
        title: form.title,
        description: form.description,

        responsibilities: toArray(
          form.responsibilities
        ),

        requiredSkills: toArray(
          form.requiredSkills
        ),

        preferredSkills: toArray(
          form.preferredSkills
        ),

        location: form.location,
        jobType: form.jobType,

        experienceLevel:
          form.experienceLevel,

        experienceYears:
          form.experienceYears === ""
            ? 0
            : Number(
                form.experienceYears
              ),

        salaryMin:
          form.salaryMin === ""
            ? null
            : Number(form.salaryMin),

        salaryMax:
          form.salaryMax === ""
            ? null
            : Number(form.salaryMax),

        education: form.education,
        status: form.status,

        deadline:
          form.deadline || null,
      });

      navigate(
        "/recruiter/dashboard",
        {
          replace: true,
        }
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to update job."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500">
        Loading job...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Edit Job
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Update the job information and
            publishing status.
          </p>
        </div>

        <Link
          to="/recruiter/dashboard"
          className="text-sm font-medium text-indigo-600 hover:underline"
        >
          Back to Dashboard
        </Link>
      </div>

      {error && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
      >
        <div>
          <label
            htmlFor="title"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Job Title
          </label>

          <input
            id="title"
            name="title"
            required
            value={form.title}
            onChange={handleChange}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label
            htmlFor="description"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Description
          </label>

          <textarea
            id="description"
            name="description"
            required
            rows={5}
            value={form.description}
            onChange={handleChange}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label
            htmlFor="responsibilities"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Responsibilities
          </label>

          <input
            id="responsibilities"
            name="responsibilities"
            placeholder="Develop features, Review code, Attend meetings"
            value={form.responsibilities}
            onChange={handleChange}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <p className="mt-1 text-xs text-gray-400">
            Separate each responsibility
            using commas.
          </p>
        </div>

        <div>
          <label
            htmlFor="requiredSkills"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Required Skills
          </label>

          <input
            id="requiredSkills"
            name="requiredSkills"
            required
            placeholder="React, Node.js, MongoDB"
            value={form.requiredSkills}
            onChange={handleChange}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label
            htmlFor="preferredSkills"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Preferred Skills
          </label>

          <input
            id="preferredSkills"
            name="preferredSkills"
            placeholder="Docker, TypeScript, AWS"
            value={form.preferredSkills}
            onChange={handleChange}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="location"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Location
            </label>

            <input
              id="location"
              name="location"
              required
              value={form.location}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label
              htmlFor="jobType"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Job Type
            </label>

            <select
              id="jobType"
              name="jobType"
              value={form.jobType}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="full-time">
                Full-time
              </option>
              <option value="part-time">
                Part-time
              </option>
              <option value="contract">
                Contract
              </option>
              <option value="internship">
                Internship
              </option>
              <option value="remote">
                Remote
              </option>
            </select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="experienceLevel"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Experience Level
            </label>

            <select
              id="experienceLevel"
              name="experienceLevel"
              value={form.experienceLevel}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="entry">
                Entry
              </option>
              <option value="junior">
                Junior
              </option>
              <option value="mid">
                Mid
              </option>
              <option value="senior">
                Senior
              </option>
              <option value="lead">
                Lead
              </option>
            </select>
          </div>

          <div>
            <label
              htmlFor="experienceYears"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Experience Years
            </label>

            <input
              id="experienceYears"
              type="number"
              min="0"
              name="experienceYears"
              value={form.experienceYears}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="salaryMin"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Minimum Salary
            </label>

            <input
              id="salaryMin"
              type="number"
              min="0"
              name="salaryMin"
              value={form.salaryMin}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label
              htmlFor="salaryMax"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Maximum Salary
            </label>

            <input
              id="salaryMax"
              type="number"
              min="0"
              name="salaryMax"
              value={form.salaryMax}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="education"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Education Requirement
          </label>

          <input
            id="education"
            name="education"
            placeholder="BSc in Computer Science or related field"
            value={form.education}
            onChange={handleChange}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="deadline"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Application Deadline
            </label>

            <input
              id="deadline"
              type="date"
              name="deadline"
              value={form.deadline}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label
              htmlFor="status"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Job Status
            </label>

            <select
              id="status"
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="open">
                Open
              </option>
              <option value="closed">
                Closed
              </option>
              <option value="draft">
                Draft
              </option>
            </select>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
          <Link
            to="/recruiter/dashboard"
            className="rounded-md border border-gray-300 px-5 py-2.5 text-center text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving
              ? "Saving..."
              : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditJob;