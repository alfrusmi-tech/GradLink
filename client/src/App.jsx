
import { Routes, Route } from "react-router-dom";

// Components
import Navbar from "./components/common/Navbar";
import ProtectedRoute from "./components/common/ProtectedRoute";

// Public pages
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Jobs from "./pages/Jobs";
import JobDetails from "./pages/JobDetails";
import NotFound from "./pages/NotFound";

// Shared pages
import Profile from "./pages/Profile";
import Notifications from "./pages/Notifications";

// Job seeker pages
import JobSeekerDashboard from "./pages/JobSeekerDashboard";
import UploadCV from "./pages/UploadCV";
import CVAnalysis from "./pages/CVAnalysis";
import ApplicationHistory from "./pages/ApplicationHistory";

// Recruiter pages
import RecruiterDashboard from "./pages/RecruiterDashboard";
import CompanyProfile from "./pages/CompanyProfile";
import PostJob from "./pages/PostJob";
import JobApplicants from "./pages/JobApplicants";
import EditJob from "./pages/EditJob";

// Admin pages
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/jobs/:id" element={<JobDetails />} />

        {/* Job seeker routes */}
        <Route
          path="/jobseeker/dashboard"
          element={
            <ProtectedRoute allowedRoles={["jobseeker"]}>
              <JobSeekerDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/upload-cv"
          element={
            <ProtectedRoute allowedRoles={["jobseeker"]}>
              <UploadCV />
            </ProtectedRoute>
          }
        />

        <Route
          path="/cv-analysis"
          element={
            <ProtectedRoute allowedRoles={["jobseeker"]}>
              <CVAnalysis />
            </ProtectedRoute>
          }
        />

        <Route
          path="/applications/history"
          element={
            <ProtectedRoute allowedRoles={["jobseeker"]}>
              <ApplicationHistory />
            </ProtectedRoute>
          }
        />

        {/* Recruiter routes */}
        <Route
          path="/recruiter/dashboard"
          element={
            <ProtectedRoute allowedRoles={["recruiter"]}>
              <RecruiterDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/recruiter/company"
          element={
            <ProtectedRoute allowedRoles={["recruiter"]}>
              <CompanyProfile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/recruiter/jobs/new"
          element={
            <ProtectedRoute allowedRoles={["recruiter"]}>
              <PostJob />
            </ProtectedRoute>
          }
        />

        <Route
          path="/recruiter/jobs/:jobId/edit"
          element={
            <ProtectedRoute allowedRoles={["recruiter"]}>
              <EditJob />
            </ProtectedRoute>
          }
        />

        <Route
          path="/recruiter/jobs/:jobId/applicants"
          element={
            <ProtectedRoute allowedRoles={["recruiter", "admin"]}>
              <JobApplicants />
            </ProtectedRoute>
          }
        />

        {/* Admin routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Shared authenticated routes */}
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          }
        />

        {/* Catch-all */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;

