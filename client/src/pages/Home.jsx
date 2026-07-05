import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* HERO */}
      <section className="bg-[#12203D] text-white relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 py-20 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p
              className="text-[#E8B84B] text-sm font-semibold tracking-wide mb-4"
              style={{ fontFamily: "'IBM Plex Mono', monospace" }}
            >
              GRADLINK
            </p>
            <h1
              className="text-4xl md:text-5xl leading-tight mb-5"
              style={{ fontFamily: "'Fraunces', serif", fontWeight: 600 }}
            >
              Where your skills meet the right opening.
            </h1>
            <p className="text-[#B7C2D6] text-base mb-8 max-w-md">
              Upload your CV once. GradLink reads your skills and shows you
              exactly how well you match every job — before you apply.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/register"
                className="bg-indigo-600 text-white rounded-md px-6 py-3 text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#12203D] focus:ring-indigo-400 transition"
              >
                I'm looking for a job
              </Link>
              <Link
                to="/register"
                className="border border-white/25 text-white rounded-md px-6 py-3 text-sm font-medium hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#12203D] focus:ring-white/40 transition"
              >
                I'm hiring
              </Link>
            </div>
          </div>

          {/* Signature element: live-looking match preview */}
          <div className="bg-white text-gray-900 rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-auto md:mx-0">
            <p className="text-xs font-medium text-[#5B6B82] mb-3">
              Backend Developer · Acme Corp
            </p>

            <div
              className="flex flex-wrap gap-2 mb-5"
              style={{ fontFamily: "'IBM Plex Mono', monospace" }}
            >
              <span className="text-xs bg-[#2FA793]/10 text-[#1F7A69] px-2 py-1 rounded-md flex items-center gap-1">
                ✓ node.js
              </span>
              <span className="text-xs bg-[#2FA793]/10 text-[#1F7A69] px-2 py-1 rounded-md flex items-center gap-1">
                ✓ mongodb
              </span>
              <span className="text-xs bg-gray-100 text-gray-400 px-2 py-1 rounded-md line-through">
                express
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                <div className="bg-[#2FA793] h-2 rounded-full" style={{ width: "66%" }} />
              </div>
              <span className="text-sm font-semibold text-gray-900">66%</span>
            </div>
            <p className="text-xs text-[#5B6B82] mt-2">match to this role</p>
          </div>
        </div>
      </section>

      {/* TWO PATHS */}
      <section className="bg-[#F7F8FA] py-16">
        <div className="max-w-5xl mx-auto px-4 grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-8">
            <h2
              className="text-xl mb-3 text-gray-900"
              style={{ fontFamily: "'Fraunces', serif", fontWeight: 600 }}
            >
              For graduates
            </h2>
            <ul className="text-sm text-gray-600 space-y-2 mb-6">
              <li>Upload your CV and get your skills read automatically</li>
              <li>See a match percentage before you apply, not after</li>
              <li>Track every application's status in one place</li>
            </ul>
            <Link
              to="/register"
              className="text-sm font-medium text-indigo-600 hover:underline"
            >
              Create a graduate account →
            </Link>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-8">
            <h2
              className="text-xl mb-3 text-gray-900"
              style={{ fontFamily: "'Fraunces', serif", fontWeight: 600 }}
            >
              For recruiters
            </h2>
            <ul className="text-sm text-gray-600 space-y-2 mb-6">
              <li>Post a role and list the skills that actually matter</li>
              <li>See applicants ranked by real skill overlap</li>
              <li>Move candidates through pending, shortlisted, and hired</li>
            </ul>
            <Link
              to="/register"
              className="text-sm font-medium text-indigo-600 hover:underline"
            >
              Create a recruiter account →
            </Link>
          </div>
        </div>
      </section>

      {/* HOW MATCHING WORKS — real sequence, numbering earned */}
      <section className="bg-white py-16 border-t border-gray-100">
        <div className="max-w-5xl mx-auto px-4">
          <h2
            className="text-2xl text-gray-900 mb-10 text-center"
            style={{ fontFamily: "'Fraunces', serif", fontWeight: 600 }}
          >
            How matching works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Upload your CV",
                body: "One PDF. GradLink reads it once and keeps it on file.",
              },
              {
                step: "02",
                title: "We read your skills",
                body: "Skills are normalized, so \"ReactJS\" and \"React.js\" count the same.",
              },
              {
                step: "03",
                title: "See your match",
                body: "Every job shows a match percentage based on required skills.",
              },
            ].map((item) => (
              <div key={item.step}>
                <p
                  className="text-[#E8B84B] text-sm mb-2"
                  style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                >
                  {item.step}
                </p>
                <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#12203D] text-[#B7C2D6] py-8">
        <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="text-sm">GradLink — matched by skill, not by luck.</p>
          <div className="flex gap-5 text-sm">
            <Link to="/jobs" className="hover:text-white">Browse Jobs</Link>
            <Link to="/register" className="hover:text-white">Get Started</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;