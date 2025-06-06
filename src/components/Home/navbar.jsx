import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { Search, User, ShoppingBag, Menu, LogOut } from "lucide-react";
import logo from "../../assets/logo/sparklore_logo.png";
import { useState, useEffect } from "react";
import { isLoggedIn, logout} from "../../utils/api.js";
import Snackbar from '../snackbar.jsx';
import CartDrawer from '../cartDrawer.jsx';

const NavBar = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerCartOpen, setDrawerCartOpen] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [isLoggedInState, setIsLoggedInState] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarType, setSnackbarType] = useState('success');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState("");

  const navItems = [
    { name: "Charm Bar", path: "/charmbar" },
    { name: "Charms", path: "/charms" },
    { name: "Necklaces", path: "/necklaces" },
    { name: "Bracelets", path: "/bracelets" },
    { name: "Earrings", path: "/earrings" },
    { name: "Rings", path: "/rings" },
    { name: "Anklets", path: "/anklets" },
    { name: "Gift Sets", path: "/giftsets" },
  ];

  useEffect(() => {
    setIsInitialLoad(false);

    if (location.state?.showLoginSuccess) {
      setSnackbarMessage('You are logged in');
      setSnackbarType('success');
      setShowSnackbar(true);
      navigate(location.pathname, { replace: true, state: {} });
    }

    const checkAuth = () => {
      const loggedIn = isLoggedIn();
      setIsLoggedInState(loggedIn);
    };

    checkAuth();

    const handleStorageChange = (e) => {
      if (e.key === 'authData') {
        checkAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [location.state]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setShowSearchBar(false);
    }
  };

  const handleCartClick = () => {
    if (!isLoggedInState) {
      setShowLoginPrompt(true);
    } else {
      setDrawerCartOpen(true);
    }
  };

  const handleLogout = () => {
    logout();
    setIsLoggedInState(false);
    setSnackbarMessage('Successfully logged out');
    setSnackbarType('success');
    setShowSnackbar(true);
    setShowLogoutConfirm(false);
    navigate('/');
  };

  return (
    <div className="bg-[#fdfaf3] shadow-md">
      {/* Logout Confirmation */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[999] bg-black/30 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full mx-4 animate-fadeIn">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Logout</h3>
              <p className="text-gray-600 mb-6">Are you sure you want to logout?</p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-[#e6d4a5] text-gray-800 rounded-md hover:bg-[#d4c191] transition"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Snackbar 
        message={snackbarMessage}
        show={showSnackbar}
        onClose={() => setShowSnackbar(false)}
        type={snackbarType}
      />

      {/* Desktop Layout */}
      <div className="hidden md:block">
         <nav className="px-[9rem] pb-[2rem] pt-[1rem] flex items-center justify-between">
          {/* Left Section - Language Toggle */}
          <div className="flex items-center">
            <div className="p-[3rem]"></div>
          </div>

          {/* Center Section - Logo */}
          <div className="flex-1 flex justify-center">
            <Link to="/">
              <img src={logo} alt="Sparklore Logo" className="h-[7rem] object-contain" />
            </Link>
          </div>

          {/* Right Section - Icons */}
          <div className="flex items-center gap-6 text-gray-700">
            <Search className="w-5 h-5 cursor-pointer" onClick={() => setShowSearchBar(!showSearchBar)} />
            {isLoggedInState ? (
              <LogOut 
                className="w-5 h-5 cursor-pointer hover:text-[#b87777]" 
                onClick={() => setShowLogoutConfirm(true)}
                title="Logout"
              />
            ) : (
              <Link to="/login">
                <User className="w-5 h-5 cursor-pointer hover:text-[#b87777]" />
              </Link>
            )}
            <ShoppingBag 
              className="w-5 h-5 cursor-pointer" 
              onClick={handleCartClick} 
            />
          </div>
        </nav>

        {/* Bottom Navigation Links */}
        <div className="px-6 pb-[1rem] pt-[0.1rem]">
          <ul className="flex justify-center md:gap-6 lg:gap-30 uppercase text-xs md:text-lg font-semibold tracking-wider text-center">
            {navItems.map((item, index) => (
              <li key={index}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `pb-2 hover:text-[#b87777] hover:border-b hover:border-[#b87777] transition-colors duration-300 ${
                      isInitialLoad || !isActive ? "text-gray-800" : "text-[#b87777] font-bold border-b-2 border-[#b87777]"
                    }`
                  }
                >
                  {item.name}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
        
        {showSearchBar && (
        <div className="px-[9rem] pt-2 pb-4 animate-fadeIn border-t-2 border-[#e6d4a5]">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="COUPLE BRACELETS...."
              className="w-full bg-[#fdfaf3] border-b border-gray-300 text-gray-700 placeholder-gray-400 text-lg tracking-wide px-12 py-3 focus:outline-none"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
            <button
              type="submit"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 text-xl"
            >
              ✕
            </button>
          </form>
        </div>
      )}
      </div>

      {/* Shopping Cart Drawer - Use Reusable Component! */}
      <CartDrawer
        open={drawerCartOpen}
        onClose={() => setDrawerCartOpen(false)}
        isLoggedIn={isLoggedInState}
        showSnackbar={showSnackbar}
        setShowSnackbar={setShowSnackbar}
        snackbarMessage={snackbarMessage}
        setSnackbarMessage={setSnackbarMessage}
        snackbarType={snackbarType}
        setSnackbarType={setSnackbarType}
      />

      {/* Mobile Layout */}
      <div className="md:hidden">
          <nav className="px-4 py-4 flex items-center justify-between">
            <Link to="/">
              <img src={logo} alt="Sparklore Logo" className="h-12 object-contain" />
            </Link>
            <div className="flex items-center gap-4">
              <Search className="w-5 h-5 cursor-pointer" onClick={() => setShowSearchBar(!showSearchBar)} />
              {isLoggedInState ? (
                <LogOut 
                  className="w-5 h-5 cursor-pointer hover:text-[#b87777]" 
                  onClick={() => setShowLogoutConfirm(true)}
                  title="Logout"
                />
              ) : (
                <Link to="/login">
                  <User className="w-5 h-5 cursor-pointer hover:text-[#b87777]" />
                </Link>
              )}
              <ShoppingBag 
                className="w-5 h-5 cursor-pointer" 
                onClick={handleCartClick} 
              />
              <Menu 
                className="w-6 h-6 cursor-pointer" 
                onClick={() => setDrawerOpen(true)}
              />
            </div>
          </nav>

        {showSearchBar && (
          <div className="px-[0.2rem] pt-2 pb-4 animate-fadeIn border-t-2 border-[#e6d4a5]">
            <div className="relative">
              <input
                type="text"
                placeholder="COUPLE BRACELETS...."
                className="w-full bg-[#fdfaf3] border-b border-gray-300 text-gray-700 placeholder-gray-400 text-lg tracking-wide px-12 py-3 focus:outline-none"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
              <button
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 text-xl"
                onClick={() => setShowSearchBar(false)}
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Drawer */}
      {drawerOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-stone-500/30">
          <div 
            className="absolute right-0 h-full w-4/5 max-w-xs bg-[#fdfaf3] p-4 shadow-lg"
            style={{ animation: 'slideIn 0.3s ease-out' }}
          >
            <div className="flex justify-between items-center mb-8">
              <div className="p-[3rem]"></div>
              <button 
                className="text-gray-700 text-2xl"
                onClick={() => setDrawerOpen(false)}
              >
                ✕
              </button>
            </div>
            
            <ul className="space-y-4 uppercase text-base font-semibold">
              {navItems.map((item, index) => (
                <li key={index}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `block py-2 hover:text-[#b87777] ${
                        isActive ? "text-[#b87777]" : "text-gray-800"
                      }`
                    }
                    onClick={() => setDrawerOpen(false)}
                  >
                    {item.name}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Login Prompt Popup */}
        {showLoginPrompt && (
          <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full mx-4 animate-fadeIn">
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Login Required</h3>
                <p className="text-gray-600 mb-6">
                  You need to be logged in to access your shopping cart.
                </p>
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={() => setShowLoginPrompt(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <Link
                    to="/login"
                    className="px-4 py-2 bg-[#e6d4a5] text-gray-800 rounded-md hover:bg-[#d4c191] transition"
                    onClick={() => setShowLoginPrompt(false)}
                  >
                    Login
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

      <style jsx>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fadeIn {
            animation: fadeIn 0.3s ease-out;
          }
          /* Custom checkbox styling */
          input[type="checkbox"] {
            -webkit-appearance: none;
            appearance: none;
            background-color: #fff;
            margin: 0;
            font: inherit;
            color: #e9d8a6;
            width: 1.25rem;
            height: 1.25rem;
            border: 1px solid #d1d5db;
            border-radius: 0.25rem;
            transform: translateY(-0.075em);
            display: grid;
            place-content: center;
            cursor: pointer;
          }

          input[type="checkbox"]::before {
            content: "";
            width: 0.65rem;
            height: 0.65rem;
            transform: scale(0);
            transition: 120ms transform ease-in-out;
            box-shadow: inset 1rem 1rem #e9d8a6;
            transform-origin: bottom left;
            clip-path: polygon(14% 44%, 0 65%, 50% 100%, 100% 16%, 80% 0%, 43% 62%);
          }

          input[type="checkbox"]:checked::before {
            transform: scale(1);
          }

          input[type="checkbox"]:focus {
            outline: 2px solid #3c3011;
            outline-offset: 2px;
          }

          /* Rest of your animations */
          @keyframes slideIn {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
          }

          @keyframes slideInLeft {
            from { transform: translateX(-100%); }
            to { transform: translateX(0); }
          }

          @keyframes slideInRight {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
          }

          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fadeIn {
            animation: fadeIn 0.3s ease-out;
          }
      `}</style>
    </div>
  );
};

export default NavBar;