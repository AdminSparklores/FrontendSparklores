// components/Admin/AdminRouteGuard.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuthData, fetchUserDetails } from "../../utils/api";

export default function AdminRouteGuard({ children }) {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        const authData = getAuthData();
        if (!authData) {
          navigate('/login');
          return;
        }

        const userDetails = await fetchUserDetails();
        if (!userDetails.is_staff) {
          navigate('/');
          return;
        }

        setIsAuthorized(true);
      } catch (error) {
        console.error('Admin access check failed:', error);
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminAccess();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#b87777]"></div>
      </div>
    );
  }

  return isAuthorized ? children : null;
}