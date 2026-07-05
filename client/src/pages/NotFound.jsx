import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="max-w-md mx-auto px-4 py-24 text-center">
      <p
        className="text-6xl text-gray-200 mb-4"
        style={{ fontFamily: "'Fraunces', serif", fontWeight: 700 }}
      >
        404
      </p>
      <h1 className="text-xl font-semibold text-gray-900 mb-2">Page not found</h1>
      <p className="text-gray-500 mb-6">
        The page you're looking for doesn't exist or may have moved.
      </p>
      <Link
        to="/"
        className="inline-block bg-indigo-600 text-white rounded-md px-5 py-2.5 text-sm font-medium hover:bg-indigo-700"
      >
        Back to Home
      </Link>
    </div>
  );
};

export default NotFound;