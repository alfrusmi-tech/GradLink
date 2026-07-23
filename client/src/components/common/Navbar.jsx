import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-5xl mx-auto px-4 flex items-center justify-between h-16">
        <Link to="/" className="text-xl font-bold text-indigo-600">
          GradLink
        </Link>

        <div className="flex items-center gap-6">
          <Link to="/jobs" className="text-sm font-medium text-gray-600 hover:text-gray-900">
            Browse Jobs
          </Link>

          {!user && (
            <>
              <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                Log in
              </Link>
              <Link
                to="/register"
                className="bg-indigo-600 text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-indigo-700"
              >
                Register
              </Link>
            </>
          )}

          {user?.role === "jobseeker" && (
            <>
              <Link to="/jobseeker/dashboard" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                My Applications
              </Link>
              <Link to="/upload-cv" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                My CV
              </Link>
            </>
          )}

          {user?.role === "recruiter" && (
            <>
              <Link to="/recruiter/dashboard" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                Dashboard
              </Link>
              <Link to="/recruiter/company" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                Company
              </Link>
            </>
          )}
          {user?.role === "jobseeker" && (
             <Link
                 to="/applications/history"
                 className="text-sm font-medium hover:text-indigo-200"
             >
               My Applications
            </Link>
          )}

          {user && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">Hi, {user.name.split(" ")[0]}</span>
              <button
                onClick={handleLogout}
                className="text-sm font-medium text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md px-3 py-1.5"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;