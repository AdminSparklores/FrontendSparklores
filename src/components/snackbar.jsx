// src/components/Snackbar.jsx
import { useEffect } from "react";

const Snackbar = ({ message, show, onClose, type = "success" }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000); // Auto-hide after 3 seconds
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  const bgColor = type === "success" ? "bg-[#e6d4a5]" : "bg-[#f3e6c7]";
  const textColor = "text-[#2d2d2d]";

  return (
    <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 ${bgColor} ${textColor} px-6 py-3 rounded-md shadow-lg animate-fadeIn z-[1000]`}>
      <div className="flex items-center">
        <span className="font-medium">{message}</span>
      </div>
    </div>
  );
};

export default Snackbar;