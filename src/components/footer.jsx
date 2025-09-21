import React, { useState } from "react";
import { Instagram, ShoppingBag, Music2, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import Snackbar from "../components/snackbar.jsx";
import { subscribeToNewsletter, isLoggedIn } from "../utils/api.js";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    show: false,
    message: "",
    type: "success"
  });
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const showSnackbar = (message, type = "success") => {
    setSnackbar({ show: true, message, type });
  };

  const hideSnackbar = () => {
    setSnackbar(prev => ({ ...prev, show: false }));
  };

  const handleCloseLoginPrompt = () => setShowLoginPrompt(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    
    // Check if user is logged in
    if (!isLoggedIn()) {
      setShowLoginPrompt(true);
      return;
    }
    
    if (!email) {
      showSnackbar("Please enter your email address", "error");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showSnackbar("Please enter a valid email address", "error");
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await subscribeToNewsletter(email);
      
      if (result.success) {
        showSnackbar("You are now subscribed to our newsletter!", "success");
        setEmail("");
      } else if (result.alreadySubscribed || result.error) {
        // Show the specific error message from the API
        showSnackbar(result.message || "This email is already subscribed to our newsletter", "info");
      } else {
        showSnackbar("Subscription successful", "success");
        setEmail("");
      }
    } catch (error) {
      // console.error("Subscription error:", error);
      showSnackbar(error.message || "Failed to subscribe. Please try again later.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Snackbar 
        message={snackbar.message} 
        show={snackbar.show} 
        onClose={hideSnackbar} 
        type={snackbar.type} 
      />
      
      {/* LOGIN POPUP */}
      {showLoginPrompt && (
        <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full mx-4 animate-fadeIn">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Login Required</h3>
              <p className="text-gray-600 mb-6">
                You need to be logged in to subscribe to our newsletter
              </p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={handleCloseLoginPrompt}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <Link
                  to="/login"
                  className="px-4 py-2 bg-[#e6d4a5] text-gray-800 rounded-md hover:bg-[#d4c191] transition"
                  onClick={handleCloseLoginPrompt}
                >
                  Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <footer className="bg-[#f8f4ed] py-12 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:flex md:justify-between gap-8">
          
          {/* Newsletter Section */}
          <div className="text-center md:text-start">
            <h3 className="text-gray-900 text-lg font-semibold tracking-wide">NEWSLETTER</h3>
            <p className="text-gray-600 text-md mt-2">Sign up to our newsletter to receive exclusive offers</p>
            
            <form onSubmit={handleSubscribe} className="mt-4 max-w-xs mx-auto md:mx-0">
              <input
                type="email"
                placeholder="Your Email"
                className="w-full border border-gray-700 p-2 rounded-md bg-transparent focus:outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
              <button
                type="submit"
                className="w-full bg-[#e5cfa4] text-gray-900 font-semibold py-2 mt-3 rounded-md hover:bg-[#d4bf8f] transition-colors flex items-center justify-center"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    PROCESSING
                  </>
                ) : (
                  "SUBSCRIBE"
                )}
              </button>
            </form>

            <div className="flex justify-center md:justify-start gap-4 mt-6 text-gray-900">
              <a 
                href="https://www.instagram.com/sparklore.official/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-[#b87777] cursor-pointer"
              >
                <Instagram className="w-6 h-6" />
              </a>
              <a 
                href="https://www.tiktok.com/@sparklore.official?_t=ZS-8z8bO3y298i&_r=1" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-[#b87777] cursor-pointer"
              >
                <Music2 className="w-6 h-6" />
              </a>
              <a 
                href="https://id.shp.ee/TrSQKHu" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-[#b87777] cursor-pointer"
              >
                <ShoppingBag className="w-6 h-6" />
              </a>
            </div>
          </div>

          {/* Footer Links */}
          <div className="text-center md:text-start">
            <h3 className="text-gray-900 text-lg font-semibold tracking-wide">FOOTER</h3>
            <ul className="mt-3 space-y-2 text-gray-700">
              <li 
                className="hover:text-[#b87777] cursor-pointer"
                onClick={() => {
                  if (window.location.pathname === '/') {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  } else {
                    window.location.href = '/';
                    setTimeout(() => {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }, 100);
                  }
                }}
              >
                ABOUT US
              </li>
              <Link to="/faq">
                <li className="hover:text-[#b87777] cursor-pointer pt-2">FAQ</li>
              </Link>
              <Link to="/refund">
                <li className="hover:text-[#b87777] cursor-pointer pt-3">REFUND POLICY</li>
              </Link>
              <a href="mailto:sparkloremanagement@gmail.com">
                <li className="hover:text-[#b87777] cursor-pointer pt-3">CONTACT US</li>
              </a>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="max-w-7xl mx-auto mt-12">
          <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-4">
            {/* Copyright - Mobile: Above payment, Desktop: Same row */}
            <div className="text-gray-500 text-sm text-center md:text-right">
              © 2025 - SPARKLORE
            </div>

            {/* Payment Methods - Mobile: Below copyright, Desktop: Same row */}
            {/* <div className="flex flex-wrap justify-center gap-3 w-full md:w-auto">
              <img src={visa} alt="Visa" className="h-6 object-contain" />
              <img src={mastercard} alt="Mastercard" className="h-6 object-contain" />
              <img src={bca} alt="BCA" className="h-6 object-contain" />
              <img src={mandiri} alt="Mandiri" className="h-6 object-contain" />
              <img src={gopay} alt="GoPay" className="h-6 object-contain" />
            </div> */}
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;