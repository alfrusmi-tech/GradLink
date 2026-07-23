import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [job, setJob] = useState(null);
  const [cv, setCv] = useState(null);

  const [loading, setLoading] =
    useState(true);

  const [checkingCV, setCheckingCV] =
    useState(false);

  const [applying, setApplying] =
    useState(false);

  const [coverLetter, setCoverLetter] =
    useState("");

  const [error, setError] =
    useState("");

  const [applyError, setApplyError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [alreadyApplied, setAlreadyApplied] =
    useState(false);

  const fetchJob = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        `/jobs/${id}`
      );

      setJob(response.data);
    } catch (requestError) {
      setError(
        requestError.response?.data
          ?.message ||
          "Could not load this job."
      );
    } finally {
      setLoading(false);
    }
  };

  const checkCV = async () => {
    if (
      !user ||
      user.role !== "jobseeker"
    ) {
      return;
    }

    try {
      setCheckingCV(true);

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
        console.error(
          "Could not check CV:",
          requestError
        );
      }
    } finally {
      setCheckingCV(false);
    }
  };

  const checkPreviousApplication =
    async () => {
      if (
        !user ||
        user.role !== "jobseeker"
      ) {
        return;
      }

      try {
        const response = await api.get(
          "/applications/me"
        );

        const applications =
          response.data.applications ||
          response.data ||
          [];

        const hasApplied =
          applications.some(
            (application) => {
              const applicationJobId =
                application.job?._id ||
                application.job;

              return (
                applicationJobId === id
              );
            }
          );

        setAlreadyApplied(hasApplied);
      } catch (requestError) {
        console.error(
          "Could not check application:",
          requestError
        );
      }
    };

  useEffect(() => {
    fetchJob();
  }, [id]);

  useEffect(() => {
    if (
      user?.role === "jobseeker"
    ) {
      checkCV();
      checkPreviousApplication();
    }
  }, [user, id]);

  const deadlinePassed = useMemo(
    () => {
      if (!job?.deadline) {
        return false;
      }

      return (
        new Date(job.deadline) <
        new Date()
      );
    },
    [job]
  );

  const jobClosed =
    job?.status &&
    job.status !== "open";

  const canApply =
    user?.role === "jobseeker" &&
    Boolean(cv) &&
    !alreadyApplied &&
    !deadlinePassed &&
    !jobClosed;

  const handleApply = async (
    event
  ) => {
    event.preventDefault();

    setApplyError("");
    setSuccess("");

    if (!user) {
      navigate("/login", {
        state: {
          from: `/jobs/${id}`,
        },
      });

      return;
    }

    if (
      user.role !== "jobseeker"
    ) {
      setApplyError(
        "Only job seekers can apply for jobs."
      );

      return;
    }

    if (!cv) {
      setApplyError(
        "Please upload your CV before applying."
      );

      return;
    }

    if (alreadyApplied) {
      setApplyError(
        "You have already applied for this job."
      );

      return;
    }

    if (jobClosed) {
      setApplyError(
        "This job is no longer accepting applications."
      );

      return;
    }

    if (deadlinePassed) {
      setApplyError(
        "The application deadline has passed."
      );

      return;
    }

    if (
      coverLetter.trim().length >
      2000
    ) {
      setApplyError(
        "Cover letter cannot exceed 2000 characters."
      );

      return;
    }

    try {
      setApplying(true);

      const response = await api.post(
        "/applications",
        {
          jobId: id,
          coverLetter:
            coverLetter.trim(),
        }
      );

      setSuccess(
        response.data.message ||
          "Application submitted successfully."
      );

      setAlreadyApplied(true);
      setCoverLetter("");
    } catch (requestError) {
      const message =
        requestError.response?.data
          ?.message ||
        "Failed to submit application.";

      setApplyError(message);

      if (
        message
          .toLowerCase()
          .includes("already applied")
      ) {
        setAlreadyApplied(true);
      }
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />

          <p className="mt-3 text-sm text-gray-500">
            Loading job details...
          </p>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
          <h1 className="text-lg font-semibold text-red-700">
            Job unavailable
          </h1>

          <p className="mt-2 text-sm text-red-600">
            {error ||
              "This job could not be found."}
          </p>

          <Link
            to="/jobs"
            className="mt-5 inline-flex rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
          >
            Back to jobs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <Link
        to="/jobs"
        className="mb-5 inline-flex text-sm font-medium text-indigo-600 hover:text-indigo-700"
      >
        ← Back to jobs
      </Link>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {job.title}
            </h1>

            <p className="mt-2 text-gray-600">
              {job.company?.name ||
                "Company not available"}
              {" · "}
              {job.location}
            </p>
          </div>

          <span className="w-fit rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold capitalize text-indigo-700">
            {job.jobType}
          </span>
        </div>

        <div className="mt-5 flex flex-wrap gap-3 text-sm text-gray-600">
          {job.experienceLevel && (
            <span className="rounded-lg bg-gray-50 px-3 py-2 capitalize">
              {job.experienceLevel}
              {" "}
              level
            </span>
          )}

          {job.experienceYears !==
            undefined && (
            <span className="rounded-lg bg-gray-50 px-3 py-2">
              {job.experienceYears}
              {" "}
              year
              {Number(
                job.experienceYears
              ) === 1
                ? ""
                : "s"}
              {" "}
              experience
            </span>
          )}

          {job.salaryMin &&
            job.salaryMax && (
              <span className="rounded-lg bg-gray-50 px-3 py-2">
                LKR{" "}
                {Number(
                  job.salaryMin
                ).toLocaleString()}
                {" - "}
                LKR{" "}
                {Number(
                  job.salaryMax
                ).toLocaleString()}
              </span>
            )}

          {job.deadline && (
            <span
              className={`rounded-lg px-3 py-2 ${
                deadlinePassed
                  ? "bg-red-50 text-red-700"
                  : "bg-gray-50"
              }`}
            >
              Deadline:{" "}
              {new Date(
                job.deadline
              ).toLocaleDateString()}
            </span>
          )}

          {job.status && (
            <span
              className={`rounded-lg px-3 py-2 capitalize ${
                job.status === "open"
                  ? "bg-green-50 text-green-700"
                  : "bg-red-50 text-red-700"
              }`}
            >
              {job.status}
            </span>
          )}
        </div>

        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-900">
            Job description
          </h2>

          <p className="mt-3 whitespace-pre-line leading-7 text-gray-700">
            {job.description}
          </p>
        </div>

        {job.responsibilities
          ?.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-gray-900">
              Responsibilities
            </h2>

            <ul className="mt-3 list-disc space-y-2 pl-5 text-gray-700">
              {job.responsibilities.map(
                (
                  responsibility,
                  index
                ) => (
                  <li
                    key={`${responsibility}-${index}`}
                  >
                    {responsibility}
                  </li>
                )
              )}
            </ul>
          </div>
        )}

        {job.requiredSkills
          ?.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-gray-900">
              Required skills
            </h2>

            <div className="mt-3 flex flex-wrap gap-2">
              {job.requiredSkills.map(
                (skill) => (
                  <span
                    key={skill}
                    className="rounded-full bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-700"
                  >
                    {skill}
                  </span>
                )
              )}
            </div>
          </div>
        )}

        {job.preferredSkills
          ?.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-gray-900">
              Preferred skills
            </h2>

            <div className="mt-3 flex flex-wrap gap-2">
              {job.preferredSkills.map(
                (skill) => (
                  <span
                    key={skill}
                    className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700"
                  >
                    {skill}
                  </span>
                )
              )}
            </div>
          </div>
        )}

        {job.education && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-gray-900">
              Education
            </h2>

            <p className="mt-3 text-gray-700">
              {job.education}
            </p>
          </div>
        )}

        {(!user ||
          user.role ===
            "jobseeker") && (
          <div className="mt-10 border-t border-gray-200 pt-7">
            <h2 className="text-xl font-semibold text-gray-900">
              Apply for this job
            </h2>

            {!user && (
              <div className="mt-4 rounded-xl border border-indigo-200 bg-indigo-50 p-4">
                <p className="text-sm text-indigo-800">
                  You must log in as a
                  job seeker before
                  applying.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      "/login",
                      {
                        state: {
                          from: `/jobs/${id}`,
                        },
                      }
                    )
                  }
                  className="mt-3 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                >
                  Log in to apply
                </button>
              </div>
            )}

            {user?.role ===
              "jobseeker" && (
              <>
                {checkingCV ? (
                  <p className="mt-4 text-sm text-gray-500">
                    Checking your CV...
                  </p>
                ) : !cv ? (
                  <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
                    <p className="text-sm text-amber-800">
                      You must upload a
                      CV before applying
                      for this job.
                    </p>

                    <Link
                      to="/upload-cv"
                      className="mt-3 inline-flex rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700"
                    >
                      Upload CV
                    </Link>
                  </div>
                ) : alreadyApplied ? (
                  <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-4">
                    <p className="font-medium text-green-800">
                      You have already
                      applied for this
                      job.
                    </p>

                    <Link
                      to="/applications/history"
                      className="mt-3 inline-flex rounded-lg border border-green-300 px-4 py-2 text-sm font-semibold text-green-700 hover:bg-green-100"
                    >
                      View application
                      history
                    </Link>
                  </div>
                ) : deadlinePassed ? (
                  <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    The application
                    deadline has
                    passed.
                  </div>
                ) : jobClosed ? (
                  <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    This job is no
                    longer accepting
                    applications.
                  </div>
                ) : (
                  <form
                    onSubmit={
                      handleApply
                    }
                    className="mt-5"
                  >
                    <label
                      htmlFor="coverLetter"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Cover letter
                      <span className="ml-1 font-normal text-gray-400">
                        optional
                      </span>
                    </label>

                    <textarea
                      id="coverLetter"
                      value={
                        coverLetter
                      }
                      onChange={(
                        event
                      ) =>
                        setCoverLetter(
                          event.target
                            .value
                        )
                      }
                      rows={6}
                      maxLength={2000}
                      className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                      placeholder="Briefly explain why you are suitable for this position..."
                    />

                    <div className="mt-1 text-right text-xs text-gray-400">
                      {
                        coverLetter.length
                      }
                      /2000
                    </div>

                    {applyError && (
                      <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {applyError}
                      </div>
                    )}

                    {success && (
                      <div className="mt-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                        {success}
                      </div>
                    )}

                    <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                      <button
                        type="submit"
                        disabled={
                          applying ||
                          !canApply
                        }
                        className="rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {applying
                          ? "Submitting application..."
                          : "Apply now"}
                      </button>

                      <Link
                        to={`/cv-analysis?jobId=${job._id}`}
                        className="rounded-lg border border-indigo-200 px-6 py-3 text-center font-semibold text-indigo-700 hover:bg-indigo-50"
                      >
                        Analyze CV first
                      </Link>
                    </div>
                  </form>
                )}
              </>
            )}
          </div>
        )}

        {user &&
          user.role !==
            "jobseeker" && (
            <div className="mt-10 rounded-xl bg-gray-50 p-4 text-sm text-gray-600">
              Only job seekers can
              apply for jobs.
            </div>
          )}
      </section>
    </main>
  );
};

export default JobDetails;