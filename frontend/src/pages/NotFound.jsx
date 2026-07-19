const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center px-4">
        <h1 className="text-8xl font-bold text-blue-200">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mt-4">
          Page not found
        </h2>
        <p className="text-gray-400 mt-2 mb-8">
          The page you're looking for doesn't exist.
        </p>
        <a
          href="/"
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Back to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;