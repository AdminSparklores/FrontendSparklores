import React from "react";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 text-center px-4">
      <h1 className="text-9xl font-extrabold text-gray-800">404</h1>
      <h2 className="text-3xl font-semibold text-gray-700 mt-4">Oops! Page Not Found</h2>
      <p className="text-gray-500 mt-2">
        The page you are looking for doesn’t exist or has been moved.
      </p>
      <button
        onClick={() => navigate("/")}
        className="mt-6 px-6 py-3 text-white bg-blue-600 hover:bg-blue-700 transition rounded-md shadow-md"
      >
        Go Home
      </button>
    </div>
  );
};

export default NotFound;
