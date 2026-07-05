import { useState } from "react";

const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    // No backend endpoint yet — this just confirms receipt in the UI.
    setSubmitted(true);
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-16">
      <h1
        className="text-3xl text-gray-900 mb-2"
        style={{ fontFamily: "'Fraunces', serif", fontWeight: 600 }}
      >
        Get in touch
      </h1>
      <p className="text-gray-500 mb-8">
        Questions, feedback, or something not working right? Send us a message.
      </p>

      {submitted ? (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-md p-4 text-sm">
          Thanks — we've received your message.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              name="name"
              required
              value={form.name}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              required
              value={form.email}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
            <textarea
              name="message"
              required
              rows={4}
              value={form.message}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white rounded-md py-2 font-medium hover:bg-indigo-700"
          >
            Send Message
          </button>
        </form>
      )}
    </div>
  );
};

export default Contact;
