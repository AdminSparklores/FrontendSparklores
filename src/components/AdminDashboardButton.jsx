import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { getAuthData, BASE_URL } from "../utils/api.js";

const AdminDashboardButton = () => {
  const [isStaff, setIsStaff] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileView, setIsMobileView] = useState(false);

  // Detect initial screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobileView(window.innerWidth <= 1500); // Matches your existing breakpoint
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);

  useEffect(() => {
    const checkUserPermissions = async () => {
      try {
        const authData = getAuthData();
        if (!authData) {
          setIsStaff(false);
          setIsLoading(false);
          return;
        }

        const response = await fetch(`${BASE_URL}/auth/me/`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authData.token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setIsStaff(!!data.is_staff); // Convert to boolean
        } else {
          setIsStaff(false);
        }
      } catch (error) {
        // console.error('Error fetching user details for admin check:', error);
        setIsStaff(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkUserPermissions();
  }, []); // Empty dependency array means this runs once on mount

  // If still loading or user isn't staff, don't render anything
  if (isLoading || !isStaff) {
    return null;
  }

  // Determine text based on screen size
  const buttonText = isMobileView ? "Admin" : "Admin Dashboard";

  return (
    <Link 
      to="/adminDashboard/dashboard" 
      className="inline-block px-4 py-2 text-sm font-medium text-white bg-[#b87777] rounded shadow-md hover:bg-[#a06666] transition duration-200 focus:outline-none focus:ring-2 focus:ring-[#b87777] focus:ring-opacity-50"
    >
      {buttonText}
    </Link>
  );
};

export default AdminDashboardButton;