import React from "react";
import NavBar from '../components/Home/navbar.jsx'
import Footer from '../components/footer.jsx'
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <>
    <NavBar />
    <div className="flex flex-col items-center justify-center h-[40rem] bg-[#fdfaf3]  text-center px-4">
      {/* bg-gray-100  */}
      <h1 className="text-9xl font-extrabold text-gray-800">404</h1>
      <h2 className="text-3xl font-semibold text-gray-700 mt-4">Oops! Page Not Found</h2>
      <p className="text-gray-500 mt-2">
        The page you are looking for doesn’t exist or has been moved.
      </p>
      {/* <button
        onClick={() => navigate("/")}
        className="mt-6 px-6 py-3 text-black bg-[#fdfaf3] hover:bg-blue-700 transition rounded-md shadow-md"
      >
        Go Home
      </button> */}
    </div>
    <Footer />
    </>
    
  );
};

export default NotFound;
