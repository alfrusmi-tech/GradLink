import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const CompanyProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    description: "",
    industry: "",
    website: "",
    location: "",
    companySize: "",
    foundedYear: "",
  });
  const [existingCompanyId, setExistingCompanyId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // If the recruiter already has a company, fetch and prefill the form
    if (user?.company) {
      api
        .get(`/companies/${user.company}`)
        .then((res) => {
          const c = res.data;
          setExistingCompanyId(c._id);
          setForm({
            name: c.name || "",
            description: c.description || "",
            industry: c.industry || "",
            website: c.website || "",
            location: c.location || "",
            companySize: c.companySize || "",
            foundedYear: c.foundedYear || "",
          });
        })
        .catch(() => setError("Failed to load company profile"))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setSaving(true);

    const payload = {
      ...form,
      foundedYear: form.foundedYear ? Number(form.foundedYear) : undefined,
    };

    try {
      if (existingCompanyId) {
        await api.put(`/companies/${existingCompanyId}`, payload);
      } else {
        await api.post("/companies", payload);
      }
      setSuccess(true);
      setTimeout(() => navigate("/recruiter/dashboard"), 1000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save company profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        {existingCompanyId ? "Edit Company Profile" : "Create Company Profile"}
      </h1>
      <p className="text-sm text-gray-500 mb-6">
        {existingCompanyId
          ? "Update your company details below."
          : "You need a company profile before you can post jobs."}
      </p>

      {error && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 text-sm text-green-700 bg-green-50 border border-green-200 rounded-md p-3">
          Company profile saved! Redirecting...
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
          <input
            name="name"
            required
            value={form.name}
            onChange={handleChange}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            name="description"
            rows={4}
            value={form.description}
            onChange={handleChange}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
            <input
              name="industry"
              value={form.industry}
              onChange={handleChange}
              placeholder="Tech, Finance, Healthcare..."
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input
              name="location"
              value={form.location}
              onChange={handleChange}
              placeholder="Colombo, Sri Lanka"
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company Size</label>
            <input
              name="companySize"
              value={form.companySize}
              onChange={handleChange}
              placeholder="1-10, 50-100, 500+"
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Founded Year</label>
            <input
              type="number"
              name="foundedYear"
              value={form.foundedYear}
              onChange={handleChange}
              placeholder="2015"
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
          <input
            name="website"
            value={form.website}
            onChange={handleChange}
            placeholder="https://example.com"
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-indigo-600 text-white rounded-md py-2 font-medium hover:bg-indigo-700 disabled:opacity-50"
        >
          {saving ? "Saving..." : existingCompanyId ? "Update Company" : "Create Company"}
        </button>
      </form>
    </div>
  );
};

export default CompanyProfile;